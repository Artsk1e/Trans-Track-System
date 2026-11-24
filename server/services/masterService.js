const Port = require('../models/Port');
const Vessel = require('../models/Vessel');
const Voyage = require('../models/Voyage');
const Client = require('../models/Client');

// Master data encoding — thin delegation to the domain model classes
const MasterService = {
  // CLIENTS ---------------------------------------------------------------
  listClients: () => Client.all(),
  createClient: (data) => Client.create(data),
  async updateClient(id, fields) {
    const client = await Client.find(id);
    if (!client) return null;
    return await client.updateDetails(fields);
  },

  // VESSELS ---------------------------------------------------------------
  listVessels: () => Vessel.all(),
  createVessel: (data) => Vessel.create(data),
  async updateVessel(id, fields) {
    const vessel = await Vessel.find(id);
    if (!vessel) return null;
    if (fields.is_active !== undefined) await vessel.setActive(fields.is_active);
    if (fields.status !== undefined) await vessel.updateOperationalStatus(fields.status);
    return vessel;
  },

  // PORTS -----------------------------------------------------------------
  listPorts: () => Port.all(),
  createPort: (data) => Port.create(data),
  async updatePort(id, fields) {
    const port = await Port.find(id);
    if (!port) return null;
    return await port.updateDetails(fields);
  },

  // VOYAGES ---------------------------------------------------------------
  listVoyages: () => Voyage.all(),
  createVoyage: (data) => Voyage.create(data),
  async updateVoyage(id, fields) {
    const voyage = await Voyage.find(id);
    if (!voyage) return null;
    if (fields.voyage_status !== undefined) await voyage.updateStatus(fields.voyage_status);
    return voyage;
  }
};

module.exports = MasterService;
