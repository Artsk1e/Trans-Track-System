const { Pool } = require('pg');

const pool = require('../db');

// User model to interact with the 'users' table
class User {
  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = $1';
    const values = [username];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const values = [email];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(userId) {
    const query = 'SELECT * FROM users WHERE user_id = $1';
    const values = [userId];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async create(userData) {
    const { username, password_hash, first_name, last_name, role } = userData;
    const query = 'INSERT INTO users (username, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const values = [username, password_hash, first_name, last_name, role];
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = User;