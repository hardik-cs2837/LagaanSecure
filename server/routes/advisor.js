const express = require('express');
const router = express.Router();
const advisorService = require('../services/advisorService');
const aiService = require('../services/aiService');

// POST /api/advisor/explain (Fair Price & Intermediary Markup explanation)
router.post('/explain', async (req, res) => {
  try {
    const { mandiPrice, enteredPrice, crop, state, market } = req.body;
    const result = await advisorService.getMarkupExplanation({ mandiPrice, enteredPrice, crop, state, market });
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Advisor error:', error);
    res.status(500).json({ error: 'Failed to generate fair-price advice' });
  }
});

// POST /api/advisor/chat (AI Farm Copilot / Chatbot)
router.post('/chat', async (req, res) => {
  try {
    const { message, context, language = 'en' } = req.body;
    const result = await aiService.askCopilot({
      query: message,
      userContext: context || {},
      language
    });
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('AI Copilot error:', error);
    res.status(500).json({ error: 'Failed to generate response from copilot' });
  }
});

module.exports = router;
