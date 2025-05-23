/**
 * Event Service Entry Point
 */
require('dotenv').config();
const { startServer } = require('./src/server');

// Start the server
startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
