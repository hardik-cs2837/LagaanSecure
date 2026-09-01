const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
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

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/prices', pricesRoutes);
app.use('/api/deals', dealsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/advisor', advisorRoutes);

// Error Handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

sequelize.sync({ force: false }).then(() => {
  console.log('Database synced successfully');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // Start jobs
    priceRefreshJob();
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});\n