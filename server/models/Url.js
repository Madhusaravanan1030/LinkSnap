const mongoose = require('mongoose');

const UrlSchema = new mongoose.Schema(
  {
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    originalUrl: { type: String, required: true },
    shortCode:   { type: String, required: true, unique: true, trim: true },
    clickCount:  { type: Number, default: 0 },
    expiresAt:   { type: Date, default: null },
  },
  { timestamps: true }
);

// Fast redirect lookup
UrlSchema.index({ shortCode: 1 });
// Fast per-user dashboard listing
UrlSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Url', UrlSchema);
