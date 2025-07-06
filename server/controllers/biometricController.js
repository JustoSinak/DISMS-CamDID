// server/controllers/biometricController.js - Biometric authentication controller
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const BiometricCredential = require('../models/BiometricCredential');

// @desc    Register biometric credential
// @route   POST /api/auth/biometric/register
// @access  Private
const registerBiometric = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { credentialData, biometricType } = req.body;
    const userId = req.user.id;

    // Check if user already has this type of biometric registered
    const existingCredential = await BiometricCredential.findOne({
      userId,
      biometricType,
      active: true
    });

    if (existingCredential) {
      return res.status(400).json({
        success: false,
        message: `${biometricType} authentication is already registered`
      });
    }

    // Create new biometric credential
    const biometricCredential = new BiometricCredential({
      userId,
      credentialId: credentialData.id,
      rawId: credentialData.rawId,
      biometricType,
      publicKey: credentialData.response.attestationObject, // Store securely
      counter: 0,
      active: true,
      registeredAt: new Date()
    });

    await biometricCredential.save();

    // Update user's biometric settings
    const user = await User.findById(userId);
    if (!user.biometrics) {
      user.biometrics = {};
    }
    
    user.biometrics[biometricType] = {
      enabled: true,
      registeredAt: new Date(),
      lastUsed: null
    };
    
    await user.save();

    res.json({
      success: true,
      message: 'Biometric credential registered successfully',
      data: {
        credentialId: biometricCredential.credentialId,
        biometricType,
        registeredAt: biometricCredential.registeredAt
      }
    });
  } catch (error) {
    console.error('Register biometric error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering biometric credential'
    });
  }
};

// @desc    Get user's biometric credentials
// @route   GET /api/auth/biometric/credentials
// @access  Private
const getBiometricCredentials = async (req, res) => {
  try {
    const userId = req.user.id;

    const credentials = await BiometricCredential.find({
      userId,
      active: true
    }).select('credentialId rawId biometricType registeredAt lastUsed');

    res.json({
      success: true,
      credentials: credentials.map(cred => ({
        id: cred.credentialId,
        rawId: cred.rawId,
        type: 'public-key',
        biometricType: cred.biometricType,
        registeredAt: cred.registeredAt,
        lastUsed: cred.lastUsed
      }))
    });
  } catch (error) {
    console.error('Get biometric credentials error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching biometric credentials'
    });
  }
};

// @desc    Verify biometric assertion
// @route   POST /api/auth/biometric/verify
// @access  Private
const verifyBiometric = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { verificationData, biometricType } = req.body;
    const userId = req.user.id;

    // Find the credential
    const credential = await BiometricCredential.findOne({
      userId,
      credentialId: verificationData.id,
      biometricType,
      active: true
    });

    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Biometric credential not found'
      });
    }

    // In a real implementation, you would verify the signature here
    // For now, we'll simulate successful verification
    const isValid = await verifyBiometricSignature(credential, verificationData);

    if (isValid) {
      // Update last used timestamp
      credential.lastUsed = new Date();
      credential.counter += 1;
      await credential.save();

      // Update user's biometric usage
      const user = await User.findById(userId);
      if (user.biometrics && user.biometrics[biometricType]) {
        user.biometrics[biometricType].lastUsed = new Date();
        await user.save();
      }

      res.json({
        success: true,
        message: 'Biometric verification successful',
        data: {
          verified: true,
          biometricType,
          timestamp: new Date()
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Biometric verification failed'
      });
    }
  } catch (error) {
    console.error('Verify biometric error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying biometric credential'
    });
  }
};

// @desc    Remove biometric credential
// @route   DELETE /api/auth/biometric/credentials/:credentialId
// @access  Private
const removeBiometricCredential = async (req, res) => {
  try {
    const { credentialId } = req.params;
    const userId = req.user.id;

    const credential = await BiometricCredential.findOne({
      userId,
      credentialId,
      active: true
    });

    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Biometric credential not found'
      });
    }

    // Deactivate credential
    credential.active = false;
    credential.deactivatedAt = new Date();
    await credential.save();

    // Update user's biometric settings
    const user = await User.findById(userId);
    if (user.biometrics && user.biometrics[credential.biometricType]) {
      user.biometrics[credential.biometricType].enabled = false;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Biometric credential removed successfully'
    });
  } catch (error) {
    console.error('Remove biometric credential error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing biometric credential'
    });
  }
};

// @desc    Get biometric status
// @route   GET /api/auth/biometric/status
// @access  Private
const getBiometricStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    const activeCredentials = await BiometricCredential.find({
      userId,
      active: true
    });

    const status = {
      enabled: activeCredentials.length > 0,
      availableTypes: ['fingerprint', 'face', 'voice'],
      registeredTypes: activeCredentials.map(cred => cred.biometricType),
      biometrics: user.biometrics || {}
    };

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Get biometric status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching biometric status'
    });
  }
};

// Helper function to verify biometric signature
const verifyBiometricSignature = async (credential, verificationData) => {
  try {
    // In a real implementation, this would:
    // 1. Parse the authenticatorData and clientDataJSON
    // 2. Verify the signature using the stored public key
    // 3. Check the counter to prevent replay attacks
    // 4. Validate the challenge and origin
    
    // For now, we'll simulate successful verification
    // This should be replaced with actual WebAuthn verification
    return true;
  } catch (error) {
    console.error('Biometric signature verification error:', error);
    return false;
  }
};

// Placeholder implementations for remaining methods
const enableBiometric = async (req, res) => {
  res.status(501).json({ success: false, message: 'Enable biometric not implemented yet' });
};

const disableBiometric = async (req, res) => {
  res.status(501).json({ success: false, message: 'Disable biometric not implemented yet' });
};

const generateChallenge = async (req, res) => {
  res.status(501).json({ success: false, message: 'Generate challenge not implemented yet' });
};

const verifyChallenge = async (req, res) => {
  res.status(501).json({ success: false, message: 'Verify challenge not implemented yet' });
};

const getBiometricHistory = async (req, res) => {
  res.status(501).json({ success: false, message: 'Get biometric history not implemented yet' });
};

const generateBackupCodes = async (req, res) => {
  res.status(501).json({ success: false, message: 'Generate backup codes not implemented yet' });
};

const useBackupCode = async (req, res) => {
  res.status(501).json({ success: false, message: 'Use backup code not implemented yet' });
};

module.exports = {
  registerBiometric,
  getBiometricCredentials,
  verifyBiometric,
  removeBiometricCredential,
  getBiometricStatus,
  enableBiometric,
  disableBiometric,
  generateChallenge,
  verifyChallenge,
  getBiometricHistory,
  generateBackupCodes,
  useBackupCode
};
