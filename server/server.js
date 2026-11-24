const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const pool = require('./db');

const app = express();

// 1. Security Headers via Helmet
app.use(helmet());

// 2. CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Rate Limiting (Prevent Brute-Force & DDoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api/', limiter);

// 4. Body parsing middleware
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const gateRoutes = require('./routes/gateRoutes');
const oicRoutes = require('./routes/oicRoutes');
const executiveRoutes = require('./routes/executiveRoutes');
const adminRoutes = require('./routes/adminRoutes');
const publicRoutes = require('./routes/publicRoutes');
const waybillRoutes = require('./routes/waybillRoutes');
// ...
app.use('/api/auth', authRoutes);
app.use('/api/gate', gateRoutes);
app.use('/api/oic', oicRoutes);
app.use('/api/executive', executiveRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/waybills', waybillRoutes);
// Legacy alias for existing frontend calls
app.use('/api/operations', gateRoutes);


app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM waybill_statuses ORDER BY sequence_order ASC');
    res.json({ success: true, statuses: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Database connection failed' });
  }
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Trans-Track secure server running on port ${PORT}`);
});
