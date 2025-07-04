const User = require('../models/User');
const Credential = require('../models/Credential');
const Identity = require('../models/identity');
const VerificationRecord = require('../models/VerificationRecord');
const { validationResult } = require('express-validator');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

// Get comprehensive admin dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      verifiedUsers,
      adminUsers,
      issuerUsers,
      verifierUsers,
      totalCredentials,
      totalIdentities,
      recentUsers,
      recentCredentials,
      systemHealth
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isVerified: true }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'issuer' }),
      User.countDocuments({ role: 'verifier' }),
      Credential.countDocuments(),
      Identity.countDocuments(),
      User.find({}, '-password').sort({ createdAt: -1 }).limit(10),
      Credential.find().sort({ createdAt: -1 }).limit(10),
      getSystemHealth()
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          verified: verifiedUsers,
          admins: adminUsers,
          issuers: issuerUsers,
          verifiers: verifierUsers,
          recent: recentUsers
        },
        credentials: {
          total: totalCredentials,
          recent: recentCredentials
        },
        identities: {
          total: totalIdentities
        },
        system: systemHealth
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
};

// Get system health metrics
const getSystemHealth = async () => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      hourlyUsers,
      dailyUsers,
      hourlyCredentials,
      dailyCredentials,
      activeUsers
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: oneHourAgo } }),
      User.countDocuments({ createdAt: { $gte: oneDayAgo } }),
      Credential.countDocuments({ createdAt: { $gte: oneHourAgo } }),
      Credential.countDocuments({ createdAt: { $gte: oneDayAgo } }),
      User.countDocuments({ lastActive: { $gte: oneHourAgo } })
    ]);

    return {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      hourlyUsers,
      dailyUsers,
      hourlyCredentials,
      dailyCredentials,
      activeUsers,
      timestamp: now
    };
  } catch (error) {
    console.error('Error getting system health:', error);
    return { error: 'Failed to get system health' };
  }
};

// Get user details
const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const [user, credentials, identities, verifications] = await Promise.all([
      User.findById(userId, '-password'),
      Credential.find({ userId }),
      Identity.find({ userId }),
      VerificationRecord.find({ userId })
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user,
        credentials: credentials.length,
        identities: identities.length,
        verifications: verifications.length,
        activity: {
          lastLogin: user.lastLogin,
          lastActive: user.lastActive,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user details'
    });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { userId } = req.params;
    const { role } = req.body;

    if (!['citizen', 'issuer', 'verifier', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent removing the last admin
    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot remove the last admin user'
        });
      }
    }

    const oldRole = user.role;
    user.role = role;
    user.updatedAt = new Date();
    await user.save();

    // Log the role change
    console.log(`Admin ${req.user.id} changed user ${userId} role from ${oldRole} to ${role}`);

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
        oldRole
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user role'
    });
  }
};

// Deactivate user account
const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deactivating the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot deactivate the last admin user'
        });
      }
    }

    user.isActive = false;
    user.deactivatedAt = new Date();
    user.deactivationReason = reason;
    await user.save();

    // Log the deactivation
    console.log(`Admin ${req.user.id} deactivated user ${userId}. Reason: ${reason}`);

    res.json({
      success: true,
      message: 'User account deactivated successfully',
      data: {
        id: user._id,
        email: user.email,
        deactivatedAt: user.deactivatedAt,
        reason: user.deactivationReason
      }
    });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating user account'
    });
  }
};

// Reactivate user account
const reactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = true;
    user.deactivatedAt = null;
    user.deactivationReason = null;
    user.reactivatedAt = new Date();
    await user.save();

    // Log the reactivation
    console.log(`Admin ${req.user.id} reactivated user ${userId}`);

    res.json({
      success: true,
      message: 'User account reactivated successfully',
      data: {
        id: user._id,
        email: user.email,
        reactivatedAt: user.reactivatedAt
      }
    });
  } catch (error) {
    console.error('Error reactivating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error reactivating user account'
    });
  }
};

