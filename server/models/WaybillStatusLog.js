const pool = require('../db');

class WaybillStatusLog {
  constructor(row = {}) {
    Object.assign(this, row);
  }

  static async create(client, { waybill_id, updated_by_user, previous_status_id, new_status_id, location_name, remarks }) {
    const conn = client || pool;
    const r = await conn.query(
      `INSERT INTO waybill_status_log (waybill_id, updated_by_user, previous_status_id, new_status_id, location_name, remarks)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [waybill_id, updated_by_user, previous_status_id || null, new_status_id, location_name || null, remarks || null]
    );
    return new WaybillStatusLog(r.rows[0]);
  }

  static async historyFor(waybillId) {
    const r = await pool.query(
      `SELECT sl.*, ws.status_name AS new_status_name
       FROM waybill_status_log sl
       JOIN waybill_statuses ws ON sl.new_status_id = ws.status_id
       WHERE sl.waybill_id = $1
       ORDER BY sl.logged_at ASC`,
      [waybillId]
    );
    return r.rows.map((row) => new WaybillStatusLog(row));
  }
}

module.exports = WaybillStatusLog;
