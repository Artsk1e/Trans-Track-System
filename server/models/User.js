const pool = require('../db');

class User {
  constructor(row = {}) {
    Object.assign(this, row);
  }

  static async all() {
    const r = await pool.query(
      'SELECT user_id, username, first_name, last_name, role FROM users ORDER BY user_id ASC'
    );
    return r.rows.map((row) => new User(row));
  }

  static async findByUsername(username) {
    const r = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return r.rows[0] ? new User(r.rows[0]) : null;
  }

  static async findById(userId) {
    const r = await pool.query(
      'SELECT user_id, username, first_name, last_name, role FROM users WHERE user_id = $1',
      [userId]
    );
    return r.rows[0] ? new User(r.rows[0]) : null;
  }

  static async create({ username, password_hash, first_name, last_name, role }) {
    const r = await pool.query(
      'INSERT INTO users (username, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, username, first_name, last_name, role',
      [username, password_hash, first_name, last_name, role]
    );
    return new User(r.rows[0]);
  }

  // verifyPassword(plainPassword) from the class diagram
  async verifyPassword(plainPassword) {
    const bcrypt = require('bcrypt');
    if (!this.password_hash) return false;
    return bcrypt.compare(plainPassword, this.password_hash);
  }

  // authorize(requiredRole) from the class diagram — ADMIN passes everything
  authorize(requiredRole) {
    return this.role === requiredRole || this.role === 'ADMIN';
  }
}

module.exports = User;
