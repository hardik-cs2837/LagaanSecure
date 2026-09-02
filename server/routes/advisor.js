const express = require('express');
const advisorService = require('../services/advisorService');

const router = express.Router();

router.post('/explain', async (req, res, next) => {
  try {
    const { mandiPrice, enteredPrice, crop } = req.body;
    if (!mandiPrice || !enteredPrice || !crop) {
      return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }
    
    const advice = await advisorService.getAdvice({ mandiPrice, enteredPrice, crop });
    res.json({
      success: true,
      data: {
        explanation: advice.verdict,
        percentDifference: advice.percentDifference,
        verdict: advice.verdict
      }
    });
  } catch (err) { next(err); }
});

module.exports = router;
