const express = require('express');
const AdminService = require('../services/adminService');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/admin/users
// @desc    List all users
// @access  ADMIN
router.get(
  '/users',
  authenticateToken,
  authorizeRoles('ADMIN'),
  async (req, res, next) => {
    try {
      const users = await AdminService.getUsers();
      res.json({ success: true, count: users.length, data: users });
    } catch (err) {
      next(err);
    }
  }
);

// @route   POST /api/admin/users
// @desc    Create a user
// @access  ADMIN
router.post(
  '/users',
  authenticateToken,
  authorizeRoles('ADMIN'),
  async (req, res, next) => {
    try {
      const { username, password, first_name, last_name, role } = req.body;
      if (!username || !password || !first_name || !last_name || !role) {
        return res.status(400).json({ success: false, error: 'username, password, first_name, last_name, role are required.' });
      }
      const user = await AdminService.createUser({ username, password, first_name, last_name, role });
      res.status(201).json({ success: true, data: { id: user.user_id, username: user.username, role: user.role }, message: 'User created successfully' });
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ success: false, error: err.message });
      }
      next(err);
    }
  }
);

// @route   GET /api/admin/audit-logs
// @desc    Query audit logs (optional ?table= &limit=)
// @access  ADMIN
router.get(
  '/audit-logs',
  authenticateToken,
  authorizeRoles('ADMIN'),
  async (req, res, next) => {
    try {
      const logs = await AdminService.getAuditLogs(req.query.table, Number(req.query.limit) || 50);
      res.json({ success: true, count: logs.length, data: logs });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
