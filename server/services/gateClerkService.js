const pool = require('../db');

// Service for Gate Clerk Role
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
    // Atomic check-in: insert truck_arrivals + update waybill status in one transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Verify waybill exists & is pending gate
      const waybill = await client.query(
        `SELECT w.waybill_id, w.voyage_id, w.cargo_sqft, w.booked_rooms, ws.status_code, v.remaining_sqft, v.remaining_rooms
         FROM waybills w
         JOIN waybill_statuses ws ON w.current_status_id = ws.status_id
         JOIN voyages v ON w.voyage_id = v.voyage_id
         WHERE w.waybill_id = $1
         FOR UPDATE`,
        [waybillId]
      );

      if (waybill.rows.length === 0) {
        throw Object.assign(new Error('Waybill not found'), { statusCode: 404 });
      }

      const wb = waybill.rows[0];
      if (wb.status_code === 'GATE_CHECKED_IN') {
        throw Object.assign(new Error('Truck already checked in for this waybill.'), { statusCode: 409 });
      }

      // Single-entry gate constraint: unique waybill_id in truck_arrivals enforces 1:1
      const insert = await client.query(
        `INSERT INTO truck_arrivals (waybill_id, gate_clerk_id, driver_phone, gate_checkin_time)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
         RETURNING *`,
        [waybillId, gateClerkId, driverPhone]
      );

      // Update waybill status to GATE_CHECKED_IN
      const statusRes = await client.query(
        'SELECT status_id FROM waybill_statuses WHERE status_code = $1',
        ['GATE_CHECKED_IN']
      );
      if (statusRes.rows.length > 0) {
        await client.query(
          `UPDATE waybills SET current_status_id = $1 WHERE waybill_id = $2`,
          [statusRes.rows[0].status_id, waybillId]
        );
        // Log status transition
        await client.query(
          `INSERT INTO waybill_status_log (waybill_id, updated_by_user, new_status_id, remarks)
           VALUES ($1, $2, $3, 'Gate check-in completed')`,
          [waybillId, gateClerkId, statusRes.rows[0].status_id]
        );
      }

      await client.query('COMMIT');
      return insert.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async updateWaybillStatus(waybillId, statusCode, userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const current = await client.query(
        `SELECT current_status_id FROM waybills WHERE waybill_id = $1 FOR UPDATE`,
        [waybillId]
      );
      if (current.rows.length === 0) {
        throw Object.assign(new Error('Waybill not found'), { statusCode: 404 });
      }

      const newStatus = await client.query(
        'SELECT status_id FROM waybill_statuses WHERE status_code = $1',
        [statusCode]
      );
      if (newStatus.rows.length === 0) {
        throw Object.assign(new Error('Invalid status code'), { statusCode: 400 });
      }

      await client.query(
        'UPDATE waybills SET current_status_id = $1 WHERE waybill_id = $2',
        [newStatus.rows[0].status_id, waybillId]
      );

      // Log transition
      await client.query(
        `INSERT INTO waybill_status_log (waybill_id, updated_by_user, previous_status_id, new_status_id, remarks)
         VALUES ($1, $2, $3, $4, $5)`,
        [waybillId, userId, current.rows[0].current_status_id, newStatus.rows[0].status_id, `Status updated to ${statusCode}`]
      );

      await client.query('COMMIT');
      return { waybill_id: waybillId, status: statusCode };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
};

module.exports = GateClerkService;
