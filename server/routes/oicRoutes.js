const express = require('express');
const OicService = require('../services/oicService');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/oic/voyages
// @desc    Get voyages with capacity for deck allocation
// @access  OIC_LOADMASTER, ADMIN
router.get(
  '/voyages',
  authenticateToken,
  authorizeRoles('OIC_LOADMASTER', 'ADMIN'),
  async (req, res, next) => {
    try {
      const voyages = await OicService.getVoyages(req.query.status);
      res.json({ success: true, count: voyages.length, data: voyages });
    } catch (err) {
      next(err);
    }
  }
);

// @route   GET /api/oic/voyages/:id/waybills
// @desc    Get waybills assigned to a voyage
// @access  OIC_LOADMASTER, ADMIN
router.get(
  '/voyages/:id/waybills',
  authenticateToken,
  authorizeRoles('OIC_LOADMASTER', 'ADMIN'),
  async (req, res, next) => {
    try {
      const waybills = await OicService.getVoyageWaybills(req.params.id);
      res.json({ success: true, count: waybills.length, data: waybills });
    } catch (err) {
      next(err);
    }
  }
);

// @route   POST /api/oic/voyages/:id/load
// @desc    Mark waybills as loaded onto the vessel
// @access  OIC_LOADMASTER, ADMIN
router.post(
  '/voyages/:id/load',
  authenticateToken,
  authorizeRoles('OIC_LOADMASTER', 'ADMIN'),
  async (req, res, next) => {
    try {
      const { waybill_ids } = req.body;
      if (!Array.isArray(waybill_ids) || waybill_ids.length === 0) {
        return res.status(400).json({ success: false, error: 'waybill_ids array is required.' });
      }
      const result = await OicService.loadWaybills(req.params.id, waybill_ids, req.user.user_id);
      res.json({ success: true, data: result, message: `${result.loaded_count} waybill(s) loaded.` });
    } catch (err) {
      next(err);
    }
  }
);

// @route   GET /api/oic/drivers/active
// @desc    Get drivers with latest telemetry
// @access  OIC_LOADMASTER, ADMIN
router.get(
  '/drivers/active',
  authenticateToken,
  authorizeRoles('OIC_LOADMASTER', 'ADMIN'),
  async (req, res, next) => {
    try {
      const drivers = await OicService.getActiveDrivers();
      res.json({ success: true, count: drivers.length, data: drivers });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
