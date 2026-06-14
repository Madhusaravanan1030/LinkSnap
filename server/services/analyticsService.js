const UAParser = require('ua-parser-js');
const Visit    = require('../models/Visit');

/**
 * Logs a visit document for a given URL.
 * Called fire-and-forget from the redirect route (no await).
 */
async function logVisit(urlId, req) {
  const parser  = new UAParser(req.headers['user-agent'] || '');
  const browser = parser.getBrowser().name  || 'Unknown';
  const os      = parser.getOS().name       || 'Unknown';
  const device  = parser.getDevice().type   || 'desktop';

  await Visit.create({
    urlId,
    ip:        req.ip || 'unknown',
    userAgent: req.headers['user-agent'] || '',
    browser,
    os,
    device,
    visitedAt: new Date(),
  });
}

/**
 * Returns daily click counts for the last `days` days.
 * Uses MongoDB aggregation — never pulls all visit docs to Node.
 *
 * Returns: [{ date: "2026-06-01", clicks: 14 }, ...]
 * Days with 0 clicks are omitted (frontend fills the gaps).
 */
async function getDailyTrend(urlId, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const result = await Visit.aggregate([
    { $match: { urlId, visitedAt: { $gte: since } } },
    {
      $group: {
        _id: {
          year:  { $year:  '$visitedAt' },
          month: { $month: '$visitedAt' },
          day:   { $dayOfMonth: '$visitedAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);

  return result.map((r) => ({
    date: `${r._id.year}-${String(r._id.month).padStart(2, '0')}-${String(r._id.day).padStart(2, '0')}`,
    clicks: r.count,
  }));
}

module.exports = { logVisit, getDailyTrend };
