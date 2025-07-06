// server/controllers/userController.js - User management controller
const User = require('../models/User');
const Credential = require('../models/Credential');
const { validationResult } = require('express-validator');
const { uploadToIPFS } = require('../utils/ipfs');
const crypto = require('crypto');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        verification: user.verification,
        role: user.role,
        walletAddress: user.walletAddress,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update profile fields
    const { firstName, lastName, dateOfBirth, address } = req.body;
    
    if (firstName) user.profile.firstName = firstName;
    if (lastName) user.profile.lastName = lastName;
    if (dateOfBirth) user.profile.dateOfBirth = new Date(dateOfBirth);
    if (address) user.profile.address = { ...user.profile.address, ...address };

    user.updatedAt = Date.now();
    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

// @desc    Get user dashboard data
// @route   GET /api/user/dashboard
// @access  Private
const getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user statistics based on role
    let dashboardData = {
      user: {
        id: user._id,
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        email: user.email,
        role: user.role,
        verification: user.verification
      },
      statistics: {},
      recentActivity: [],
      notifications: []
    };

    // Role-specific dashboard data
    if (user.role === 'citizen') {
      const credentials = await Credential.find({ userId: user._id });
      dashboardData.statistics = {
        totalCredentials: credentials.length,
        verifiedCredentials: credentials.filter(c => c.status === 'verified').length,
        pendingCredentials: credentials.filter(c => c.status === 'pending').length,
        sharedCredentials: credentials.filter(c => c.shareCount > 0).length
      };
    } else if (user.role === 'issuer') {
      const issuedCredentials = await Credential.find({ issuerId: user._id });
      dashboardData.statistics = {
        totalIssued: issuedCredentials.length,
        pendingReview: issuedCredentials.filter(c => c.status === 'pending').length,
        approved: issuedCredentials.filter(c => c.status === 'verified').length,
        rejected: issuedCredentials.filter(c => c.status === 'rejected').length
      };
    } else if (user.role === 'verifier') {
      // Add verifier-specific statistics
      dashboardData.statistics = {
        totalVerifications: 0, // TODO: Implement verification tracking
        todayVerifications: 0,
        successfulVerifications: 0,
        failedVerifications: 0
      };
    }

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data'
    });
  }
};

// @desc    Get user account information
// @route   GET /api/user/account
// @access  Private
const getAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        verification: user.verification,
        settings: {
          emailNotifications: user.settings?.emailNotifications ?? true,
          smsNotifications: user.settings?.smsNotifications ?? false,
          twoFactorEnabled: user.settings?.twoFactorEnabled ?? false,
          language: user.settings?.language ?? 'en',
          timezone: user.settings?.timezone ?? 'UTC'
        },
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching account information'
    });
  }
};

// @desc    Update user account settings
// @route   PUT /api/user/account
// @access  Private
const updateAccount = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update account settings
    const { emailNotifications, smsNotifications, twoFactorEnabled, language, timezone } = req.body;
    
    if (!user.settings) user.settings = {};
    
    if (emailNotifications !== undefined) user.settings.emailNotifications = emailNotifications;
    if (smsNotifications !== undefined) user.settings.smsNotifications = smsNotifications;
    if (twoFactorEnabled !== undefined) user.settings.twoFactorEnabled = twoFactorEnabled;
    if (language !== undefined) user.settings.language = language;
    if (timezone !== undefined) user.settings.timezone = timezone;

    user.updatedAt = Date.now();
    await user.save();

    res.json({
      success: true,
      message: 'Account settings updated successfully',
      data: {
        settings: user.settings
      }
    });
  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating account settings'
    });
  }
};

// @desc    Get user activity history
// @route   GET /api/user/activity
// @access  Private
const getActivity = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, startDate, endDate } = req.query;
    
    // TODO: Implement activity tracking system
    // For now, return placeholder data
    const activities = [
      {
        id: '1',
        type: 'login',
        description: 'User logged in',
        timestamp: new Date(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    ];

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: activities.length,
          pages: Math.ceil(activities.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity history'
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/user/statistics
// @access  Private
const getStatistics = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Basic statistics - can be expanded based on role
    const stats = {
      accountAge: Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)), // days
      verificationLevel: user.verification.verificationLevel,
      lastLogin: user.lastLogin || user.createdAt,
      profileCompletion: calculateProfileCompletion(user)
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
};

// Helper function to calculate profile completion percentage
const calculateProfileCompletion = (user) => {
  let completion = 0;
  const fields = [
    user.profile.firstName,
    user.profile.lastName,
    user.email,
    user.profile.dateOfBirth,
    user.profile.address?.street,
    user.profile.address?.city,
    user.profile.profileImage,
    user.verification.emailVerified,
    user.verification.phoneVerified
  ];
  
  const completedFields = fields.filter(field => field).length;
  completion = Math.round((completedFields / fields.length) * 100);
  
  return completion;
};

// Placeholder implementations for remaining methods
const uploadAvatar = async (req, res) => {
  res.status(501).json({ success: false, message: 'Upload avatar not implemented yet' });
};

const deleteAvatar = async (req, res) => {
  res.status(501).json({ success: false, message: 'Delete avatar not implemented yet' });
};

const getPreferences = async (req, res) => {
  res.status(501).json({ success: false, message: 'Get preferences not implemented yet' });
};

const updatePreferences = async (req, res) => {
  res.status(501).json({ success: false, message: 'Update preferences not implemented yet' });
};

const deactivateAccount = async (req, res) => {
  res.status(501).json({ success: false, message: 'Deactivate account not implemented yet' });
};

const exportUserData = async (req, res) => {
  res.status(501).json({ success: false, message: 'Export user data not implemented yet' });
};

const downloadExportedData = async (req, res) => {
  res.status(501).json({ success: false, message: 'Download exported data not implemented yet' });
};

module.exports = {
  getProfile,
  updateProfile,
  getDashboard,
  getAccount,
  updateAccount,
  getActivity,
  getStatistics,
  uploadAvatar,
  deleteAvatar,
  getPreferences,
  updatePreferences,
  deactivateAccount,
  exportUserData,
  downloadExportedData
};
