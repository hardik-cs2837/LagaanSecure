const axios = require('axios');
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
};\n