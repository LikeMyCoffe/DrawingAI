const { logError } = require('./logger');

// Express error-handling middleware
function errorHandler(err, req, res, next) {
  logError(`${req.method} ${req.originalUrl} - ${err.message}`);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
}

module.exports = errorHandler;
// This middleware should be used after all other routes and middleware in your Express app.