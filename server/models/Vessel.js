const { BaseEntity } = require('./baseEntity');
const pool = require('../db');

class Vessel extends BaseEntity {
  static async all() {
    const r = await pool.query('SELECT * FROM vessels ORDER BY vessel_id ASC');
    return r.rows.map((row) => new Vessel(row));
  }

  static async find(vesselId) {
    const r = await pool.query('SELECT * FROM vessels WHERE vessel_id = $1', [vesselId]);
    return r.rows[0] ? new Vessel(r.rows[0]) : null;
  }

  static async create({ capacity, vessel_type, vessel_name, total_deck_sqft, total_cabin_rooms, status }) {
    const r = await pool.query(
      `INSERT INTO vessels (capacity, vessel_type, vessel_name, total_deck_sqft, total_cabin_rooms, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [capacity || 0, vessel_type, vessel_name, total_deck_sqft, total_cabin_rooms, status || 'ACTIVE']
    );
    return new Vessel(r.rows[0]);
  }

  // hasAvailableCapacity(sqft, rooms) from the class diagram:
  // an operationally-active vessel can physically hold the cargo footprint
  hasAvailableCapacity(sqft, rooms) {
    return Boolean(this.is_active) &&
      this.status === 'ACTIVE' &&
      Number(this.total_deck_sqft) >= Number(sqft) &&
      this.total_cabin_rooms >= Number(rooms || 0);
  }

  // updateOperationalStatus(newStatus) from the class diagram
  async updateOperationalStatus(newStatus) {
    const r = await pool.query(
      'UPDATE vessels SET status = $1 WHERE vessel_id = $2 RETURNING *',
      [newStatus, this.vessel_id]
    );
    Object.assign(this, r.rows[0]);
    return this;
  }

  // Soft-deactivate switch (no hard delete: waybills reference vessels)
  async setActive(isActive) {
    const r = await pool.query(
      'UPDATE vessels SET is_active = $1 WHERE vessel_id = $2 RETURNING *',
      [isActive, this.vessel_id]
    );
    Object.assign(this, r.rows[0]);
    return this;
  }
}

module.exports = Vessel;
