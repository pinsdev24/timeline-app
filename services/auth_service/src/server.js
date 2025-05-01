/**
 * Authentication Service
 * Main server file
 */
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const db = require('./config/database');
const { errorHandler } = require('./utils/errorHandler');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'auth-service' });
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
    await db.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Sync database (create tables if they don't exist)
    await db.sync({ force: false });
    console.log('✅ Database synchronized');
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    // Exit process with failure in a production environment
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Connect to database
connectDB();

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Auth service running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process in production
  if (process.env.NODE_ENV === 'production') {
    server.close(() => process.exit(1));
  }
});

module.exports = { app, server }; // Export for testing
