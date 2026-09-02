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
        { 
          model: Listing, 
          as: 'listing', 
          where: req.user.role === 'farmer' ? { farmer_id: userId } : {},
          include: [{ model: User, as: 'farmer', attributes: ['id', 'name', 'phone', 'location', 'business_name', 'is_verified', 'fpo_name'] }]
        },
        { 
          model: User, 
          as: 'buyer', 
          attributes: ['id', 'name', 'phone', 'location', 'business_name', 'is_verified'] 
        }
      ],
      where: req.user.role === 'buyer' ? { buyer_id: userId } : {},
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: deals });
  } catch (err) { next(err); }
});

router.patch('/:id', verifyToken, async (req, res, next) => {
  try {
    const { 
      status, 
      counter_price, 
      payment_status, 
      payment_method, 
      payment_reference,
      dispute_status,
      dispute_reason,
      dispute_resolution,
      transport_requested,
      transport_details
    } = req.body;
    
    const deal = await Deal.findByPk(req.params.id, { 
      include: [
        { model: Listing, as: 'listing' },
        { model: User, as: 'buyer', attributes: ['id', 'name'] }
      ] 
    });
    if (!deal) return res.status(404).json({ success: false, error: 'Deal not found' });
    
    const isBuyer = deal.buyer_id === req.user.id;
    const isFarmer = deal.listing.farmer_id === req.user.id;
    if (!isBuyer && !isFarmer) return res.status(403).json({ success: false, error: 'Unauthorized' });
    
    const updates = {};
    if (status) updates.status = status;
    if (counter_price !== undefined) updates.counter_price = counter_price;
    if (payment_status) updates.payment_status = payment_status;
    if (payment_method) updates.payment_method = payment_method;
    if (payment_reference !== undefined) updates.payment_reference = payment_reference;
    if (dispute_status) updates.dispute_status = dispute_status;
    if (dispute_reason !== undefined) updates.dispute_reason = dispute_reason;
    if (dispute_resolution !== undefined) updates.dispute_resolution = dispute_resolution;
    if (transport_requested !== undefined) updates.transport_requested = transport_requested;
    if (transport_details !== undefined) updates.transport_details = transport_details;
    
    await deal.update(updates);
    
    // Notifications for specific events
    if (status) {
      await notificationService.notifyDealUpdate(deal, deal.listing);
    }
    if (payment_status === 'paid' || payment_status === 'pending_confirmation') {
      const recipientId = isBuyer ? deal.listing.farmer_id : deal.buyer_id;
      await notificationService.createNotification(
        recipientId,
        `Payment status for ${deal.listing.crop_name} deal updated to "${payment_status.replace('_', ' ').toUpperCase()}".`,
        'payment_update',
        deal.id
      );
    }
    if (dispute_status === 'open') {
      const recipientId = isBuyer ? deal.listing.farmer_id : deal.buyer_id;
      await notificationService.createNotification(
        recipientId,
        `A grievance/dispute was opened for ${deal.listing.crop_name} deal: "${dispute_reason || 'Under review'}"`,
        'dispute_update',
        deal.id
      );
    }
    if (transport_requested) {
      await notificationService.createNotification(
        deal.listing.farmer_id,
        `Transport was requested for ${deal.listing.crop_name} (${transport_details?.provider_name || 'Logistics Partner'}).`,
        'transport_update',
        deal.id
      );
    }
    
    res.json({ success: true, data: deal });
  } catch (err) { next(err); }
});

module.exports = router;
