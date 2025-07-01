const { buildSystemPrompt } = require('../utils/promptBuilder');
const express = require('express');
const router = express.Router();

// If using Node 18+, fetch is global. If not, uncomment the next line:
// const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

router.post('/', async (req, res) => {
  const prompt = req.body.prompt;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  // Enhanced system prompt for better, more accurate, and creative freehand drawings
  const systemPrompt = buildSystemPrompt(prompt);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: systemPrompt }]
          }]
        })
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return res.status(500).json({ error: 'No response from Gemini' });
    }

    res.json({
      message: "Here's how I'll draw it!",
      commands: text.split('\n').map(line => line.trim()).filter(Boolean)
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

module.exports = router;