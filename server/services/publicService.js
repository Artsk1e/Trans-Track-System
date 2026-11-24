const pool = require('../db');

// Service for public (no-auth) tracking — exposes minimal waybill info
const PublicService = {
  async getWaybillByNumber(waybillNumber) {
    const query = `
      SELECT
        w.waybill_id AS waybill_number,
        ws.status_name AS status,
        c.company_name AS client_name,
        v.voyage_number,
        ves.vessel_name,
        p1.port_name AS origin_port,
        p2.port_name AS destination_port,
        w.cargo_sqft,
        w.booked_rooms,
        v.departure AS etd,
        v.estimated_arrival AS eta
      FROM waybills w
      JOIN clients c ON w.shipper_id = c.client_id
      JOIN waybill_statuses ws ON w.current_status_id = ws.status_id
      JOIN voyages v ON w.voyage_id = v.voyage_id
      JOIN vessels ves ON v.vessel_id = ves.vessel_id
      JOIN ports p1 ON v.origin_port_id = p1.port_id
      JOIN ports p2 ON v.destination_port_id = p2.port_id
      WHERE w.waybill_id = $1
    `;
    const result = await pool.query(query, [waybillNumber]);
    if (result.rows.length === 0) return null;

    const history = await pool.query(
      `SELECT ws.status_name AS status, sl.location_name, sl.remarks, sl.logged_at
       FROM waybill_status_log sl
       JOIN waybill_statuses ws ON sl.new_status_id = ws.status_id
       WHERE sl.waybill_id = $1
       ORDER BY sl.logged_at ASC`,
      [waybillNumber]
    );

    return { ...result.rows[0], status_history: history.rows };
  }
};

module.exports = PublicService;
