 // identity-blockchain-app/server/controllers/citizenController.js
const User = require('../models/User');
const Credential = require('../models/Credential');
const VerificationRecord = require('../models/VerificationRecord');
const CredentialRequest = require('../models/CredentialRequest');

// Get citizen profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      profile: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        governmentVerified: user.governmentVerified,
        digitalIdentity: user.digitalIdentity,
        profileCompletion: user.profileCompletion
      }
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

// Update citizen profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, dateOfBirth } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        isVerified: user.isVerified,
        governmentVerified: user.governmentVerified
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

// Get citizen's credentials
const getCredentials = async (req, res) => {
  try {
    const credentials = await Credential.find({ holder: req.user.id })
      .populate('issuer', 'firstName lastName email')
      .sort({ issuanceDate: -1 });

    res.json({
      success: true,
      credentials
    });
  } catch (error) {
    console.error('Error getting credentials:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching credentials'
    });
  }
};

// Request a new credential
const requestCredential = async (req, res) => {
  try {
    const { issuerId, credentialType, purpose, metadata } = req.body;

    // Verify issuer exists
    const issuer = await User.findOne({ _id: issuerId, role: 'issuer' });
    if (!issuer) {
      return res.status(404).json({
        success: false,
        message: 'Issuer not found'
      });
    }

    // Create credential request
    const newRequest = new CredentialRequest({
      citizen: req.user.id,
      issuer: issuerId,
      credentialType,
      purpose,
      metadata: metadata || {},
      status: 'pending'
    });

    await newRequest.save();

    res.status(201).json({
      success: true,
      message: 'Credential request submitted successfully',
      request: newRequest
    });
  } catch (error) {
    console.error('Error requesting credential:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting credential request'
    });
  }
};

// Get verification history
const getVerificationHistory = async (req, res) => {
  try {
    const verifications = await VerificationRecord.find({ holder: req.user.id })
      .populate('credential')
      .populate('verifier', 'firstName lastName email')
      .sort({ verificationDate: -1 });

    res.json({
      success: true,
      verifications
    });
  } catch (error) {
    console.error('Error getting verification history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching verification history'
    });
  }
};

// Get citizen dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalCredentials,
      activeCredentials,
      pendingRequests,
      recentVerifications
    ] = await Promise.all([
      Credential.countDocuments({ holder: req.user.id }),
      Credential.countDocuments({ holder: req.user.id, status: 'active' }),
      CredentialRequest.countDocuments({ citizen: req.user.id, status: 'pending' }),
      VerificationRecord.find({ holder: req.user.id })
        .sort({ verificationDate: -1 })
        .limit(5)
        .populate('verifier', 'firstName lastName')
        .populate('credential', 'type')
    ]);

    res.json({
      success: true,
      stats: {
        totalCredentials,
        activeCredentials,
        pendingRequests,
        recentVerifications
      }
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard statistics'
    });
  }
};

const shareCredential = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'shareCredential not implemented yet'
  });
};

const submitGovernmentVerification = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'submitGovernmentVerification not implemented yet'
  });
};

module.exports = {
  getProfile,
  updateProfile,
  getCredentials,
  requestCredential,
  getVerificationHistory,
  getDashboardStats,
  shareCredential,
  submitGovernmentVerification
};
