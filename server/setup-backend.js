const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Users/HP/Desktop/KisanConnect/server';

const files = {
  'package.json': `{
  "name": "kisaan-connect-backend",
  "version": "1.0.0",
  "description": "Backend for KisaanConnect",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "migrate": "sequelize-cli db:migrate",
    "seed": "sequelize-cli db:seed:all"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-validator": "^7.0.1",
    "helmet": "^7.0.0",
    "jsonwebtoken": "^9.0.2",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "node-cron": "^3.0.3",
    "pg": "^8.11.3",
    "pg-hstore": "^2.3.4",
    "sequelize": "^6.33.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "sequelize-cli": "^6.6.1"
  }
}`,
  'config/database.js': `require('dotenv').config();
const { Sequelize } = require('sequelize');

const config = {
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'kisaanconnect',
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: false,
};

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  logging: config.logging
});

module.exports = {
  sequelize,
  ...config
};`,
  '.sequelizerc': `const path = require('path');
module.exports = {
  'config': path.resolve('config', 'database.js'),
  'models-path': path.resolve('models'),
  'seeders-path': path.resolve('seeders'),
  'migrations-path': path.resolve('migrations')
};`,
  'models/index.js': `const fs = require('fs');
const path = require('path');
const { sequelize } = require('../config/database');

const db = {};

// Load all models in the directory except index.js
fs.readdirSync(__dirname)
  .filter((file) => file.indexOf('.') !== 0 && file !== 'index.js' && file.slice(-3) === '.js')
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;

module.exports = db;`,
  'models/User.js': `const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('farmer', 'buyer'), allowNull: false },
    phone: { type: DataTypes.STRING, unique: true, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: true },
    location: { type: DataTypes.STRING },
    language_pref: { type: DataTypes.STRING, defaultValue: 'en' },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'users',
    timestamps: false
  });

  User.associate = (models) => {
    User.hasMany(models.Listing, { foreignKey: 'farmer_id', as: 'listings' });
    User.hasMany(models.Deal, { foreignKey: 'buyer_id', as: 'deals' });
    User.hasMany(models.Notification, { foreignKey: 'user_id', as: 'notifications' });
  };
  return User;
};`,
  'models/Listing.js': `const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Listing = sequelize.define('Listing', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    farmer_id: { type: DataTypes.INTEGER, allowNull: false },
    crop_name: { type: DataTypes.STRING, allowNull: false },
    quantity: { type: DataTypes.FLOAT, allowNull: false },
    unit: { type: DataTypes.STRING, defaultValue: 'quintal' },
    price_per_unit: { type: DataTypes.FLOAT, allowNull: true },
    quality_grade: { type: DataTypes.ENUM('A', 'B', 'C'), defaultValue: 'B' },
    photo_url: { type: DataTypes.STRING },
    location: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM('active', 'sold'), defaultValue: 'active' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'listings',
    timestamps: false
  });

  Listing.associate = (models) => {
    Listing.belongsTo(models.User, { foreignKey: 'farmer_id', as: 'farmer' });
    Listing.hasMany(models.Deal, { foreignKey: 'listing_id', as: 'deals' });
  };
  return Listing;
};`,
  'models/PriceCache.js': `const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PriceCache = sequelize.define('PriceCache', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    commodity: { type: DataTypes.STRING, allowNull: false },
    state: { type: DataTypes.STRING, allowNull: false },
    market: { type: DataTypes.STRING, allowNull: false },
    min_price: { type: DataTypes.FLOAT },
    max_price: { type: DataTypes.FLOAT },
    modal_price: { type: DataTypes.FLOAT },
    date: { type: DataTypes.DATEONLY },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'price_cache',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['commodity', 'state', 'market', 'date']
      }
    ]
  });
  return PriceCache;
};`,
  'models/Deal.js': `const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Deal = sequelize.define('Deal', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    listing_id: { type: DataTypes.INTEGER, allowNull: false },
    buyer_id: { type: DataTypes.INTEGER, allowNull: false },
    offered_price: { type: DataTypes.FLOAT, allowNull: false },
    counter_price: { type: DataTypes.FLOAT },
    status: { type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'countered'), defaultValue: 'pending' },
  }, {
    tableName: 'deals',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Deal.associate = (models) => {
    Deal.belongsTo(models.Listing, { foreignKey: 'listing_id', as: 'listing' });
    Deal.belongsTo(models.User, { foreignKey: 'buyer_id', as: 'buyer' });
  };
  return Deal;
};`,
  'models/Notification.js': `const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    message: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.STRING, defaultValue: 'deal_update' },
    read: { type: DataTypes.BOOLEAN, defaultValue: false },
    reference_id: { type: DataTypes.INTEGER },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'notifications',
    timestamps: false
  });

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };
  return Notification;
};`,
  'middleware/auth.js': `const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Access forbidden: Insufficient role' });
    }
    next();
  };
};

module.exports = { verifyToken, requireRole };`,
  'middleware/errorHandler.js': `module.exports = (err, req, res, next) => {
  console.error(err);

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({ success: false, error: err.errors.map(e => e.message).join(', ') });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }

  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
};`,
  'middleware/validate.js': `const { validationResult, body } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array().map(e => e.msg).join(', ') });
  }
  next();
};

const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('role').isIn(['farmer', 'buyer']).withMessage('Role must be farmer or buyer'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidation = [
  body('phone').notEmpty().withMessage('Phone is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const listingValidation = [
  body('crop_name').notEmpty().withMessage('Crop name is required'),
  body('quantity').isNumeric().withMessage('Quantity must be a number')
];

const dealValidation = [
  body('listing_id').isNumeric().withMessage('Listing ID is required'),
  body('offered_price').isNumeric().withMessage('Offered price is required')
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  listingValidation,
  dealValidation
};`,
  'data/mockPrices.json': `[
  { "commodity": "Onion", "state": "Maharashtra", "market": "Lasalgaon", "min_price": 800, "max_price": 1500, "modal_price": 1100 },
  { "commodity": "Onion", "state": "Karnataka", "market": "Hubli", "min_price": 750, "max_price": 1400, "modal_price": 1050 },
  { "commodity": "Onion", "state": "Madhya Pradesh", "market": "Indore", "min_price": 700, "max_price": 1300, "modal_price": 1000 },
  { "commodity": "Tomato", "state": "Karnataka", "market": "Kolar", "min_price": 500, "max_price": 2000, "modal_price": 1200 },
  { "commodity": "Tomato", "state": "Maharashtra", "market": "Pune", "min_price": 600, "max_price": 1800, "modal_price": 1100 },
  { "commodity": "Tomato", "state": "Andhra Pradesh", "market": "Madanapalle", "min_price": 450, "max_price": 1600, "modal_price": 1000 },
  { "commodity": "Wheat", "state": "Punjab", "market": "Amritsar", "min_price": 2000, "max_price": 2400, "modal_price": 2200 },
  { "commodity": "Wheat", "state": "Haryana", "market": "Karnal", "min_price": 1950, "max_price": 2350, "modal_price": 2150 },
  { "commodity": "Wheat", "state": "Uttar Pradesh", "market": "Lucknow", "min_price": 1900, "max_price": 2300, "modal_price": 2100 },
  { "commodity": "Rice", "state": "West Bengal", "market": "Burdwan", "min_price": 1800, "max_price": 2500, "modal_price": 2100 },
  { "commodity": "Rice", "state": "Andhra Pradesh", "market": "Guntur", "min_price": 1850, "max_price": 2600, "modal_price": 2200 },
  { "commodity": "Rice", "state": "Tamil Nadu", "market": "Thanjavur", "min_price": 1750, "max_price": 2450, "modal_price": 2050 },
  { "commodity": "Potato", "state": "Uttar Pradesh", "market": "Agra", "min_price": 400, "max_price": 900, "modal_price": 650 },
  { "commodity": "Potato", "state": "West Bengal", "market": "Hooghly", "min_price": 450, "max_price": 950, "modal_price": 700 },
  { "commodity": "Soybean", "state": "Madhya Pradesh", "market": "Indore", "min_price": 4000, "max_price": 5200, "modal_price": 4600 },
  { "commodity": "Cotton", "state": "Gujarat", "market": "Rajkot", "min_price": 5500, "max_price": 7000, "modal_price": 6200 },
  { "commodity": "Maize", "state": "Bihar", "market": "Purnia", "min_price": 1800, "max_price": 2200, "modal_price": 2000 },
  { "commodity": "Sugarcane", "state": "Uttar Pradesh", "market": "Meerut", "min_price": 300, "max_price": 350, "modal_price": 320 },
  { "commodity": "Garlic", "state": "Madhya Pradesh", "market": "Mandsaur", "min_price": 6000, "max_price": 12000, "modal_price": 9000 },
  { "commodity": "Mustard", "state": "Rajasthan", "market": "Jaipur", "min_price": 5000, "max_price": 6000, "modal_price": 5500 }
]`,
  'services/priceService.js': `const axios = require('axios');
const { PriceCache } = require('../models');
const mockPrices = require('../data/mockPrices.json');
const { Op } = require('sequelize');

/**
 * Fetch Mandi price for a commodity
 */
const fetchMandiPrice = async (commodity, state, market) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const cached = await PriceCache.findOne({
      where: {
        commodity: { [Op.iLike]: commodity },
        state: { [Op.iLike]: state },
        market: { [Op.iLike]: market },
        date: today
      }
    });

    if (cached) {
      return { ...cached.toJSON(), source: 'cache' };
    }

    if (process.env.AGMARKNET_API_URL && process.env.AGMARKNET_API_KEY) {
      try {
        const response = await axios.get(process.env.AGMARKNET_API_URL, {
          params: {
            'api-key': process.env.AGMARKNET_API_KEY,
            format: 'json',
            'filters[commodity]': commodity,
            'filters[state]': state,
            'filters[market]': market,
            limit: 5
          }
        });
        
        if (response.data && response.data.records && response.data.records.length > 0) {
          const record = response.data.records[0];
          const newCache = await PriceCache.create({
            commodity: record.commodity,
            state: record.state,
            market: record.market,
            min_price: record.min_price,
            max_price: record.max_price,
            modal_price: record.modal_price,
            date: today
          });
          return { ...newCache.toJSON(), source: 'api' };
        }
      } catch (err) {
        console.error('Agmarknet API failed, falling back to mock data', err.message);
      }
    }

    // Fallback to mock data
    const mockData = mockPrices.find(p => 
      p.commodity.toLowerCase() === commodity.toLowerCase() &&
      p.state.toLowerCase() === state.toLowerCase() &&
      p.market.toLowerCase() === market.toLowerCase()
    );

    if (mockData) {
      const newCache = await PriceCache.create({
        ...mockData,
        date: today
      });
      return { ...newCache.toJSON(), source: 'mock' };
    }

    return null;
  } catch (error) {
    console.error('Error fetching mandi price:', error);
    throw error;
  }
};

/**
 * Get all prices for a commodity
 */
const getAllPricesForCommodity = async (commodity) => {
  return mockPrices.filter(p => p.commodity.toLowerCase() === commodity.toLowerCase());
};

/**
 * Refresh all prices (used by cron)
 */
const refreshAllPrices = async () => {
  const today = new Date().toISOString().split('T')[0];
  for (const item of mockPrices) {
    await PriceCache.upsert({
      commodity: item.commodity,
      state: item.state,
      market: item.market,
      min_price: item.min_price,
      max_price: item.max_price,
      modal_price: item.modal_price,
      date: today
    });
  }
  console.log('Refreshed all mock prices in cache');
};

module.exports = {
  fetchMandiPrice,
  getAllPricesForCommodity,
  refreshAllPrices
};`,
  'services/advisorService.js': `/**
 * Get advice based on entered price vs mandi price
 */
const getAdvice = async ({ mandiPrice, enteredPrice, crop }) => {
  // TODO: This logic block can be replaced with an LLM API call later
  const diffPercent = ((mandiPrice - enteredPrice) / mandiPrice) * 100;
  
  if (enteredPrice >= mandiPrice) {
    return {
      percentDifference: diffPercent.toFixed(1),
      verdict: \`This offer of ₹\${enteredPrice}/quintal for \${crop} is at or above the current mandi modal price of ₹\${mandiPrice}/quintal. This is a fair deal!\`
    };
  } else if (diffPercent <= 10) {
    return {
      percentDifference: diffPercent.toFixed(1),
      verdict: \`This offer is \${diffPercent.toFixed(1)}% below the mandi price. It's slightly below market rate. You might negotiate for a few hundred more.\`
    };
  } else if (diffPercent <= 25) {
    const loss = mandiPrice - enteredPrice;
    return {
      percentDifference: diffPercent.toFixed(1),
      verdict: \`Caution: This offer is \${diffPercent.toFixed(1)}% below the mandi price of ₹\${mandiPrice}/quintal. You're potentially losing ₹\${loss} per quintal. Consider negotiating or selling directly through KisaanConnect.\`
    };
  } else {
    return {
      percentDifference: diffPercent.toFixed(1),
      verdict: \`Warning: This offer is significantly below market rate (\${diffPercent.toFixed(1)}% less than ₹\${mandiPrice}/quintal). The intermediary markup is very high. We strongly recommend exploring direct buyer connections on KisaanConnect.\`
    };
  }
};

module.exports = { getAdvice };`,
  'services/notificationService.js': `const { Notification } = require('../models');

const createNotification = async (userId, message, type = 'deal_update', referenceId = null) => {
  return await Notification.create({
    user_id: userId,
    message,
    type,
    reference_id: referenceId
  });
};

const getUserNotifications = async (userId) => {
  return await Notification.findAll({
    where: { user_id: userId },
    order: [['created_at', 'DESC']]
  });
};

const markAsRead = async (notificationId) => {
  return await Notification.update(
    { read: true },
    { where: { id: notificationId } }
  );
};

const markAllAsRead = async (userId) => {
  return await Notification.update(
    { read: true },
    { where: { user_id: userId } }
  );
};

const notifyDealUpdate = async (deal, listing) => {
  if (deal.status === 'accepted') {
    await createNotification(deal.buyer_id, \`Your deal for \${listing.crop_name} was accepted!\`, 'deal_update', deal.id);
    await createNotification(listing.farmer_id, \`You accepted a deal for \${listing.crop_name}.\`, 'deal_update', deal.id);
  } else if (deal.status === 'countered') {
    await createNotification(deal.buyer_id, \`Farmer countered your offer for \${listing.crop_name}.\`, 'deal_update', deal.id);
  } else if (deal.status === 'rejected') {
    await createNotification(deal.buyer_id, \`Your deal for \${listing.crop_name} was rejected.\`, 'deal_update', deal.id);
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  notifyDealUpdate
};`,
  'services/smsService.js': `// TODO: Wire up Twilio when ready

const sendSMS = async (phone, message) => {
  console.log(\`SMS stub: would send to \${phone}: \${message}\`);
  return true;
};

const sendWhatsApp = async (phone, message) => {
  console.log(\`WhatsApp stub: would send to \${phone}: \${message}\`);
  return true;
};

module.exports = { sendSMS, sendWhatsApp };`,
  'routes/auth.js': `const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { validate, registerValidation, loginValidation } = require('../middleware/validate');

const router = express.Router();

router.post('/register', registerValidation, validate, async (req, res, next) => {
  try {
    const { name, role, phone, email, location, language_pref, password } = req.body;
    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) return res.status(400).json({ success: false, error: 'Phone number already registered' });
    
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, role, phone, email, location, language_pref, password_hash });
    
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    
    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: user.id, name: user.name, role: user.role, phone: user.phone, location: user.location }
      }
    });
  } catch (err) { next(err); }
});

router.post('/login', loginValidation, validate, async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ where: { phone } });
    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    
    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, name: user.name, role: user.role, phone: user.phone, location: user.location }
      }
    });
  } catch (err) { next(err); }
});

module.exports = router;`,
  'routes/listings.js': `const express = require('express');
const { Listing, User } = require('../models');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validate, listingValidation } = require('../middleware/validate');
const { Op } = require('sequelize');
const priceService = require('../services/priceService');
const advisorService = require('../services/advisorService');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { crop, location, status = 'active', minPrice, maxPrice, page = 1, limit = 20 } = req.query;
    const whereClause = { status };
    if (crop) whereClause.crop_name = { [Op.iLike]: \`%\${crop}%\` };
    if (location) whereClause.location = { [Op.iLike]: \`%\${location}%\` };
    if (minPrice || maxPrice) {
      whereClause.price_per_unit = {};
      if (minPrice) whereClause.price_per_unit[Op.gte] = minPrice;
      if (maxPrice) whereClause.price_per_unit[Op.lte] = maxPrice;
    }

    const offset = (page - 1) * limit;
    const listings = await Listing.findAndCountAll({
      where: whereClause,
      include: [{ model: User, as: 'farmer', attributes: ['name', 'location', 'phone'] }],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      success: true,
      data: {
        listings: listings.rows,
        total: listings.count,
        page: parseInt(page),
        totalPages: Math.ceil(listings.count / limit)
      }
    });
  } catch (err) { next(err); }
});

router.post('/', verifyToken, requireRole('farmer'), listingValidation, validate, async (req, res, next) => {
  try {
    const listing = await Listing.create({ ...req.body, farmer_id: req.user.id });
    res.status(201).json({ success: true, data: listing });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const listing = await Listing.findByPk(req.params.id, {
      include: [{ model: User, as: 'farmer', attributes: ['name', 'location', 'phone'] }]
    });
    if (!listing) return res.status(404).json({ success: false, error: 'Listing not found' });
    res.json({ success: true, data: listing });
  } catch (err) { next(err); }
});

router.put('/:id', verifyToken, requireRole('farmer'), async (req, res, next) => {
  try {
    const listing = await Listing.findByPk(req.params.id);
    if (!listing) return res.status(404).json({ success: false, error: 'Listing not found' });
    if (listing.farmer_id !== req.user.id) return res.status(403).json({ success: false, error: 'Unauthorized' });
    
    await listing.update(req.body);
    res.json({ success: true, data: listing });
  } catch (err) { next(err); }
});

router.delete('/:id', verifyToken, requireRole('farmer'), async (req, res, next) => {
  try {
    const listing = await Listing.findByPk(req.params.id);
    if (!listing) return res.status(404).json({ success: false, error: 'Listing not found' });
    if (listing.farmer_id !== req.user.id) return res.status(403).json({ success: false, error: 'Unauthorized' });
    
    await listing.destroy();
    res.json({ success: true, data: { message: 'Listing deleted' } });
  } catch (err) { next(err); }
});

// Markup Check route attached here
router.post('/:id/markup-check', async (req, res, next) => {
  try {
    const { enteredPrice } = req.body;
    const listing = await Listing.findByPk(req.params.id);
    if (!listing) return res.status(404).json({ success: false, error: 'Listing not found' });
    
    // Attempt to fetch price based on listing crop_name and a default or listing location
    const mandiData = await priceService.fetchMandiPrice(listing.crop_name, 'Maharashtra', 'Pune'); // using default fallback for example
    if (!mandiData) return res.status(404).json({ success: false, error: 'Mandi price not available' });
    
    const advice = await advisorService.getAdvice({ 
      mandiPrice: mandiData.modal_price, 
      enteredPrice: parseFloat(enteredPrice), 
      crop: listing.crop_name 
    });
    
    res.json({
      success: true,
      data: {
        mandiModalPrice: mandiData.modal_price,
        enteredPrice: parseFloat(enteredPrice),
        percentDifference: advice.percentDifference,
        absoluteDifference: mandiData.modal_price - enteredPrice,
        potentialLossPerUnit: mandiData.modal_price > enteredPrice ? mandiData.modal_price - enteredPrice : 0,
        verdict: advice.verdict
      }
    });
  } catch (err) { next(err); }
});

module.exports = router;`,
  'routes/prices.js': `const express = require('express');
const priceService = require('../services/priceService');
const mockPrices = require('../data/mockPrices.json');

const router = express.Router();

router.get('/', (req, res) => {
  const commodities = [...new Set(mockPrices.map(p => p.commodity))];
  const states = [...new Set(mockPrices.map(p => p.state))];
  res.json({ success: true, data: { commodities, states } });
});

router.get('/:commodity', async (req, res, next) => {
  try {
    const { state, market } = req.query;
    if (state && market) {
      const data = await priceService.fetchMandiPrice(req.params.commodity, state, market);
      return res.json({ success: true, data });
    }
    const allPrices = await priceService.getAllPricesForCommodity(req.params.commodity);
    res.json({ success: true, data: allPrices });
  } catch (err) { next(err); }
});

module.exports = router;`,
  'routes/deals.js': `const express = require('express');
const { Deal, Listing, User } = require('../models');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validate, dealValidation } = require('../middleware/validate');
const notificationService = require('../services/notificationService');
const { Op } = require('sequelize');

const router = express.Router();

router.post('/', verifyToken, requireRole('buyer'), dealValidation, validate, async (req, res, next) => {
  try {
    const { listing_id, offered_price } = req.body;
    const listing = await Listing.findByPk(listing_id);
    if (!listing) return res.status(404).json({ success: false, error: 'Listing not found' });
    
    const deal = await Deal.create({ listing_id, buyer_id: req.user.id, offered_price });
    await notificationService.createNotification(listing.farmer_id, \`New offer of ₹\${offered_price} for your \${listing.crop_name}\`, 'deal_update', deal.id);
    
    res.status(201).json({ success: true, data: deal });
  } catch (err) { next(err); }
});

router.get('/my', verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const deals = await Deal.findAll({
      include: [
        { model: Listing, as: 'listing', where: req.user.role === 'farmer' ? { farmer_id: userId } : {} },
        { model: User, as: 'buyer', attributes: ['id', 'name', 'phone'] }
      ],
      where: req.user.role === 'buyer' ? { buyer_id: userId } : {}
    });
    res.json({ success: true, data: deals });
  } catch (err) { next(err); }
});

router.patch('/:id', verifyToken, async (req, res, next) => {
  try {
    const { status, counter_price } = req.body;
    const deal = await Deal.findByPk(req.params.id, { include: [{ model: Listing, as: 'listing' }] });
    if (!deal) return res.status(404).json({ success: false, error: 'Deal not found' });
    
    const isBuyer = deal.buyer_id === req.user.id;
    const isFarmer = deal.listing.farmer_id === req.user.id;
    if (!isBuyer && !isFarmer) return res.status(403).json({ success: false, error: 'Unauthorized' });
    
    await deal.update({ status, counter_price });
    await notificationService.notifyDealUpdate(deal, deal.listing);
    
    res.json({ success: true, data: deal });
  } catch (err) { next(err); }
});

module.exports = router;`,
  'routes/notifications.js': `const express = require('express');
const notificationService = require('../services/notificationService');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/:userId', verifyToken, async (req, res, next) => {
  try {
    if (parseInt(req.params.userId) !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }
    const notifications = await notificationService.getUserNotifications(req.user.id);
    res.json({ success: true, data: notifications });
  } catch (err) { next(err); }
});

router.patch('/:id/read', verifyToken, async (req, res, next) => {
  try {
    await notificationService.markAsRead(req.params.id);
    res.json({ success: true, data: { message: 'Marked as read' } });
  } catch (err) { next(err); }
});

router.patch('/read-all', verifyToken, async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    res.json({ success: true, data: { message: 'All marked as read' } });
  } catch (err) { next(err); }
});

module.exports = router;`,
  'routes/advisor.js': `const express = require('express');
const advisorService = require('../services/advisorService');

const router = express.Router();

router.post('/explain', async (req, res, next) => {
  try {
    const { mandiPrice, enteredPrice, crop } = req.body;
    if (!mandiPrice || !enteredPrice || !crop) {
      return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }
    
    const advice = await advisorService.getAdvice({ mandiPrice, enteredPrice, crop });
    res.json({
      success: true,
      data: {
        explanation: advice.verdict,
        percentDifference: advice.percentDifference,
        verdict: advice.verdict
      }
    });
  } catch (err) { next(err); }
});

module.exports = router;`,
  'jobs/priceRefresh.js': `const cron = require('node-cron');
const priceService = require('../services/priceService');

const startJob = () => {
  cron.schedule('0 0 6 * * *', async () => {
    console.log('Running daily price refresh job at 6 AM IST...');
    try {
      await priceService.refreshAllPrices();
    } catch (err) {
      console.error('Error refreshing prices:', err);
    }
  }, {
    timezone: "Asia/Kolkata"
  });
};

module.exports = startJob;`,
  'server.js': `require('dotenv').config();
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
    console.log(\`Server is running on port \${PORT}\`);
    // Start jobs
    priceRefreshJob();
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});`,
  '.env': `PORT=5000
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=kisaanconnect
JWT_SECRET=supersecretkey
AGMARKNET_API_URL=
AGMARKNET_API_KEY=`
};

Object.entries(files).forEach(([filePath, content]) => {
  const fullPath = path.join(baseDir, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\\n');
});

// Create uploads directory
fs.mkdirSync(path.join(baseDir, 'uploads'), { recursive: true });

console.log('All backend files generated successfully.');
