const { BaseAuditEntity } = require('./baseEntity');
const pool = require('../db');
const WaybillStatusLog = require('./WaybillStatusLog');

// Freight rates (PHP) — demo domain rule; per sqft except containers (flat per unit)
const FREIGHT_RATES = {
  ROLLING_CARGO: 150,
  LOOSE_CARGO: 120,
  CONTAINER: 15000
};
const ROOM_RATE = 500;

class Waybill extends BaseAuditEntity {
  static async find(waybillId) {
    const r = await pool.query('SELECT * FROM waybills WHERE waybill_id = $1', [waybillId]);
    return r.rows[0] ? new Waybill(r.rows[0]) : null;
  }

  static async findWithStatus(waybillId) {
    const r = await pool.query(
      `SELECT w.*, ws.status_code, ws.status_id AS status_id_ref
       FROM waybills w
       JOIN waybill_statuses ws ON w.current_status_id = ws.status_id
       WHERE w.waybill_id = $1`,
      [waybillId]
    );
    return r.rows[0] ? new Waybill(r.rows[0]) : null;
  }

  // Generates a sequential waybill ID: WB-YYYY-NNNNNN
  static async generateWaybillId(client) {
    const year = new Date().getFullYear();
    const prefix = `WB-${year}-`;
    const res = await client.query(
      'SELECT COALESCE(MAX(waybill_id), $1) AS last FROM waybills WHERE waybill_id LIKE $2',
      [prefix + '000000', prefix + '%']
    );
    const lastNum = parseInt(res.rows[0].last.slice(-6), 10) || 0;
    return prefix + String(lastNum + 1).padStart(6, '0');
  }

  // create(client, data) — accepts a transaction client for atomic booking
  static async create(client, data) {
    const conn = client || pool;
    const waybillId = await Waybill.generateWaybillId(conn);
    const r = await conn.query(
      `INSERT INTO waybills (
         waybill_id, voyage_id, shipper_id, consignee_id, current_status_id,
         payment_status_id, cargo_description, quantity, total_weight_kg,
         cargo_type, cargo_sqft, booked_rooms, freight_charge, vehicle_plate,
         payment_mode, official_receipt_no
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING *`,
      [
        waybillId, data.voyage_id, data.shipper_id, data.consignee_id,
        data.current_status_id, data.payment_status_id, data.cargo_description || null,
        data.quantity || 1, data.total_weight_kg || null, data.cargo_type,
        data.cargo_sqft, data.booked_rooms || 0, data.freight_charge ?? null,
        data.vehicle_plate || null, data.payment_mode, data.official_receipt_no || null
      ]
    );
    return new Waybill(r.rows[0]);
  }

  // computeFreight() from the class diagram
  computeFreight() {
    if (this.cargo_type === 'CONTAINER') {
      return FREIGHT_RATES.CONTAINER * (this.quantity || 1);
    }
    return FREIGHT_RATES[this.cargo_type] * Number(this.cargo_sqft || 0) + ROOM_RATE * (this.booked_rooms || 0);
  }

  // transitionStatus(newStatusId, userId, location, remarks) from the class diagram.
  // Locks the row, updates status, writes the log — one atomic transaction.
  // Pass `client` to join an outer transaction (used by gate check-in).
  async transitionStatus(newStatusId, userId, location, remarks, client) {
    const own = !client;
    const conn = client || (await pool.connect());
    try {
      if (own) await conn.query('BEGIN');

      const cur = await conn.query(
        'SELECT current_status_id FROM waybills WHERE waybill_id = $1 FOR UPDATE',
        [this.waybill_id]
      );
      if (cur.rows.length === 0) {
        throw Object.assign(new Error('Waybill not found'), { statusCode: 404 });
      }

      await conn.query(
        'UPDATE waybills SET current_status_id = $1 WHERE waybill_id = $2',
        [newStatusId, this.waybill_id]
      );

      const log = await WaybillStatusLog.create(conn, {
        waybill_id: this.waybill_id,
        updated_by_user: userId,
        previous_status_id: cur.rows[0].current_status_id,
        new_status_id: newStatusId,
        location_name: location,
        remarks
      });

      if (own) await conn.query('COMMIT');
      this.current_status_id = newStatusId;
      return log;
    } catch (err) {
      if (own) await conn.query('ROLLBACK');
      throw err;
    } finally {
      if (own) conn.release();
    }
  }
}

module.exports = Waybill;
