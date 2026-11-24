const express = require('express');
const engine = require('../services/autoDeductionEngine');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/waybills
// @desc    Generate a waybill: auto-deducts voyage capacity atomically
// @access  GATE_CLERK, OIC_LOADMASTER, ADMIN
router.post(
  '/',
  authenticateToken,
  authorizeRoles('GATE_CLERK', 'OIC_LOADMASTER', 'ADMIN'),
  async (req, res, next) => {
    try {
      const {
        voyage_id, shipper_id, consignee_id, cargo_description,
        quantity, total_weight_kg, cargo_type, cargo_sqft, booked_rooms,
        freight_charge, vehicle_plate, payment_mode, official_receipt_no,
        payment_status_code, location_name
      } = req.body;

      // Trust-boundary validation
      if (!voyage_id || !shipper_id || !consignee_id || !cargo_type || cargo_sqft == null) {
        return res.status(400).json({
          success: false,
          error: 'voyage_id, shipper_id, consignee_id, cargo_type and cargo_sqft are required.'
        });
      }
      if (cargo_sqft <= 0) {
        return res.status(400).json({ success: false, error: 'cargo_sqft must be greater than 0.' });
      }
      if (booked_rooms != null && booked_rooms < 0) {
        return res.status(400).json({ success: false, error: 'booked_rooms cannot be negative.' });
      }

      const result = await engine.bookWaybill({
        voyage_id, shipper_id, consignee_id, cargo_description,
        quantity, total_weight_kg, cargo_type, cargo_sqft, booked_rooms: booked_rooms || 0,
        freight_charge, vehicle_plate, payment_mode, official_receipt_no,
        payment_status_code, location_name, created_by_user: req.user.user_id
      });

      res.status(201).json({
        success: true,
        message: 'Waybill generated and capacity deducted',
        data: {
          waybill_id: result.waybill.waybill_id,
          status: 'BOOKED',
          remaining_sqft: result.remaining_voyage_capacity.remaining_sqft,
          remaining_rooms: result.remaining_voyage_capacity.remaining_rooms
        }
      });
    } catch (err) {
      if (err.code === '23503') {
        // FK violation: voyage/shipper/consignee does not exist
        return res.status(400).json({ success: false, error: 'Referenced voyage or client does not exist.' });
      }
      if (err.statusCode) {
        return res.status(err.statusCode).json({ success: false, error: err.message });
      }
      next(err);
    }
  }
);

// @route   POST /api/waybills/:id/cancel
// @desc    Cancel a BOOKED waybill: restores voyage capacity atomically
// @access  GATE_CLERK, OIC_LOADMASTER, ADMIN
router.post(
  '/:id/cancel',
  authenticateToken,
  authorizeRoles('GATE_CLERK', 'OIC_LOADMASTER', 'ADMIN'),
  async (req, res, next) => {
    try {
      const result = await engine.cancelWaybill(req.params.id, req.user.user_id);
      res.json({
        success: true,
        message: 'Waybill cancelled and capacity restored',
        data: result
      });
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ success: false, error: err.message });
      }
      next(err);
    }
  }
);

module.exports = router;
