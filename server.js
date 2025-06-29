require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express(); // <-- Define app BEFORE using it!
const PORT = process.env.PORT || 3000;

// Serve static files from the src directory
app.use(express.static(path.join(__dirname, 'src')));

app.use(cors());
app.use(express.json());

app.post('/api/generate', async (req, res) => {
  const prompt = req.body.prompt;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  // Enhanced system prompt for better, more accurate, and creative freehand drawings
  const systemPrompt = `
You are an expert AI artist. When given a drawing request, respond with a step-by-step list of drawing commands to create the requested object on an 800x500 canvas.

Use only these commands, one per line, in the order to execute them:
- beginPath()
- moveTo(x, y)
- lineTo(x, y)
- closePath()
- stroke()
- setStrokeStyle(color)
- setFillStyle(color)
- fill()

Guidelines:
- Use setStrokeStyle(color) and setFillStyle(color) before drawing to set outline and fill colors (e.g. setStrokeStyle("#ff0000")).
- Use fill() after closePath() to fill a shape.
- For curves, approximate with several short lineTo segments.
- For complex shapes, break them into multiple paths.
- Do NOT output any text, explanations, or JSON. Only output the drawing commands, one per line.
- Use coordinates that fit nicely within the 800x500 canvas.
- Make your drawings visually appealing and creative.

Examples:

House:
setStrokeStyle("#000000")
setFillStyle("#ffcc99")
beginPath()
moveTo(200, 400)
lineTo(400, 400)
lineTo(400, 250)
lineTo(200, 250)
closePath()
fill()
stroke()
setStrokeStyle("#000000")
setFillStyle("#cc3333")
beginPath()
moveTo(200, 250)
lineTo(300, 150)
lineTo(400, 250)
closePath()
fill()
stroke()
setStrokeStyle("#000000")
setFillStyle("#ffffff")
beginPath()
moveTo(250, 400)
lineTo(250, 325)
lineTo(350, 325)
lineTo(350, 400)
closePath()
fill()
stroke()

Now, draw the following as described by the user:
${prompt}
`;

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
    // Uncomment for debugging:
    // console.log('Gemini response:', JSON.stringify(data, null, 2));

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return res.status(500).json({ error: 'No response from Gemini' });
    }

    // Only return the drawing commands, one per line
    res.json({
      message: "Here's how I'll draw it!",
      commands: text.split('\n').map(line => line.trim()).filter(Boolean)
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// Fallback: serve index.html for any unknown route (for SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
