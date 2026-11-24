const crypto = require('crypto');
const pool = require('../db');

const TOKEN_TTL_HOURS = 48; // expiring SMS/GPS link per business process doc

class TruckArrival {
  constructor(row = {}) {
    Object.assign(this, row);
  }

  static async find(arrivalId) {
    const r = await pool.query('SELECT * FROM truck_arrivals WHERE arrival_id = $1', [arrivalId]);
    return r.rows[0] ? new TruckArrival(r.rows[0]) : null;
  }

  // create(client, data) — accepts a transaction client for atomic gate check-in
  static async create(client, { waybill_id, gate_clerk_id, driver_phone, eta_timestamp }) {
    const conn = client || pool;
    const r = await conn.query(
      `INSERT INTO truck_arrivals (waybill_id, gate_clerk_id, driver_phone, eta_timestamp, gate_checkin_time)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING *`,
      [waybill_id, gate_clerk_id, driver_phone, eta_timestamp || null]
    );
    return new TruckArrival(r.rows[0]);
  }

  // generateTrackingToken() from the class diagram — expiring temp GPS/SMS link
  async generateTrackingToken() {
    const token = crypto.randomBytes(24).toString('hex');
    const r = await pool.query(
      `UPDATE truck_arrivals
       SET temp_gps_token = $1,
           token_expires_at = CURRENT_TIMESTAMP + INTERVAL '${TOKEN_TTL_HOURS} hours'
       WHERE arrival_id = $2
       RETURNING temp_gps_token, token_expires_at`,
      [token, this.arrival_id]
    );
    Object.assign(this, r.rows[0]);
    return this;
  }

  // isTokenValid() from the class diagram — instance check against expiry
  isTokenValid() {
    if (!this.temp_gps_token) return false;
    return new Date(this.token_expires_at) > new Date();
  }

  // Token lookup for public driver links; returns arrival only if token is live
  static async findByValidToken(token) {
    const r = await pool.query(
      `SELECT * FROM truck_arrivals
       WHERE temp_gps_token = $1
         AND token_expires_at > CURRENT_TIMESTAMP`,
      [token]
    );
    return r.rows[0] ? new TruckArrival(r.rows[0]) : null;
  }
}

module.exports = TruckArrival;
