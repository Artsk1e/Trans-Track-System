const pool = require('../db');

// Service for Executive Role
const ExecutiveService = {
  async getOperationalMetrics() {
    // Aggregated read-only data from secure executive view
    const query = 'SELECT * FROM v_executive_summary';
    const result = await pool.query(query);
    return result.rows;
  }
};

module.exports = ExecutiveService;
