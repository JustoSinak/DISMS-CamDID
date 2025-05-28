// identity-blockchain-app/server/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register new user with name and email
const register = async (req, res) => {
  try {
    const { 
      username,
      firstName,
      lastName,
      email, 
      password
    } = req.body;

    // Basic validation
    if (!username || !firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, first name, last name, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      username,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      isVerified: false, // Will be verified later with government database
      createdAt: new Date()
    });

    // Save user to database with try-catch to isolate errors
    let savedUser;
    try {
      savedUser = await newUser.save();
    } catch (saveError) {
      console.error('Error saving user:', saveError);
      return res.status(500).json({
        success: false,
        message: 'Error saving user to database'
      });
    }

    // Check for JWT_SECRET presence
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: JWT_SECRET is not set'
      });
    }

    // Generate JWT token with try-catch to isolate errors
    let token;
    try {
      token = jwt.sign(
        { 
          userId: savedUser._id, 
          email: savedUser.email 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
    } catch (tokenError) {
      console.error('Error generating JWT token:', tokenError);
      return res.status(500).json({
        success: false,
        message: 'Error generating authentication token'
      });
    }

    // Return success response
    const userResponse = {
      id: savedUser._id,
      username: savedUser.username,
      name: `${savedUser.firstName} ${savedUser.lastName}`.trim(),
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      isVerified: savedUser.isVerified
    };

    res.json({
      success: true,
      message: 'Registration successful',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Return success response
    const userResponse = {
      id: user._id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isVerified: user.isVerified
    };

    res.json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    // req.user is set by auth middleware
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Logout (simple token invalidation - can be enhanced later)
const logout = async (req, res) => {
  try {
    // In a more advanced implementation, you would:
    // 1. Add token to blacklist
    // 2. Clear refresh tokens
    // 3. Log the logout event
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  logout
};
