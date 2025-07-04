// identity-blockchain-app/server/app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const citizenRoutes = require('./routes/citizen');
const issuerRoutes = require('./routes/issuer');
const verifierRoutes = require('./routes/verifier');
const adminRoutes = require('./routes/admin');
const identityRoutes = require('./routes/identity');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from your frontend domain
    if (origin === 'https://cam-did-sib8.vercel.app' || 
        origin === 'http://localhost:3000' ||
        !origin) { // Allow direct requests without origin
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization']
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// MongoDB connection with proper options for Atlas
const connectDB = async () => {
  const connectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 50000, // Increased timeout to 50s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    bufferCommands: false, // Disable mongoose buffering
  };

  // Removed detailed connection options logging to avoid terminal clutter
  // console.log('Attempting to connect to MongoDB with options:', connectionOptions);

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/camdid_dev', connectionOptions);

    console.log('✅ Connected to MongoDB');
    console.log(`📍 Database: ${conn.connection.name}`);
    console.log(`🌐 Host: ${conn.connection.host}:${conn.connection.port}`);

    // Add mongoose connection event listeners for debugging
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to DB');
    });
    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });
    mongoose.connection.on('disconnected', () => {
      console.warn('Mongoose disconnected');
    });
    mongoose.connection.on('reconnecting', () => {
      console.log('Mongoose reconnecting...');
    });
    mongoose.connection.on('reconnected', () => {
      console.log('Mongoose reconnected');
    });
    mongoose.connection.on('close', () => {
      console.log('Mongoose connection closed');
    });
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.stack || error);
    console.error('🔍 Connection string being used:', process.env.MONGO_URI ? 'Atlas URI (hidden for security)' : 'Local fallback');
    process.exit(1);
  }
};

// Connect to database
connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/citizen', citizenRoutes);
app.use('/api/issuer', issuerRoutes);
app.use('/api/verifier', verifierRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/identity', identityRoutes);

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Test route is working!'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'CamDID API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`CamDID Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;