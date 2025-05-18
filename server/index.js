const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
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
app.use(morgan('dev')); // Logs requests in development
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));

// Rate limiting (applied to all routes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable deprecated headers
});
app.use(limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 mins for auth
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  if (process.env.NODE_ENV === 'development') {
    console.log(`API Docs: http://localhost:${port}/api-docs`);
  }
});