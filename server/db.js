const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  user: String(process.env.DB_USER || 'postgres'),
  password: String(process.env.DB_PASSWORD || ''),
  host: String(process.env.DB_HOST || 'localhost'),
  port: Number(process.env.DB_PORT || 5432),
  database: String(process.env.DB_NAME || 'Trans_Track'),
});

pool.on('connect', () => {
  console.log('Connected to the Trans-Track PostgreSQL database successfully.');
});

module.exports = pool;
