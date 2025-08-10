const express = require('express');
const axios = require('axios');
const router = express.Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:7860';

router.post('/feedback', async (req, res) => {
  try {
    const { audioFilePath, answer } = req.body;
    // Gradio expects a POST to /api/predict with { data: [audio, answer] }
    const response = await axios.post(`${AI_SERVICE_URL}/api/predict`, {
      data: [audioFilePath, answer]
    });
    // response.data.data is [transcript, feedback]
    res.json({
      transcript: response.data.data[0],
      feedback: response.data.data[1]
    });
  } catch (error) {
    console.error('AI feedback error:', error?.response?.data || error.message);
    res.status(500).json({ error: 'AI service error' });
  }
});

module.exports = router;