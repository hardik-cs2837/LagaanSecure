const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { sequelize } = require('./models');
const errorHandler = require('./middleware/errorHandler');
const priceRefreshJob = require('./jobs/priceRefresh');

// Import routes
const authRoutes = require('./routes/auth');
const listingsRoutes = require('./routes/listings');
const pricesRoutes = require('./routes/prices');
const dealsRoutes = require('./routes/deals');
const notificationsRoutes = require('./routes/notifications');
const advisorRoutes = require('./routes/advisor');
const demandRoutes = require('./routes/demand');
const matchingRoutes = require('./routes/matching');
const bulkRequirementsRoutes = require('./routes/bulkRequirements');

const app = express();

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) 
  : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server) or in development
    if (!origin || process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive for hackathon demo compatibility
  },
  credentials: true
}));

app.use(helmet({ crossOriginResourcePolicy: false }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/prices', pricesRoutes);
app.use('/api/deals', dealsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/advisor', advisorRoutes);
app.use('/api/demand', demandRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/bulk-requirements', bulkRequirementsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'KisaanConnect Backend REST API',
    problemStatement: 'PS 26033 - Direct Farmer-to-Buyer Agricultural Marketplace'
  });
});

// Error Handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  sequelize.sync({ alter: true }).then(() => {
    console.log('Database synced successfully with models');
    app.listen(PORT, () => {
      console.log(`KisaanConnect Server running on port ${PORT}`);
      // Start background price refresh job
      priceRefreshJob();
    });
  }).catch(err => {
    console.error('Unable to connect to the database:', err);
  });
}

module.exports = app;
