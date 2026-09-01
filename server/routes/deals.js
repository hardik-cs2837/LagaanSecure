const express = require('express');
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
    await notificationService.createNotification(listing.farmer_id, `New offer of ₹${offered_price} for your ${listing.crop_name}`, 'deal_update', deal.id);
    
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

module.exports = router;\n