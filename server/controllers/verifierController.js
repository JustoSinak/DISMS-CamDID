// identity-blockchain-app/server/controllers/verifierController.js
const User = require('../models/User');
const Credential = require('../models/Credential');
const VerificationRecord = require('../models/VerificationRecord');

// Verify a credential
const verifyCredential = async (req, res) => {
  try {
    const { credentialId, purpose } = req.body;

    // Find the credential
    const credential = await Credential.findById(credentialId)
      .populate('holder', 'firstName lastName email')
      .populate('issuer', 'firstName lastName email');

    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credential not found'
      });
    }

    // Check if credential is active
    if (credential.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Credential is not active'
      });
    }

    // Check if credential has expired
    if (credential.isExpired) {
      return res.status(400).json({
        success: false,
        message: 'Credential has expired'
      });
    }

    // Create verification record
    const verificationRecord = new VerificationRecord({
      credential: credentialId,
      verifier: req.user.id,
      holder: credential.holder._id,
      status: 'valid',
      purpose,
      verificationMethod: 'manual'
    });

    await verificationRecord.save();

    res.json({
      success: true,
      message: 'Credential verified successfully',
      credential,
      verificationRecord
    });
  } catch (error) {
    console.error('Error verifying credential:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying credential'
    });
  }
};

// Get verification history
const getVerificationHistory = async (req, res) => {
  try {
    const verifications = await VerificationRecord.find({ verifier: req.user.id })
      .populate('credential')
      .populate('holder', 'firstName lastName email')
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

// Search verification records
const searchVerifications = async (req, res) => {
  try {
    const { query } = req.query;
    
    const verifications = await VerificationRecord.find({
      verifier: req.user.id,
      $or: [
        { 'holder.firstName': { $regex: query, $options: 'i' } },
        { 'holder.lastName': { $regex: query, $options: 'i' } },
        { 'credential.type': { $regex: query, $options: 'i' } }
      ]
    })
      .populate('credential')
      .populate('holder', 'firstName lastName email')
      .sort({ verificationDate: -1 });

    res.json({
      success: true,
      verifications
    });
  } catch (error) {
    console.error('Error searching verifications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching verifications'
    });
  }
};

// Get verifier dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalVerifications = await VerificationRecord.countDocuments({ 
      verifier: req.user.id 
    });
    
    const todayVerifications = await VerificationRecord.countDocuments({ 
      verifier: req.user.id,
      verificationDate: { $gte: today }
    });

    const validVerifications = await VerificationRecord.countDocuments({ 
      verifier: req.user.id,
      status: 'valid'
    });

    const successRate = totalVerifications > 0 
      ? (validVerifications / totalVerifications * 100).toFixed(1) 
      : 100;

    // Get recent verifications
    const recentVerifications = await VerificationRecord.find({ 
      verifier: req.user.id 
    })
      .sort({ verificationDate: -1 })
      .limit(5)
      .populate('holder', 'firstName lastName')
      .populate('credential', 'type');

    res.json({
      success: true,
      stats: {
        totalVerifications,
        todayVerifications,
        successRate,
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

module.exports = {
  verifyCredential,
  getVerificationHistory,
  searchVerifications,
  getDashboardStats
}; 