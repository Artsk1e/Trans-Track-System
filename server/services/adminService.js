const pool = require('../db');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Service for Admin Role
const AdminService = {
  async getUsers() {
    return await User.findAll();
  },

  async createUser({ username, password, first_name, last_name, role }) {
    const existing = await User.findByUsername(username);
    if (existing) {
      throw Object.assign(new Error('Username is already taken.'), { statusCode: 409 });
    }
    const password_hash = await bcrypt.hash(password, 10);
    return await User.create({ username, password_hash, first_name, last_name, role });
  },

  async getAuditLogs(tableName, limit = 50) {
    let query = `
      SELECT al.audit_id, al.table_name, al.operation, al.record_id,
             u.username AS changed_by, al.changed_at, al.old_data, al.new_data
      FROM audit_logs al
      LEFT JOIN users u ON al.changed_by = u.user_id
    `;
    const values = [];
    if (tableName) {
      query += ' WHERE al.table_name = $1';
      values.push(tableName);
    }
    query += ` ORDER BY al.changed_at DESC LIMIT $${values.length + 1}`;
    values.push(limit);

    const result = await pool.query(query, values);
    return result.rows;
  }
};

module.exports = AdminService;
