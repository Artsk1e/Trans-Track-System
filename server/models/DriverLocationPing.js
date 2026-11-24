const pool = require('../db');

class DriverLocationPing {
  constructor(row = {}) {
    Object.assign(this, row);
  }

  static async find(pingId) {
    const r = await pool.query('SELECT * FROM driver_location_pings WHERE ping_id = $1', [pingId]);
    return r.rows[0] ? new DriverLocationPing(r.rows[0]) : null;
  }

  // create(client, data) — BASE telemetry: no transaction needed, failures are non-fatal
  static async create(client, { arrival_id, ping_type, latitude, longitude, raw_sms_text }) {
    const conn = client || pool;
    const r = await conn.query(
      `INSERT INTO driver_location_pings (arrival_id, ping_type, latitude, longitude, raw_sms_text)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [arrival_id, ping_type, latitude ?? null, longitude ?? null, raw_sms_text || null]
    );
    return new DriverLocationPing(r.rows[0]);
  }

  static async latestForArrival(arrivalId) {
    const r = await pool.query(
      'SELECT * FROM driver_location_pings WHERE arrival_id = $1 ORDER BY ping_timestamp DESC LIMIT 1',
      [arrivalId]
    );
    return r.rows[0] ? new DriverLocationPing(r.rows[0]) : null;
  }

  // processSmsReply(smsText) from the class diagram.
  // Parses a 2-way SMS fallback reply into coordinates.
  // Accepted formats: "8.2280,124.2452", "LAT 8.2280 LNG 124.2452", "lat:8.2280 long:124.2452"
  static processSmsReply(smsText) {
    if (typeof smsText !== 'string') return null;
    const num = '(-?\\d{1,3}(?:\\.\\d+)?)';
    const patterns = [
      new RegExp(`lat[^0-9-]*${num}[^0-9-]*(?:lng|lon|long)[^0-9-]*${num}`, 'i'),
      new RegExp(`${num}\\s*,\\s*${num}`),
      new RegExp(`^\\s*${num}\\s+${num}\\s*$`)
    ];
    for (const p of patterns) {
      const m = smsText.match(p);
      if (m) {
        const latitude = parseFloat(m[1]);
        const longitude = parseFloat(m[2]);
        if (Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180) {
          return { latitude, longitude };
        }
        return null;
      }
    }
    return null;
  }
}

module.exports = DriverLocationPing;
