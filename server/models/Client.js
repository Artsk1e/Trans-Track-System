const { BaseAuditEntity } = require('./baseEntity');
const pool = require('../db');

class Client extends BaseAuditEntity {
  static async all() {
    const r = await pool.query('SELECT * FROM clients ORDER BY client_id ASC');
    return r.rows.map((row) => new Client(row));
  }

  static async find(clientId) {
    const r = await pool.query('SELECT * FROM clients WHERE client_id = $1', [clientId]);
    return r.rows[0] ? new Client(r.rows[0]) : null;
  }

  static async create({ client_type, company_name, contact_person, phone_number, email }) {
    const r = await pool.query(
      `INSERT INTO clients (client_type, company_name, contact_person, phone_number, email)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [client_type, company_name, contact_person, phone_number, email || null]
    );
    return new Client(r.rows[0]);
  }

  // updateContact(phone, email) from the class diagram
  async updateContact(phone_number, email) {
    const r = await pool.query(
      `UPDATE clients SET
         phone_number = COALESCE($1, phone_number),
         email = COALESCE($2, email)
       WHERE client_id = $3 RETURNING *`,
      [phone_number, email, this.client_id]
    );
    Object.assign(this, r.rows[0]);
    return this;
  }

  async updateDetails(fields) {
    const allowed = ['client_type', 'company_name', 'contact_person', 'phone_number', 'email'];
    const sets = [], values = [];
    for (const k of allowed) {
      if (fields[k] !== undefined) {
        sets.push(`${k} = $${values.length + 1}`);
        values.push(fields[k]);
      }
    }
    if (sets.length === 0) return this;
    values.push(this.client_id);
    const r = await pool.query(
      `UPDATE clients SET ${sets.join(', ')} WHERE client_id = $${values.length} RETURNING *`, values
    );
    Object.assign(this, r.rows[0]);
    return this;
  }
}

module.exports = Client;
