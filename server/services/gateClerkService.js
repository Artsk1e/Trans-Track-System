const pool = require('../db');
const Waybill = require('../models/Waybill');
const WaybillStatusLog = require('../models/WaybillStatusLog');
const TruckArrival = require('../models/TruckArrival');
const Voyage = require('../models/Voyage');

// Service for Gate Clerk Role — orchestrates Waybill and TruckArrival domain objects
const GateClerkService = {
  async getWaybills(status) {
    // Queries the secure view instead of direct table
    let query = 'SELECT * FROM v_gate_clerk_waybills';
    const values = [];
    if (status) {
      query += ' WHERE current_status = $1';
      values.push(status);
    }
    const result = await pool.query(query, values);
    return result.rows;
  },

  async checkInTruck(waybillId, gateClerkId, driverPhone) {
    // Atomic check-in: insert truck_arrivals (with GPS token) + update waybill status
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const waybill = await Waybill.findWithStatus(waybillId);
      if (!waybill) {
        throw Object.assign(new Error('Waybill not found'), { statusCode: 404 });
      }
      if (waybill.status_code === 'GATE_CHECKED_IN') {
        throw Object.assign(new Error('Truck already checked in for this waybill.'), { statusCode: 409 });
      }

      // Single-entry gate constraint: unique waybill_id in truck_arrivals enforces 1:1
      const arrival = await TruckArrival.create(client, {
        waybill_id: waybill.waybill_id,
        gate_clerk_id: gateClerkId,
        driver_phone: driverPhone
      });

      // Generate the expiring GPS/SMS tracking token for the driver
      const newStatusId = (await client.query(
        'SELECT status_id FROM waybill_statuses WHERE status_code = $1',
        ['GATE_CHECKED_IN']
      )).rows[0]?.status_id;

      if (newStatusId) {
        await waybill.transitionStatus(
          newStatusId, gateClerkId, 'Port Gate', 'Gate check-in completed', client
        );
      }

      await client.query('COMMIT');

      // Token generation after commit; non-fatal (check-in must not fail because of it)
      try {
        await arrival.generateTrackingToken();
      } catch (tokenErr) {
        console.error('GPS token generation failed:', tokenErr.message);
      }

      return arrival;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async updateWaybillStatus(waybillId, statusCode, userId) {
    const waybill = await Waybill.findWithStatus(waybillId);
    if (!waybill) {
      throw Object.assign(new Error('Waybill not found'), { statusCode: 404 });
    }

    const statusRes = await pool.query(
      'SELECT status_id FROM waybill_statuses WHERE status_code = $1',
      [statusCode]
    );
    if (statusRes.rows.length === 0) {
      throw Object.assign(new Error('Invalid status code'), { statusCode: 400 });
    }

    await waybill.transitionStatus(
      statusRes.rows[0].status_id, userId, null, `Status updated to ${statusCode}`
    );
    return { waybill_id: waybillId, status: statusCode };
  }
};

module.exports = GateClerkService;
