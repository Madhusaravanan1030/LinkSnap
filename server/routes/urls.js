const express  = require('express');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

const authMiddleware      = require('../middleware/authMiddleware');
const Url                 = require('../models/Url');
const Visit               = require('../models/Visit');
const { generateUniqueCode } = require('../services/shortCodeService');
const { getDailyTrend }   = require('../services/analyticsService');

const router = express.Router();

// All URL routes require authentication
router.use(authMiddleware);

// ── Helper — attach computed fields ────────────────────────────────────────
function formatUrl(urlDoc) {
  const obj = urlDoc.toObject ? urlDoc.toObject() : urlDoc;
  return {
    ...obj,
    shortUrl:  `${process.env.BASE_URL}/${obj.shortCode}`,
    isExpired: obj.expiresAt ? new Date(obj.expiresAt) < new Date() : false,
  };
}

// ── GET /api/urls ───────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const urls = await Url.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(urls.map(formatUrl));
  } catch (err) {
    next(err);
  }
});

// ── POST /api/urls ──────────────────────────────────────────────────────────
router.post(
  '/',
  [
    body('originalUrl').isURL({ require_protocol: true }).withMessage('Enter a valid URL (include https://)'),
    body('customAlias')
      .optional()
      .trim()
      .isAlphanumeric('en-US', { ignore: '-_' })
      .isLength({ min: 3, max: 30 })
      .withMessage('Alias must be 3–30 alphanumeric characters (hyphens allowed)'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { originalUrl, customAlias, expiresAt } = req.body;

      let shortCode;

      if (customAlias) {
        const taken = await Url.exists({ shortCode: customAlias });
        if (taken) return res.status(409).json({ error: 'This alias is already taken. Try another.' });
        shortCode = customAlias;
      } else {
        shortCode = await generateUniqueCode();
      }

      const urlDoc = await Url.create({
        userId:      req.user.userId,
        originalUrl,
        shortCode,
        expiresAt:   expiresAt ? new Date(expiresAt) : null,
      });

      res.status(201).json(formatUrl(urlDoc));
    } catch (err) {
      next(err);
    }
  }
);

// ── DELETE /api/urls/:id ────────────────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!url) return res.status(404).json({ error: 'URL not found' });

    await Url.deleteOne({ _id: url._id });
    await Visit.deleteMany({ urlId: url._id }); // cascade delete analytics

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/urls/:id — edit destination URL ──────────────────────────────
router.patch(
  '/:id',
  [body('originalUrl').isURL({ require_protocol: true }).withMessage('Enter a valid URL')],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const url = await Url.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.userId },
        { originalUrl: req.body.originalUrl },
        { new: true }
      );
      if (!url) return res.status(404).json({ error: 'URL not found' });

      res.json(formatUrl(url));
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /api/urls/:id/analytics ─────────────────────────────────────────────
router.get('/:id/analytics', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'URL not found' });
    }

    const url = await Url.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!url) return res.status(404).json({ error: 'URL not found' });

    const urlObjId = url._id;

    const [totalClicks, lastVisit, recentVisits, dailyTrend] = await Promise.all([
      Visit.countDocuments({ urlId: urlObjId }),
      Visit.findOne({ urlId: urlObjId }).sort({ visitedAt: -1 }).lean(),
      Visit.find({ urlId: urlObjId }).sort({ visitedAt: -1 }).limit(20).lean(),
      getDailyTrend(urlObjId, 30),
    ]);

    res.json({
      url:           formatUrl(url),
      totalClicks,
      lastVisitedAt: lastVisit?.visitedAt || null,
      recentVisits,
      dailyTrend,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
