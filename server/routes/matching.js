const express = require('express');
const router = express.Router();
const matchingService = require('../services/matchingService');

// GET /api/matching/best-buyers?crop=Onion&quantity=100&location=Nashik
router.get('/best-buyers', async (req, res) => {
  try {
    const { crop = 'Onion', quantity = 100, location = 'Nashik, Maharashtra' } = req.query;
    const result = await matchingService.getBestBuyersForCrop({
      cropName: crop,
      quantity: Number(quantity),
      farmerLocation: location
    });
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching best buyers:', error);
    res.status(500).json({ error: 'Failed to compute buyer matches' });
  }
});

module.exports = router;
