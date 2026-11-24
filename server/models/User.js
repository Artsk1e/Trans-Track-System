const pool = require('../db');

// User model to interact with the 'users' table
class User {
  static async findAll() {
    const query = 'SELECT user_id, username, first_name, last_name, role FROM users ORDER BY user_id ASC';
    const result = await pool.query(query);
    return result.rows;
  }

  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = $1';
    const values = [username];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(userId) {
    const query = 'SELECT user_id, username, first_name, last_name, role FROM users WHERE user_id = $1';
    const values = [userId];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async create(userData) {
    const { username, password_hash, first_name, last_name, role } = userData;
    const query = 'INSERT INTO users (username, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, username, first_name, last_name, role';
    const values = [username, password_hash, first_name, last_name, role];
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = User;