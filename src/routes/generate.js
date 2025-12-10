const { buildSystemPrompt } = require('../utils/promptBuilder');
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const prompt = req.body.prompt;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is missing from environment variables');
    return res.status(500).json({ error: 'API key not configured' });
  }

  const systemPrompt = buildSystemPrompt(prompt);

  try {
    console.log('Making request to Gemini 2.5 Flash API...');
    
    // Use Gemini 2.5 Flash with v1 API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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

    console.log('Response status:', response.status);
    const data = await response.json();
    
    // Only log first 200 chars to avoid spam
    console.log('Response preview:', JSON.stringify(data, null, 2).substring(0, 200) + '...');

    if (data.error) {
      console.error('Gemini API error:', data.error);
      return res.status(500).json({ error: 'Gemini API error: ' + data.error.message });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error('No text in response. Full response:', data);
      return res.status(500).json({ error: 'No response from Gemini' });
    }

    console.log('Successfully got response from Gemini 2.5 Flash');
    console.log('Response length:', text.length, 'characters');
    
    res.json({
      message: "Here's how I'll draw it!",
      commands: text.split('\n').map(line => line.trim()).filter(Boolean)
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

module.exports = router;
