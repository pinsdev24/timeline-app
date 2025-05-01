/**
 * Event Service
 * Main server file
 */
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const sequelize = require('./config/database');
const eventRoutes = require('./routes/eventRoutes');
const periodRoutes = require('./routes/periodRoutes');
const { errorHandler } = require('./utils/errorHandler');
const config = require('./config');

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/events', eventRoutes);
app.use('/api/periods', periodRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    service: 'event-service',
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
  
  const PORT = config.app.port;
  const server = app.listen(PORT, () => {
    console.log(`🚀 Event service running on port ${PORT}`);
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
