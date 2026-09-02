const cron = require('node-cron');
const marketDataService = require('../services/marketDataService');

const startJob = () => {
  cron.schedule('0 0 6 * * *', async () => {
    console.log('Running daily price refresh job at 6 AM IST...');
    try {
      await marketDataService.refreshAllPrices();
    } catch (err) {
      console.error('Error refreshing prices:', err);
    }
  }, {
    timezone: "Asia/Kolkata"
  });
};

module.exports = startJob;
