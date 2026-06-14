const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User     = require('../models/User');

const router = express.Router();

// ── Helper ──────────────────────────────────────────────────────────────────
function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// ── POST /api/auth/register ─────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, password } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await User.create({ name, email, passwordHash });
      const token = signToken(user._id);

      res.status(201).json({
        token,
        user: { id: user._id, name: user.name, email: user.email },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ── POST /api/auth/login ────────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        // Generic message — don't reveal whether email exists
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = signToken(user._id);

      res.json({
        token,
        user: { id: user._id, name: user.name, email: user.email },
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
