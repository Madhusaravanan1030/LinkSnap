const express = require('express');
const Url     = require('../models/Url');
const { logVisit } = require('../services/analyticsService');

const router = express.Router();

// ── GET /:shortCode ─────────────────────────────────────────────────────────
// IMPORTANT: This route is mounted last in index.js so it doesn't shadow /api/*
router.get('/:shortCode', async (req, res) => {
  const { shortCode } = req.params;

  // Ignore favicon and other browser auto-requests
  if (shortCode === 'favicon.ico') return res.status(204).end();

  try {
    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).send(`
        <!DOCTYPE html><html><head><title>404 — LinkSnap</title></head>
        <body style="font-family:system-ui;background:#12151a;color:#f0eeec;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
          <div style="text-align:center;">
            <div style="font-size:64px;font-weight:500;color:#D4537E;">404</div>
            <div style="font-size:20px;margin:8px 0 4px;">Link not found</div>
            <div style="color:#9a9794;font-size:14px;">This short link doesn't exist or was removed.</div>
          </div>
        </body></html>
      `);
    }

    // Expiry check
    if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
      return res.status(410).send(`
        <!DOCTYPE html><html><head><title>410 — LinkSnap</title></head>
        <body style="font-family:system-ui;background:#12151a;color:#f0eeec;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
          <div style="text-align:center;">
            <div style="font-size:64px;font-weight:500;color:#F09595;">410</div>
            <div style="font-size:20px;margin:8px 0 4px;">Link expired</div>
            <div style="color:#9a9794;font-size:14px;">Expired on ${new Date(url.expiresAt).toLocaleDateString()}.</div>
          </div>
        </body></html>
      `);
    }

    // ── Fire-and-forget — do NOT await these, redirect immediately ──────────
    logVisit(url._id, req).catch((e) => console.error('logVisit error:', e));
    Url.updateOne({ _id: url._id }, { $inc: { clickCount: 1 } }).exec();

    // 302 (not 301) — keeps analytics accurate and allows URL editing to work
    res.redirect(302, url.originalUrl);

  } catch (err) {
    console.error('Redirect error:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
