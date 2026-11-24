const { BaseEntity } = require('./baseEntity');
const pool = require('../db');

class Port extends BaseEntity {
  static async all() {
    const r = await pool.query('SELECT * FROM ports ORDER BY port_id ASC');
    return r.rows.map((row) => new Port(row));
  }

  static async find(portId) {
    const r = await pool.query('SELECT * FROM ports WHERE port_id = $1', [portId]);
    return r.rows[0] ? new Port(r.rows[0]) : null;
  }

  static async create({ port_code, port_name, city, province }) {
    const r = await pool.query(
      'INSERT INTO ports (port_code, port_name, city, province) VALUES ($1, $2, $3, $4) RETURNING *',
      [port_code, port_name, city, province]
    );
    return new Port(r.rows[0]);
  }

  // updateDetails(code, name, city, province) from the class diagram
  async updateDetails({ port_code, port_name, city, province }) {
    const r = await pool.query(
      `UPDATE ports SET
         port_code = COALESCE($1, port_code),
         port_name = COALESCE($2, port_name),
         city = COALESCE($3, city),
         province = COALESCE($4, province)
       WHERE port_id = $5 RETURNING *`,
      [port_code, port_name, city, province, this.port_id]
    );
    Object.assign(this, r.rows[0]);
    return this;
  }
}

module.exports = Port;
