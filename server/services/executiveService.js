const pool = require('../db');

// Service for Executive Role
const ExecutiveService = {
  async getOperationalMetrics() {
    // Aggregated read-only data from secure executive view
    const query = 'SELECT * FROM v_executive_summary';
    const result = await pool.query(query);
    return result.rows;
  },

  async getVoyageCapacity(voyageId) {
    // Voyage capacity detail for executive drill-down
    const query = `
      SELECT
        v.voyage_number,
        ves.vessel_name,
        ves.total_deck_sqft,
        v.remaining_sqft,
        ves.total_cabin_rooms,
        v.remaining_rooms,
        COALESCE(SUM(w.cargo_sqft), 0) AS used_sqft,
        COALESCE(SUM(w.booked_rooms), 0) AS used_rooms,
        COUNT(w.waybill_id) AS waybills_count
      FROM voyages v
      JOIN vessels ves ON v.vessel_id = ves.vessel_id
      LEFT JOIN waybills w ON v.voyage_id = w.voyage_id
      WHERE v.voyage_id = $1
      GROUP BY v.voyage_id, v.voyage_number, ves.vessel_name, ves.total_deck_sqft, v.remaining_sqft, ves.total_cabin_rooms, v.remaining_rooms
    `;
    const result = await pool.query(query, [voyageId]);
    return result.rows[0] || null;
  }
};

module.exports = ExecutiveService;
