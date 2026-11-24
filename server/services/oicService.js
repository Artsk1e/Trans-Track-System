const pool = require('../db');

// Service for OIC Loadmaster Role
const OicService = {
  async getVoyages(status) {
    // Queries the secure view instead of direct table
    let query = 'SELECT * FROM v_oic_voyage_operations';
    const values = [];
    if (status) {
      query += ' WHERE voyage_status = $1';
      values.push(status);
    }
    query += ' ORDER BY departure ASC';
    const result = await pool.query(query, values);
    return result.rows;
  },

  async getVoyageWaybills(voyageId) {
    // All waybills assigned to a voyage for deck allocation planning
    const query = `
      SELECT
        w.waybill_id AS waybill_number,
        c.company_name AS client_name,
        w.cargo_sqft,
        w.booked_rooms,
        ws.status_name AS status,
        w.vehicle_plate AS truck_plate,
        ta.driver_phone
      FROM waybills w
      JOIN clients c ON w.shipper_id = c.client_id
      JOIN waybill_statuses ws ON w.current_status_id = ws.status_id
      LEFT JOIN truck_arrivals ta ON w.waybill_id = ta.waybill_id
      WHERE w.voyage_id = $1
      ORDER BY w.created_at ASC
    `;
    const result = await pool.query(query, [voyageId]);
    return result.rows;
  },

  // Load waybills onto vessel: marks LOADED + logs transitions, atomic
  async loadWaybills(voyageId, waybillIds, userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const loadedStatus = await client.query(
        'SELECT status_id FROM waybill_statuses WHERE status_code = $1',
        ['LOADED']
      );
      if (loadedStatus.rows.length === 0) {
        throw Object.assign(new Error('LOADED status not found'), { statusCode: 500 });
      }

      const loaded = [];
      for (const wid of waybillIds) {
        const upd = await client.query(
          `UPDATE waybills SET current_status_id = $1
           WHERE waybill_id = $2 AND voyage_id = $3
           RETURNING waybill_id`,
          [loadedStatus.rows[0].status_id, wid, voyageId]
        );
        if (upd.rows.length > 0) {
          await client.query(
            `INSERT INTO waybill_status_log (waybill_id, updated_by_user, new_status_id, remarks)
             VALUES ($1, $2, $3, 'Loaded onto vessel')`,
            [wid, userId, loadedStatus.rows[0].status_id]
          );
          loaded.push(upd.rows[0].waybill_id);
        }
      }

      const capacity = await client.query(
        'SELECT remaining_sqft, remaining_rooms FROM voyages WHERE voyage_id = $1',
        [voyageId]
      );

      await client.query('COMMIT');
      return {
        loaded_count: loaded.length,
        remaining_sqft: capacity.rows[0]?.remaining_sqft,
        remaining_rooms: capacity.rows[0]?.remaining_rooms,
        loaded_waybills: loaded
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async getActiveDrivers() {
    // Drivers currently en route / checked in with latest telemetry
    const query = `
      SELECT DISTINCT ON (ta.arrival_id)
        ta.arrival_id,
        ta.waybill_id,
        ta.driver_phone,
        ta.gate_checkin_time,
        ws.status_name AS status,
        lp.latitude,
        lp.longitude,
        lp.ping_timestamp AS last_ping
      FROM truck_arrivals ta
      JOIN waybills w ON ta.waybill_id = w.waybill_id
      JOIN waybill_statuses ws ON w.current_status_id = ws.status_id
      LEFT JOIN driver_location_pings lp ON lp.arrival_id = ta.arrival_id
      ORDER BY ta.arrival_id, lp.ping_timestamp DESC NULLS LAST
    `;
    const result = await pool.query(query);
    return result.rows;
  }
};

module.exports = OicService;
