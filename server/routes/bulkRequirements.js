const express = require('express');
const router = express.Router();
const { BulkRequirement, User } = require('../models');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET /api/bulk-requirements (Public / Browse active institutional requirements)
router.get('/', async (req, res) => {
  try {
    const { crop, status = 'open' } = req.query;
    const where = {};
    if (status) where.status = status;
    if (crop) where.crop_name = crop;

    const requirements = await BulkRequirement.findAll({
      where,
      include: [{ model: User, as: 'buyer', attributes: ['id', 'name', 'business_name', 'is_verified', 'rating_avg', 'deals_completed_count'] }],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: requirements
    });
  } catch (error) {
    console.error('Error fetching bulk requirements:', error);
    res.status(500).json({ error: 'Failed to fetch bulk requirements' });
  }
});

// POST /api/bulk-requirements (Buyer only: Post institutional requirement)
router.post('/', verifyToken, requireRole('buyer'), async (req, res) => {
  try {
    const {
      crop_name,
      quantity_quintals,
      target_price_min,
      target_price_max,
      quality_grade = 'A',
      delivery_location,
      required_by_date,
      business_type = 'supermarket',
      additional_specs
    } = req.body;

    if (!crop_name || !quantity_quintals || !target_price_min || !target_price_max || !delivery_location || !required_by_date) {
      return res.status(400).json({ error: 'Please provide all mandatory requirement fields' });
    }

    const requirement = await BulkRequirement.create({
      buyer_id: req.user.id,
      buyer_name: req.user.business_name || req.user.name,
      business_type,
      crop_name,
      quantity_quintals: Number(quantity_quintals),
      target_price_min: Number(target_price_min),
      target_price_max: Number(target_price_max),
      quality_grade,
      delivery_location,
      required_by_date,
      additional_specs
    });

    res.status(201).json({
      success: true,
      message: 'Bulk procurement requirement published successfully!',
      data: requirement
    });
  } catch (error) {
    console.error('Error creating bulk requirement:', error);
    res.status(500).json({ error: 'Failed to publish bulk requirement' });
  }
});

module.exports = router;
