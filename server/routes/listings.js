const express = require('express');
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
    if (crop) whereClause.crop_name = { [Op.iLike]: `%${crop}%` };
    if (location) whereClause.location = { [Op.iLike]: `%${location}%` };
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

module.exports = router;\n