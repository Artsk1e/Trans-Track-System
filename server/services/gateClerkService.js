const pool = require('../db');

// Service for Gate Clerk Role
const GateClerkService = {
  async getWaybills() {
    // Queries the secure view instead of direct table
    const query = 'SELECT * FROM v_gate_clerk_waybills';
    const result = await pool.query(query);
    return result.rows;
  },
  
  async checkInTruck(waybillId, gateClerkId, driverPhone) {
    const query = `
      INSERT INTO truck_arrivals (waybill_id, gate_clerk_id, driver_phone)
      VALUES ($1, $2, $3) RETURNING *
    `;
    const result = await pool.query(query, [waybillId, gateClerkId, driverPhone]);
    return result.rows[0];
  }
};

module.exports = GateClerkService;
