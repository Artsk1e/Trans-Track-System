const express = require('express');
const ExecutiveService = require('../services/executiveService');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/executive/summary
// @desc    Executive dashboard summary (read-only)
// @access  EXECUTIVE, ADMIN
router.get(
  '/summary',
  authenticateToken,
  authorizeRoles('EXECUTIVE', 'ADMIN'),
  async (req, res, next) => {
    try {
      const metrics = await ExecutiveService.getOperationalMetrics();
      res.json({ success: true, data: metrics });
    } catch (err) {
      next(err);
    }
  }
);

// Legacy alias from previous /api/operations/metrics
router.get(
  '/metrics',
  authenticateToken,
  authorizeRoles('EXECUTIVE', 'ADMIN'),
  async (req, res, next) => {
    try {
      const metrics = await ExecutiveService.getOperationalMetrics();
      res.json({ success: true, data: metrics });
    } catch (err) {
      next(err);
    }
  }
);

// @route   GET /api/executive/voyages/:id/capacity
// @desc    Capacity drill-down per voyage
// @access  EXECUTIVE, ADMIN
router.get(
  '/voyages/:id/capacity',
  authenticateToken,
  authorizeRoles('EXECUTIVE', 'ADMIN'),
  async (req, res, next) => {
    try {
      const capacity = await ExecutiveService.getVoyageCapacity(req.params.id);
      if (!capacity) {
        return res.status(404).json({ success: false, error: 'Voyage not found' });
      }
      res.json({ success: true, data: capacity });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
