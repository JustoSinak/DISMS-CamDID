const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register new user with government ID
const register = async (req, res) => {
  try {
    const { 
      nationalId, 
      email, 
      password, 
      firstName, 
      lastName, 
      phoneNumber 
    } = req.body;

    // Basic validation
    if (!nationalId || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'National ID, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { nationalId }] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or National ID already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      nationalId,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phoneNumber,
      isVerified: false, // Will be verified later with government database
      createdAt: new Date()
    });

    // Save user to database
    const savedUser = await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: savedUser._id, 
        nationalId: savedUser.nationalId 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return success response (don't send password)
    const userResponse = {
      id: savedUser._id,
      nationalId: savedUser.nationalId,
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      isVerified: savedUser.isVerified
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
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
    const { nationalId, password } = req.body;

    // Basic validation
    if (!nationalId || !password) {
      return res.status(400).json({
        success: false,
        message: 'National ID and password are required'
      });
    }

    // Find user by national ID
    const user = await User.findOne({ nationalId });
    
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
        nationalId: user.nationalId 
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
      nationalId: user.nationalId,
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