require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes     = require('./routes/auth');
const urlRoutes      = require('./routes/urls');
const redirectRoutes = require('./routes/redirect');
const errorHandler   = require('./middleware/errorHandler');

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// ── Health check ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date() }));

// ── API routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);

// ── Redirect route (MUST be last — /:shortCode catches everything) ──────────
app.use('/', redirectRoutes);

// ── Global error handler ────────────────────────────────────────────────────
app.use(errorHandler);

// ── DB + Server boot ────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅  MongoDB connected');
    app.listen(PORT, () => console.log(`🚀  Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌  MongoDB connection failed:', err.message);
    process.exit(1);
  });
