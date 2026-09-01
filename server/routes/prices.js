const express = require('express');
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

module.exports = router;\n