const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_trans_track';

// @route   POST /api/auth/register
// @desc    Register a new user (Admin / Restricted utility)
// @access  Public / Protected
router.post(
  '/register',
  [
    body('username', 'Username is required').not().isEmpty(),
    body('password', 'Password must be 6+ characters long').isLength({ min: 6 }),
    body('first_name', 'First name is required').not().isEmpty(),
    body('last_name', 'Last name is required').not().isEmpty(),
    body('role', 'Valid role required').isIn(['GATE_CLERK', 'OIC_LOADMASTER', 'EXECUTIVE', 'ADMIN'])
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { username, password, first_name, last_name, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findByUsername(username);
      if (existingUser) {
        return res.status(400).json({ success: false, error: 'Username is already taken.' });
      }

      // Hash password securely
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // Create user
      const newUser = await User.create({
        username,
        password_hash,
        first_name,
        last_name,
        role
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: newUser
      });
    } catch (err) {
      next(err);
    }
  }
);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  async (req, res, next) => {
    try {
      // Support username or email param
      const identifier = req.body.username || req.body.email;
      const { password } = req.body;

      if (!identifier || !password) {
        return res.status(400).json({ success: false, error: 'Username/Email and password are required.' });
      }

      // Find user by username
      const user = await User.findByUsername(identifier);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid credentials.' });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Invalid credentials.' });
      }

      // Create JWT Payload
      const payload = {
        user_id: user.user_id,
        username: user.username,
        role: user.role
      };

      // Sign Token (Expires in 8 hours for shift convenience)
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

      res.json({
        success: true,
        message: 'Login successful',
        token,
        data: {
          accessToken: token,
          user: {
            id: user.user_id,
            user_id: user.user_id,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            full_name: `${user.first_name} ${user.last_name}`,
            role: user.role
          }
        },
        user: {
          user_id: user.user_id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', (req, res) => {
  const { refreshToken, token } = req.body;
  const currentToken = refreshToken || token;
  if (!currentToken) {
    return res.status(400).json({ success: false, error: 'Token is required' });
  }

  try {
    const decoded = jwt.verify(currentToken, JWT_SECRET, { ignoreExpiration: true });
    const newPayload = {
      user_id: decoded.user_id,
      username: decoded.username,
      role: decoded.role
    };
    const newToken = jwt.sign(newPayload, JWT_SECRET, { expiresIn: '8h' });
    res.json({
      success: true,
      data: { accessToken: newToken },
      token: newToken
    });
  } catch (err) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Protected
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.user_id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
