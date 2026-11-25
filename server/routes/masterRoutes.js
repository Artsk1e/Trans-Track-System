const express = require('express');
const MasterService = require('../services/masterService');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// All master-data routes are protected
router.use(authenticateToken);

const OPERATIONS_STAFF = ['GATE_CLERK', 'ADMIN'];
const ADMIN_ONLY = ['ADMIN'];

// ---------------------------------------------------------------------------
// CLIENTS (encoded daily at the counter — operations staff)
// ---------------------------------------------------------------------------
router.get('/clients', authorizeRoles(...OPERATIONS_STAFF), async (req, res, next) => {
  try { res.json({ success: true, data: await MasterService.listClients() }); } catch (e) { next(e); }
});

router.post('/clients', authorizeRoles(...OPERATIONS_STAFF), async (req, res, next) => {
  try {
    const { client_type, company_name, contact_person, phone_number } = req.body;
    if (!['SHIPPER', 'CONSIGNEE', 'BOTH'].includes(client_type) || !contact_person || !phone_number) {
      return res.status(400).json({
        success: false,
        error: 'client_type (SHIPPER|CONSIGNEE|BOTH), contact_person and phone_number are required.'
      });
    }
    const client = await MasterService.createClient({ client_type, company_name, contact_person, phone_number, email: req.body.email });
    res.status(201).json({ success: true, data: client, message: 'Client created' });
  } catch (e) { next(e); }
});

router.patch('/clients/:id', authorizeRoles(...OPERATIONS_STAFF), async (req, res, next) => {
  try {
    const client = await MasterService.updateClient(req.params.id, req.body);
    if (!client) return res.status(404).json({ success: false, error: 'Client not found or nothing to update' });
    res.json({ success: true, data: client, message: 'Client updated' });
  } catch (e) { next(e); }
});

// ---------------------------------------------------------------------------
// VESSELS (fleet master data — admin only, soft-deactivate via is_active)
// ---------------------------------------------------------------------------
router.get('/vessels', authorizeRoles(...OPERATIONS_STAFF), async (req, res, next) => {
  try { res.json({ success: true, data: await MasterService.listVessels() }); } catch (e) { next(e); }
});

router.post('/vessels', authorizeRoles(...ADMIN_ONLY), async (req, res, next) => {
  try {
    const { capacity, vessel_type, vessel_name, total_deck_sqft, total_cabin_rooms } = req.body;
    if (!['PASSENGER_CARGO', 'CARGO_ONLY', 'RORO'].includes(vessel_type) || !vessel_name || total_deck_sqft == null || total_cabin_rooms == null) {
      return res.status(400).json({
        success: false,
        error: 'vessel_type (PASSENGER_CARGO|CARGO_ONLY|RORO), vessel_name, total_deck_sqft and total_cabin_rooms are required.'
      });
    }
    const vessel = await MasterService.createVessel({ capacity: capacity || 0, vessel_type, vessel_name, total_deck_sqft, total_cabin_rooms, status: req.body.status });
    res.status(201).json({ success: true, data: vessel, message: 'Vessel created' });
  } catch (e) { next(e); }
});

router.patch('/vessels/:id', authorizeRoles(...ADMIN_ONLY), async (req, res, next) => {
  try {
    const vessel = await MasterService.updateVessel(req.params.id, req.body);
    if (!vessel) return res.status(404).json({ success: false, error: 'Vessel not found or nothing to update' });
    res.json({ success: true, data: vessel, message: 'Vessel updated' });
  } catch (e) { next(e); }
});

// ---------------------------------------------------------------------------
// PORTS (admin only)
// ---------------------------------------------------------------------------
router.get('/ports', authorizeRoles(...OPERATIONS_STAFF), async (req, res, next) => {
  try { res.json({ success: true, data: await MasterService.listPorts() }); } catch (e) { next(e); }
});

router.post('/ports', authorizeRoles(...ADMIN_ONLY), async (req, res, next) => {
  try {
    const { port_code, port_name, city, province } = req.body;
    if (!port_code || !port_name || !city || !province) {
      return res.status(400).json({ success: false, error: 'port_code, port_name, city and province are required.' });
    }
    const port = await MasterService.createPort({ port_code, port_name, city, province });
    res.status(201).json({ success: true, data: port, message: 'Port created' });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ success: false, error: 'Port code already exists.' });
    next(e);
  }
});

router.patch('/ports/:id', authorizeRoles(...ADMIN_ONLY), async (req, res, next) => {
  try {
    const port = await MasterService.updatePort(req.params.id, req.body);
    if (!port) return res.status(404).json({ success: false, error: 'Port not found or nothing to update' });
    res.json({ success: true, data: port, message: 'Port updated' });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ success: false, error: 'Port code already exists.' });
    next(e);
  }
});

// ---------------------------------------------------------------------------
// VOYAGES (OIC schedules them — starts at full vessel capacity)
// ---------------------------------------------------------------------------
router.get('/voyages', authorizeRoles(...OPERATIONS_STAFF), async (req, res, next) => {
  try { 
    res.json({ success: true, data: await MasterService.listVoyages() }); 
  } 
  
  catch (e) { 
    next(e); 
  }
});

router.post('/voyages', authorizeRoles('ADMIN'), async (req, res, next) => {
  try {
    const { vessel_id, origin_port_id, destination_port_id, voyage_number, departure, estimated_arrival } = req.body;
    if (!vessel_id || !origin_port_id || !destination_port_id || !voyage_number || !departure || !estimated_arrival) {
      return res.status(400).json({
        success: false,
        error: 'vessel_id, origin_port_id, destination_port_id, voyage_number, departure and estimated_arrival are required.'
      });
    }
    const voyage = await MasterService.createVoyage({ vessel_id, origin_port_id, destination_port_id, voyage_number, departure, estimated_arrival });
    if (!voyage) return res.status(400).json({ success: false, error: 'Vessel not found.' });
    res.status(201).json({ success: true, data: voyage, message: 'Voyage created at full vessel capacity' });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ success: false, error: 'Voyage number already exists.' });
    if (e.code === '23503') return res.status(400).json({ success: false, error: 'Referenced vessel or port does not exist.' });
    next(e);
  }
});

router.patch('/voyages/:id', authorizeRoles('ADMIN'), async (req, res, next) => {
  try {
    const voyage = await MasterService.updateVoyage(req.params.id, req.body);
    if (!voyage) return res.status(404).json({ success: false, error: 'Voyage not found or nothing to update' });
    res.json({ success: true, data: voyage, message: 'Voyage updated' });
  } catch (e) { next(e); }
});

module.exports = router;
