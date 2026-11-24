const express = require('express');
const GateClerkService = require('../services/gateClerkService');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/gate/waybills
// @desc    Get waybills for gate processing (optional ?status= filter)
// @access  GATE_CLERK, ADMIN
router.get(
  '/waybills',
  authenticateToken,
  authorizeRoles('GATE_CLERK', 'ADMIN'),
  async (req, res, next) => {
    try {
      const waybills = await GateClerkService.getWaybills(req.query.status);
      res.json({ success: true, count: waybills.length, data: waybills });
    } catch (err) {
      next(err);
    }
  }
);

// @route   POST /api/gate/check-in
// @desc    Register a new truck arrival at the gate (single-entry constraint)
// @access  GATE_CLERK, ADMIN
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
      if (err.code === '23505') {
        // unique_violation: duplicate check-in (single-entry gate constraint)
        return res.status(409).json({ success: false, error: 'Truck already checked in for this waybill.' });
      }
      if (err.statusCode) {
        return res.status(err.statusCode).json({ success: false, error: err.message });
      }
      next(err);
    }
  }
);

// @route   PATCH /api/gate/waybills/:id/status
// @desc    Update a waybill status
// @access  GATE_CLERK, ADMIN
router.patch(
  '/waybills/:id/status',
  authenticateToken,
  authorizeRoles('GATE_CLERK', 'ADMIN'),
  async (req, res, next) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, error: 'Status is required.' });
      }
      const result = await GateClerkService.updateWaybillStatus(req.params.id, status, req.user.user_id);
      res.json({ success: true, data: result });
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ success: false, error: err.message });
      }
      next(err);
    }
  }
);

module.exports = router;