// Get system analytics
const getSystemAnalytics = async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    const now = new Date();
    let startDate;

    switch (period) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const [
      userRegistrations,
      credentialIssuances,
      verifications,
      activeUsers
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: startDate } }),
      Credential.countDocuments({ createdAt: { $gte: startDate } }),
      VerificationRecord.countDocuments({ createdAt: { $gte: startDate } }),
      User.countDocuments({ lastActive: { $gte: startDate } })
    ]);

    res.json({
      success: true,
      data: {
        period,
        startDate,
        endDate: now,
        metrics: {
          userRegistrations,
          credentialIssuances,
          verifications,
          activeUsers
        }
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics'
    });
  }
};

// Get admin activity logs
const getAdminActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, adminId, action, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    // This would typically query from an audit log collection
    // For now, we'll return a mock response
    const mockLogs = [
      {
        id: 1,
        adminId: req.user.id,
        action: 'USER_ROLE_UPDATE',
        target: 'user123',
        timestamp: new Date(),
        details: 'Updated user role from citizen to issuer'
      }
    ];

    res.json({
      success: true,
      data: {
        logs: mockLogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: mockLogs.length,
          pages: 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching admin logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin logs'
    });
  }
};

// Get system configuration
const getSystemConfig = async (req, res) => {
  try {
    // This would typically fetch from a configuration collection or environment
    const config = {
      maxCredentialsPerUser: 10,
      credentialExpiryDays: 365,
      minTrustScore: 70,
      maxVerificationAttempts: 3,
      maintenanceMode: false,
      systemVersion: '1.0.0'
    };

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error fetching system config:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching system configuration'
    });
  }
};

// Update system configuration
const updateSystemConfig = async (req, res) => {
  try {
    const { config } = req.body;

    // Validate configuration values
    if (config.maxCredentialsPerUser && config.maxCredentialsPerUser < 1) {
      return res.status(400).json({
        success: false,
        message: 'Max credentials per user must be at least 1'
      });
    }

    if (config.credentialExpiryDays && config.credentialExpiryDays < 1) {
      return res.status(400).json({
        success: false,
        message: 'Credential expiry days must be at least 1'
      });
    }

    // This would typically update a configuration collection or environment
    console.log(`Admin ${req.user.id} updated system configuration:`, config);

    res.json({
      success: true,
      message: 'System configuration updated successfully',
      data: config
    });
  } catch (error) {
    console.error('Error updating system config:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating system configuration'
    });
  }
};

// Get issuer management data
const getIssuerManagement = async (req, res) => {
  try {
    const issuers = await User.find({ role: 'issuer' }, '-password')
      .sort({ createdAt: -1 });

    const issuerStats = await Promise.all(
      issuers.map(async (issuer) => {
        const credentialCount = await Credential.countDocuments({ 
          issuerId: issuer._id 
        });
        return {
          ...issuer.toObject(),
          credentialCount
        };
      })
    );

    res.json({
      success: true,
      data: {
        issuers: issuerStats,
        total: issuers.length
      }
    });
  } catch (error) {
    console.error('Error fetching issuer data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching issuer data'
    });
  }
};

// Get verifier management data
const getVerifierManagement = async (req, res) => {
  try {
    const verifiers = await User.find({ role: 'verifier' }, '-password')
      .sort({ createdAt: -1 });

    const verifierStats = await Promise.all(
      verifiers.map(async (verifier) => {
        const verificationCount = await VerificationRecord.countDocuments({ 
          verifierId: verifier._id 
        });
        return {
          ...verifier.toObject(),
          verificationCount
        };
      })
    );

    res.json({
      success: true,
      data: {
        verifiers: verifierStats,
        total: verifiers.length
      }
    });
  } catch (error) {
    console.error('Error fetching verifier data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching verifier data'
    });
  }
};

module.exports = {
  getAllUsers,
  getDashboardStats,
  getUserDetails,
  updateUserRole,
  deactivateUser,
  reactivateUser,
  getSystemAnalytics,
  getAdminActivityLogs,
  getSystemConfig,
  updateSystemConfig,
  getIssuerManagement,
  getVerifierManagement
}; 