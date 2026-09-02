const express = require('express');
const { Deal, Listing, User } = require('../models');
const { verifyToken } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Get list of disputes / trade grievances
router.get('/', async (req, res, next) => {
  try {
    const disputes = await Deal.findAll({
      where: {
        dispute_status: { [Op.ne]: 'none' }
      },
      include: [
        {
          model: Listing,
          as: 'listing',
          include: [{ model: User, as: 'farmer', attributes: ['id', 'name', 'phone', 'location', 'fpo_name'] }]
        },
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'name', 'phone', 'business_name', 'location']
        }
      ],
      order: [['updated_at', 'DESC']]
    });

    res.json({
      success: true,
      data: disputes
    });
  } catch (err) {
    next(err);
  }
});

// Raise a new dispute for a deal
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const { deal_id, category, description } = req.body;
    const deal = await Deal.findByPk(deal_id, {
      include: [
        { model: Listing, as: 'listing' },
        { model: User, as: 'buyer' }
      ]
    });

    if (!deal) {
      return res.status(404).json({ success: false, error: 'Deal not found' });
    }

    const timeline = Array.isArray(deal.audit_timeline) ? [...deal.audit_timeline] : [];
    const reasonText = category ? `[${category}] ${description}` : description;
    const now = new Date().toISOString();

    timeline.push({
      event: 'DISPUTE_OPENED',
      actor: req.user.role || 'user',
      title: 'Grievance / Dispute Filed',
      description: reasonText,
      timestamp: now
    });

    await deal.update({
      dispute_status: 'open',
      dispute_reason: reasonText,
      audit_timeline: timeline
    });

    res.status(201).json({
      success: true,
      data: deal
    });
  } catch (err) {
    next(err);
  }
});

// Update dispute status (Open -> Under Review -> Action Required -> Resolved)
router.patch('/:id/status', verifyToken, async (req, res, next) => {
  try {
    const { dispute_status, dispute_resolution } = req.body;
    const deal = await Deal.findByPk(req.params.id, {
      include: [{ model: Listing, as: 'listing' }]
    });

    if (!deal) {
      return res.status(404).json({ success: false, error: 'Deal not found' });
    }

    const timeline = Array.isArray(deal.audit_timeline) ? [...deal.audit_timeline] : [];
    const now = new Date().toISOString();

    timeline.push({
      event: dispute_status === 'resolved' ? 'DISPUTE_RESOLVED' : 'DISPUTE_STATUS_UPDATED',
      actor: req.user.role || 'admin',
      title: `Dispute Status Updated: ${dispute_status.toUpperCase()}`,
      description: dispute_resolution || `Status changed to ${dispute_status}`,
      timestamp: now
    });

    const updates = {
      dispute_status,
      audit_timeline: timeline
    };
    if (dispute_resolution !== undefined) {
      updates.dispute_resolution = dispute_resolution;
    }

    await deal.update(updates);

    res.json({
      success: true,
      data: deal
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
