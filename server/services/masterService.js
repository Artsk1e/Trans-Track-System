const pool = require('../db');

// Master data encoding: clients, vessels, ports, voyages
const MasterService = {
  // CLIENTS ---------------------------------------------------------------
  async listClients() {
    const r = await pool.query('SELECT * FROM clients ORDER BY client_id ASC');
    return r.rows;
  },
  async createClient({ client_type, company_name, contact_person, phone_number, email }) {
    const r = await pool.query(
      `INSERT INTO clients (client_type, company_name, contact_person, phone_number, email)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [client_type, company_name, contact_person, phone_number, email || null]
    );
    return r.rows[0];
  },
  async updateClient(id, fields) {
    const allowed = ['client_type', 'company_name', 'contact_person', 'phone_number', 'email'];
    const sets = [], values = [];
    for (const k of allowed) {
      if (fields[k] !== undefined) {
        sets.push(`${k} = $${values.length + 1}`);
        values.push(fields[k]);
      }
    }
    if (sets.length === 0) return null;
    values.push(id);
    const r = await pool.query(
      `UPDATE clients SET ${sets.join(', ')} WHERE client_id = $${values.length} RETURNING *`, values
    );
    return r.rows[0] || null;
  },

  // VESSELS ---------------------------------------------------------------
  async listVessels() {
    const r = await pool.query('SELECT * FROM vessels ORDER BY vessel_id ASC');
    return r.rows;
  },
  async createVessel({ capacity, vessel_type, vessel_name, total_deck_sqft, total_cabin_rooms, status }) {
    const r = await pool.query(
      `INSERT INTO vessels (capacity, vessel_type, vessel_name, total_deck_sqft, total_cabin_rooms, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [capacity, vessel_type, vessel_name, total_deck_sqft, total_cabin_rooms, status || 'ACTIVE']
    );
    return r.rows[0];
  },
  async updateVessel(id, fields) {
    // is_active is the soft-deactivate switch; never hard-delete referenced vessels
    const allowed = ['capacity', 'vessel_type', 'vessel_name', 'total_deck_sqft', 'total_cabin_rooms', 'status', 'is_active'];
    const sets = [], values = [];
    for (const k of allowed) {
      if (fields[k] !== undefined) {
        sets.push(`${k} = $${values.length + 1}`);
        values.push(fields[k]);
      }
    }
    if (sets.length === 0) return null;
    values.push(id);
    const r = await pool.query(
      `UPDATE vessels SET ${sets.join(', ')} WHERE vessel_id = $${values.length} RETURNING *`, values
    );
    return r.rows[0] || null;
  },

  // PORTS -----------------------------------------------------------------
  async listPorts() {
    const r = await pool.query('SELECT * FROM ports ORDER BY port_id ASC');
    return r.rows;
  },
  async createPort({ port_code, port_name, city, province }) {
    const r = await pool.query(
      `INSERT INTO ports (port_code, port_name, city, province) VALUES ($1, $2, $3, $4) RETURNING *`,
      [port_code, port_name, city, province]
    );
    return r.rows[0];
  },
  async updatePort(id, fields) {
    const allowed = ['port_code', 'port_name', 'city', 'province'];
    const sets = [], values = [];
    for (const k of allowed) {
      if (fields[k] !== undefined) {
        sets.push(`${k} = $${values.length + 1}`);
        values.push(fields[k]);
      }
    }
    if (sets.length === 0) return null;
    values.push(id);
    const r = await pool.query(
      `UPDATE ports SET ${sets.join(', ')} WHERE port_id = $${values.length} RETURNING *`, values
    );
    return r.rows[0] || null;
  },

  // VOYAGES ---------------------------------------------------------------
  async listVoyages() {
    const r = await pool.query(`
      SELECT v.*, ves.vessel_name, p1.port_name AS origin_port, p2.port_name AS destination_port
      FROM voyages v
      JOIN vessels ves ON v.vessel_id = ves.vessel_id
      JOIN ports p1 ON v.origin_port_id = p1.port_id
      JOIN ports p2 ON v.destination_port_id = p2.port_id
      ORDER BY v.departure ASC`);
    return r.rows;
  },
  // New voyages always start at full vessel capacity (deduction engine baseline)
  async createVoyage({ vessel_id, origin_port_id, destination_port_id, voyage_number, departure, estimated_arrival }) {
    const r = await pool.query(
      `INSERT INTO voyages (vessel_id, origin_port_id, destination_port_id, voyage_number, departure, estimated_arrival, remaining_sqft, remaining_rooms)
       SELECT $1, $2, $3, $4, $5, $6, total_deck_sqft, total_cabin_rooms
       FROM vessels
       WHERE vessel_id = $1
       RETURNING *`,
      [vessel_id, origin_port_id, destination_port_id, voyage_number, departure, estimated_arrival]
    );
    return r.rows[0] || null;
  },
  async updateVoyage(id, fields) {
    const allowed = ['departure', 'estimated_arrival', 'voyage_status'];
    const sets = [], values = [];
    for (const k of allowed) {
      if (fields[k] !== undefined) {
        sets.push(`${k} = $${values.length + 1}`);
        values.push(fields[k]);
      }
    }
    if (sets.length === 0) return null;
    values.push(id);
    const r = await pool.query(
      `UPDATE voyages SET ${sets.join(', ')} WHERE voyage_id = $${values.length} RETURNING *`, values
    );
    return r.rows[0] || null;
  }
};

module.exports = MasterService;
