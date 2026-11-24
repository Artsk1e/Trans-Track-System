const express = require('express');
const PublicService = require('../services/publicService');

const router = express.Router();

// @route   GET /api/public/waybills/:waybillNumber
// @desc    Public client tracking (no auth)
// @access  Public
router.get('/waybills/:waybillNumber', async (req, res, next) => {
  try {
    const waybill = await PublicService.getWaybillByNumber(req.params.waybillNumber);
    if (!waybill) {
      return res.status(404).json({ success: false, error: 'Waybill not found' });
    }
    res.json({ success: true, data: waybill });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
