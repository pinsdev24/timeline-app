/**
 * Application Configuration
 */
require('dotenv').config();

module.exports = {
  // Service URLs
  services: {
    media: process.env.MEDIA_SERVICE_URL || 'http://localhost:3001',
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3000'
  },
  
  // Application settings
  app: {
    port: process.env.PORT || 3002,
    env: process.env.NODE_ENV || 'development'
  }
};
