const { buildSystemPrompt } = require('../utils/promptBuilder');
const { logInfo, logError } = require('../utils/logger');
const express = require('express');
const router = express.Router();

// If using Node 18+, fetch is global. If not, uncomment the next line:
// const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

router.post('/', async (req, res, next) => {
  const prompt = req.body.prompt;
  if (!prompt) {
    const err = new Error('Missing prompt');
    err.status = 400;
    return next(err);
  }

  const systemPrompt = buildSystemPrompt(prompt);

  try {
    logInfo(`Received prompt: "${prompt}"`);
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
      const err = new Error('No response from Gemini');
      err.status = 500;
      throw err;
    }

    logInfo('AI drawing commands generated successfully.');
    res.json({
      message: "Here's how I'll draw it!",
      commands: text.split('\n').map(line => line.trim()).filter(Boolean)
    });
  } catch (err) {
    logError(`AI error: ${err.message}`);
    next(err); // Forward error to central handler
  }
});

module.exports = router;
// This route handles the AI drawing generation requests.
// It expects a POST request with a JSON body containing a "prompt" field.