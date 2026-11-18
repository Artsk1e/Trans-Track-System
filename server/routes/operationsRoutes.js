const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const GateClerkService = require('../services/gateClerkService');
const ExecutiveService = require('../services/executiveService');

const router = express.Router();

// @route   GET /api/operations/waybills
// @desc    Get waybills via secure Gate Clerk view
// @access  Protected (ADMIN_GATE_CLERK, ADMIN)
router.get(
  '/waybills',
  authenticateToken,
  authorizeRoles('GATE_CLERK', 'ADMIN'),
  async (req, res, next) => {
    try {
      const waybills = await GateClerkService.getWaybills();
      res.json({ success: true, count: waybills.length, data: waybills });
    } catch (err) {
      next(err);
    }
  }
);

// @route   POST /api/operations/check-in
// @desc    Register a new truck arrival at the gate
// @access  Protected (GATE_CLERK, ADMIN)
router.post(
  '/check-in',
  authenticateToken,
  authorizeRoles('GATE_CLERK', 'ADMIN'),
  async (req, res, next) => {
    try {
      const { waybill_id, driver_phone } = req.body;
      const gate_clerk_id = req.user.user_id;

      if (!waybill_id || !driver_phone) {
        return res.status(400).json({ success: false, error: 'Waybill ID and driver phone are required.' });
      }

      const arrival = await GateClerkService.checkInTruck(waybill_id, gate_clerk_id, driver_phone);
      res.status(201).json({ success: true, message: 'Truck checked in successfully', data: arrival });
    } catch (err) {
      next(err);
    }
  }
);

// @route   GET /api/executive/metrics
// @desc    Get live operational capacity metrics for executives
// @access  Protected (EXECUTIVE, ADMIN)
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

module.exports = router;
