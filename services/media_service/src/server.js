/**
 * Media Service
 * Main server file
 */
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const path = require('path');
const sequelize = require('../config/database');
const mediaRoutes = require('./routes/mediaRoutes');
const { errorHandler } = require('./utils/errorHandler');

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/media', mediaRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    service: 'media-service',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware (must be after routes)
app.use(errorHandler);

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Database connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Sync database (create tables if they don't exist)
    await sequelize.sync({ force: false });
    console.log('✅ Database synchronized');
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    // Exit process with failure in a production environment
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Start server
const startServer = async () => {
  await connectDB();
  
  const PORT = process.env.PORT || 3002;
  const server = app.listen(PORT, () => {
    console.log(`🚀 Media service running on port ${PORT}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    // Close server & exit process in production
    if (process.env.NODE_ENV === 'production') {
      server.close(() => process.exit(1));
    }
  });

  return server;
};

// Only start server if file is run directly (not imported)
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
