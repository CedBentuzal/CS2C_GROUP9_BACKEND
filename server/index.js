const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const os = require('os'); // Add this
require('../config/env'); 
const pool = require('../config/db');

// Routes
const signupRoute = require('../routes/signup');
const loginRoute = require('../routes/login');
const verifyEmailRoute = require('../routes/emailver');
const productRoute = require('../routes/products'); 

const app = express();
const port = process.env.PORT || 3000;

// ======================
// Enhanced Middleware
// ======================
app.use(morgan('dev'));
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));

// ======================
// IP Detection Function
// ======================
function getNetworkIp() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces).flat()) {
    if (iface.family === 'IPv4' && !iface.internal) {
      return iface.address;
    }
  }
  return 'localhost';
}

// ======================
// Rate Limiting
// ======================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later'
});
app.use('/api/login', authLimiter);
app.use('/api/signup', authLimiter);

// ======================
// Routes
// ======================
app.use('/api/signup', signupRoute);
app.use('/api/login', loginRoute);
app.use('/api', verifyEmailRoute);
app.use('/api/products', productRoute);

// ======================
// Utility Endpoints
// ======================
app.get('/api/test-db', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT NOW() as current_time');
    res.json({ success: true, time: rows[0].current_time });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Database connection failed',
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'active',
    message: 'Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// ======================
// Error Handlers
// ======================
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : null
  });
});

// ======================
// Server Startup
// ======================
const networkIp = getNetworkIp();
app.listen(port, '0.0.0.0', () => {
  console.log(`
  🚀 Server running!
  - Local:       http://localhost:${port}
  - Network:     http://${networkIp}:${port}
  - Environment: ${process.env.NODE_ENV || 'development'}
  `);
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`
  Development Info:
  - API Docs: http://localhost:${port}/api-docs
  - Test the connection from your phone: http://${networkIp}:${port}/api/test-db
    `);
  }
});