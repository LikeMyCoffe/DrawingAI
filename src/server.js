require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./utils/errorHandler');
const { logInfo } = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

app.use(cors());
app.use(express.json());

// Import and use the generate route
const generateRoute = require('./routes/generate');
app.use('/api/generate', generateRoute);

// Fallback: serve index.html for any unknown route (for SPA support)
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Error handling middleware (should be last)
app.use(errorHandler);

app.listen(PORT, () => {
  logInfo(`Backend server running on http://localhost:${PORT}`);
});
