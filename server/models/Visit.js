const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
  urlId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Url', required: true },
  ip:        { type: String, default: 'unknown' },
  userAgent: { type: String, default: '' },
  browser:   { type: String, default: 'Unknown' },
  os:        { type: String, default: 'Unknown' },
  device:    { type: String, default: 'desktop' },
  visitedAt: { type: Date, default: Date.now },
});

// Critical index — powers all analytics queries
VisitSchema.index({ urlId: 1, visitedAt: -1 });

module.exports = mongoose.model('Visit', VisitSchema);
