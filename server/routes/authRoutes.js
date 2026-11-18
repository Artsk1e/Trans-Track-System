const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_trans_track';

// @route   POST /api/auth/register
// @desc    Register a new user (Restricted or Admin utility)
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

      // Remove password hash before returning response
      delete newUser.password_hash;

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
  [
    body('username', 'Username is required').not().isEmpty(),
    body('password', 'Password is required').exists()
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { username, password } = req.body;

      // Find user by username
      const user = await User.findByUsername(username);
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

module.exports = router;
