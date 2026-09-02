const express = require('express');
const router = express.Router();
const demandForecastService = require('../services/demandForecastService');

// GET /api/demand/forecast?crop=Onion
router.get('/forecast', (req, res) => {
  try {
    const crop = req.query.crop || 'Onion';
    const forecast = demandForecastService.getForecast(crop);
    res.json({
      success: true,
      data: forecast
    });
  } catch (error) {
    console.error('Error fetching demand forecast:', error);
    res.status(500).json({ error: 'Failed to generate demand forecast' });
  }
});

// GET /api/demand/all
router.get('/all', (req, res) => {
  try {
    const all = demandForecastService.getAllCropsForecast();
    res.json({
      success: true,
      data: all
    });
  } catch (error) {
    console.error('Error fetching all demand forecasts:', error);
    res.status(500).json({ error: 'Failed to fetch demand forecasts' });
  }
});

module.exports = router;
