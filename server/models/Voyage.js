const { BaseAuditEntity } = require('./baseEntity');
const pool = require('../db');

class Voyage extends BaseAuditEntity {
  static async all() {
    const r = await pool.query(`
      SELECT v.*, ves.vessel_name, p1.port_name AS origin_port, p2.port_name AS destination_port
      FROM voyages v
      JOIN vessels ves ON v.vessel_id = ves.vessel_id
      JOIN ports p1 ON v.origin_port_id = p1.port_id
      JOIN ports p2 ON v.destination_port_id = p2.port_id
      ORDER BY v.departure ASC`);
    return r.rows.map((row) => new Voyage(row));
  }

  static async find(voyageId) {
    const r = await pool.query('SELECT * FROM voyages WHERE voyage_id = $1', [voyageId]);
    return r.rows[0] ? new Voyage(r.rows[0]) : null;
  }

  // New voyages always start at full vessel capacity (deduction baseline)
  static async create({ vessel_id, origin_port_id, destination_port_id, voyage_number, departure, estimated_arrival }) {
    const r = await pool.query(
      `INSERT INTO voyages (vessel_id, origin_port_id, destination_port_id, voyage_number, departure, estimated_arrival, remaining_sqft, remaining_rooms)
       SELECT $1, $2, $3, $4, $5, $6, total_deck_sqft, total_cabin_rooms
       FROM vessels WHERE vessel_id = $1
       RETURNING *`,
      [vessel_id, origin_port_id, destination_port_id, voyage_number, departure, estimated_arrival]
    );
    return r.rows[0] ? new Voyage(r.rows[0]) : null;
  }

  // deductCapacity(sqft, rooms) from the class diagram.
  // Accepts a transaction client so the AutoDeductionEngine can compose it atomically.
  // Returns the new remaining capacity, or null when capacity is insufficient.
  async deductCapacity(client, cargoSqft, bookedRooms) {
    const conn = client || pool;
    const r = await conn.query(
      `UPDATE voyages
       SET remaining_sqft = remaining_sqft - $1,
           remaining_rooms = remaining_rooms - $2
       WHERE voyage_id = $3
         AND remaining_sqft >= $1
         AND remaining_rooms >= $2
       RETURNING remaining_sqft, remaining_rooms`,
      [cargoSqft, bookedRooms || 0, this.voyage_id]
    );
    if (r.rows[0]) {
      this.remaining_sqft = r.rows[0].remaining_sqft;
      this.remaining_rooms = r.rows[0].remaining_rooms;
    }
    return r.rows[0] || null;
  }

  // restoreCapacity(sqft, rooms) from the class diagram
  async restoreCapacity(client, cargoSqft, bookedRooms) {
    const conn = client || pool;
    const r = await conn.query(
      `UPDATE voyages
       SET remaining_sqft = remaining_sqft + $1,
           remaining_rooms = remaining_rooms + $2
       WHERE voyage_id = $3
       RETURNING remaining_sqft, remaining_rooms`,
      [cargoSqft, bookedRooms || 0, this.voyage_id]
    );
    if (r.rows[0]) {
      this.remaining_sqft = r.rows[0].remaining_sqft;
      this.remaining_rooms = r.rows[0].remaining_rooms;
    }
    return r.rows[0] || null;
  }

  // updateStatus(status) from the class diagram
  async updateStatus(status) {
    const r = await pool.query(
      'UPDATE voyages SET voyage_status = $1 WHERE voyage_id = $2 RETURNING *',
      [status, this.voyage_id]
    );
    Object.assign(this, r.rows[0]);
    return this;
  }
}

module.exports = Voyage;
