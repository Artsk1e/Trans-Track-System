const express = require('express');
const PublicService = require('../services/publicService');
const TruckArrival = require('../models/TruckArrival');
const DriverLocationPing = require('../models/DriverLocationPing');
const pool = require('../db');

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

// @route   GET /api/public/track/:token
// @desc    Driver tracking link target (expiring temp token from gate check-in)
// @access  Public (token-gated)
router.get('/track/:token', async (req, res, next) => {
  try {
    const arrival = await TruckArrival.findByValidToken(req.params.token);
    if (!arrival) {
      return res.status(404).json({ success: false, error: 'Tracking link is invalid or has expired.' });
    }

    const info = await pool.query(
      `SELECT w.waybill_id, ws.status_name AS status, v.voyage_number,
              ves.vessel_name, p1.port_name AS origin_port, p2.port_name AS destination_port,
              v.departure AS etd, v.estimated_arrival AS eta
       FROM waybills w
       JOIN waybill_statuses ws ON w.current_status_id = ws.status_id
       JOIN voyages v ON w.voyage_id = v.voyage_id
       JOIN vessels ves ON v.vessel_id = ves.vessel_id
       JOIN ports p1 ON v.origin_port_id = p1.port_id
       JOIN ports p2 ON v.destination_port_id = p2.port_id
       WHERE w.waybill_id = $1`,
      [arrival.waybill_id]
    );

    const lastPing = await DriverLocationPing.latestForArrival(arrival.arrival_id);

    res.json({
      success: true,
      data: {
        arrival_id: arrival.arrival_id,
        token_valid_until: arrival.token_expires_at,
        waybill: info.rows[0] || null,
        last_ping: lastPing || null
      }
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/public/track/:token/pings
// @desc    Ingest driver telemetry: browser GPS ({latitude, longitude}) or SMS reply ({sms_text})
// @access  Public (token-gated)
router.post('/track/:token/pings', async (req, res, next) => {
  try {
    const arrival = await TruckArrival.findByValidToken(req.params.token);
    if (!arrival) {
      return res.status(404).json({ success: false, error: 'Tracking link is invalid or has expired.' });
    }

    const { latitude, longitude, sms_text: smsText } = req.body;
    let pingType;
    let lat = latitude;
    let lng = longitude;
    let raw = null;

    if (smsText !== undefined) {
      // 2-way SMS fallback: parse the reply text into coordinates
      const parsed = DriverLocationPing.processSmsReply(smsText);
      if (!parsed) {
        return res.status(400).json({ success: false, error: 'Could not parse coordinates from SMS reply. Send: "LAT <value> LNG <value>"' });
      }
      pingType = 'SMS_FALLBACK';
      lat = parsed.latitude;
      lng = parsed.longitude;
      raw = smsText;
    } else {
      if (typeof lat !== 'number' || typeof lng !== 'number' || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
        return res.status(400).json({ success: false, error: 'Numeric latitude (-90..90) and longitude (-180..180) are required.' });
      }
      pingType = 'GPS_LINK';
    }

    // BASE telemetry: single insert, no transaction, failures are non-fatal to core tables
    const ping = await DriverLocationPing.create(null, {
      arrival_id: arrival.arrival_id,
      ping_type: pingType,
      latitude: lat,
      longitude: lng,
      raw_sms_text: raw
    });

    res.status(201).json({ success: true, data: { ping_id: ping.ping_id, ping_type: ping.ping_type }, message: 'Location received' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
