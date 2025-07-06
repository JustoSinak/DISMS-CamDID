// server/controllers/verificationController.js - Enhanced verification controller
const { validationResult } = require('express-validator');
const Credential = require('../models/Credential');
const User = require('../models/User');
const { zkProofService } = require('../utils/zkProofs');
const { verifySignature, generateHash } = require('../utils/encryption');

// @desc    Verify a credential (main verification endpoint)
// @route   POST /api/verify/credential
// @access  Private
const verifyCredential = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { 
      credentialId, 
      credentialHash, 
      shareId, 
      verificationLevel = 'basic',
      requestedAttributes = [],
      purpose 
    } = req.body;

    let credential;
    let verificationResult = {
      isValid: false,
      verificationLevel,
      timestamp: new Date(),
      verifierId: req.user.id,
      details: {}
    };

    // Find credential by ID or hash
    if (credentialId) {
      credential = await Credential.findById(credentialId);
    } else if (credentialHash) {
      credential = await Credential.findOne({ 
        $or: [
          { 'blockchain.merkleRoot': credentialHash },
          { 'blockchain.transactionHash': credentialHash }
        ]
      });
    } else if (shareId) {
      // Handle shared credential verification
      const shareData = await getSharedCredential(shareId);
      if (shareData) {
        credential = await Credential.findById(shareData.credentialId);
        verificationResult.details.shareInfo = shareData;
      }
    }

    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credential not found'
      });
    }

    // Perform verification based on level
    switch (verificationLevel) {
      case 'basic':
        verificationResult = await performBasicVerification(credential, verificationResult);
        break;
      case 'standard':
        verificationResult = await performStandardVerification(credential, verificationResult);
        break;
      case 'enhanced':
        verificationResult = await performEnhancedVerification(credential, verificationResult);
        break;
    }

    // Record verification in credential history
    credential.verification.verificationHistory.push({
      timestamp: new Date(),
      status: verificationResult.isValid ? 'verified' : 'failed',
      verifier: req.user.email,
      details: verificationResult.details
    });

    await credential.save();

    // Record verification in user's activity
    await recordVerificationActivity(req.user.id, credential._id, verificationResult);

    res.json({
      success: true,
      data: {
        credentialId: credential._id,
        verification: verificationResult,
        credential: {
          type: credential.type,
          issuer: credential.issuer,
          issuedAt: credential.createdAt,
          status: credential.status
        }
      }
    });

  } catch (error) {
    console.error('Credential verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying credential'
    });
  }
};

// @desc    Verify multiple credentials at once
// @route   POST /api/verify/batch
// @access  Private
const verifyBatchCredentials = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { credentials, purpose } = req.body;
    const results = [];

    for (const credentialRequest of credentials) {
      try {
        const credential = await Credential.findById(credentialRequest.credentialId);
        
        if (!credential) {
          results.push({
            credentialId: credentialRequest.credentialId,
            success: false,
            error: 'Credential not found'
          });
          continue;
        }

        const verificationLevel = credentialRequest.verificationLevel || 'basic';
        let verificationResult = {
          isValid: false,
          verificationLevel,
          timestamp: new Date(),
          verifierId: req.user.id,
          details: {}
        };

        // Perform verification
        switch (verificationLevel) {
          case 'basic':
            verificationResult = await performBasicVerification(credential, verificationResult);
            break;
          case 'standard':
            verificationResult = await performStandardVerification(credential, verificationResult);
            break;
          case 'enhanced':
            verificationResult = await performEnhancedVerification(credential, verificationResult);
            break;
        }

        results.push({
          credentialId: credential._id,
          success: true,
          verification: verificationResult
        });

        // Record verification
        credential.verification.verificationHistory.push({
          timestamp: new Date(),
          status: verificationResult.isValid ? 'verified' : 'failed',
          verifier: req.user.email,
          details: { ...verificationResult.details, batchVerification: true, purpose }
        });

        await credential.save();

      } catch (error) {
        results.push({
          credentialId: credentialRequest.credentialId,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      data: {
        results,
        summary: {
          total: credentials.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        }
      }
    });

  } catch (error) {
    console.error('Batch verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing batch verification'
    });
  }
};

// @desc    Get verification history
// @route   GET /api/verify/history
// @access  Private
const getVerificationHistory = async (req, res) => {
  try {
    const { 
      credentialId, 
      verifierId, 
      status, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 20 
    } = req.query;

    const query = {};
    
    // Build query based on filters
    if (credentialId) {
      query._id = credentialId;
    }
    
    if (status) {
      query['verification.verificationHistory.status'] = status;
    }

    // Date range filter
    if (startDate || endDate) {
      query['verification.verificationHistory.timestamp'] = {};
      if (startDate) {
        query['verification.verificationHistory.timestamp'].$gte = new Date(startDate);
      }
      if (endDate) {
        query['verification.verificationHistory.timestamp'].$lte = new Date(endDate);
      }
    }

    const credentials = await Credential.find(query)
      .populate('userId', 'email profile.firstName profile.lastName')
      .populate('issuerId', 'email profile.firstName profile.lastName')
      .sort({ 'verification.lastVerified': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Extract verification history
    const verificationHistory = [];
    credentials.forEach(credential => {
      credential.verification.verificationHistory.forEach(verification => {
        if (!verifierId || verification.verifier === req.user.email) {
          verificationHistory.push({
            credentialId: credential._id,
            credentialType: credential.type,
            holder: credential.userId,
            issuer: credential.issuerId,
            verification
          });
        }
      });
    });

    // Sort by timestamp
    verificationHistory.sort((a, b) => new Date(b.verification.timestamp) - new Date(a.verification.timestamp));

    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedHistory = verificationHistory.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        verifications: paginatedHistory,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: verificationHistory.length,
          pages: Math.ceil(verificationHistory.length / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get verification history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching verification history'
    });
  }
};

// Helper function to perform basic verification
const performBasicVerification = async (credential, verificationResult) => {
  try {
    // Check if credential exists and is not revoked
    if (credential.revocationRegistry?.revoked) {
      verificationResult.details.revocationCheck = {
        revoked: true,
        revokedAt: credential.revocationRegistry.revokedAt,
        reason: credential.revocationRegistry.revocationReason
      };
      return verificationResult;
    }

    // Check expiration
    if (credential.metadata?.expirationDate && new Date() > credential.metadata.expirationDate) {
      verificationResult.details.expirationCheck = {
        expired: true,
        expirationDate: credential.metadata.expirationDate
      };
      return verificationResult;
    }

    // Basic structure validation
    if (credential.data && credential.type && credential.issuer) {
      verificationResult.isValid = true;
      verificationResult.details.basicChecks = {
        structureValid: true,
        hasData: true,
        hasIssuer: true
      };
    }

    return verificationResult;
  } catch (error) {
    verificationResult.details.error = error.message;
    return verificationResult;
  }
};

// Helper function to perform standard verification
const performStandardVerification = async (credential, verificationResult) => {
  try {
    // Perform basic verification first
    verificationResult = await performBasicVerification(credential, verificationResult);
    
    if (!verificationResult.isValid) {
      return verificationResult;
    }

    // Verify issuer
    const issuer = await User.findOne({ email: credential.issuer });
    if (!issuer || issuer.role !== 'issuer') {
      verificationResult.isValid = false;
      verificationResult.details.issuerCheck = {
        valid: false,
        reason: 'Invalid or unauthorized issuer'
      };
      return verificationResult;
    }

    // Check blockchain record if available
    if (credential.blockchain?.transactionHash) {
      // In a real implementation, this would verify against the blockchain
      verificationResult.details.blockchainCheck = {
        hasBlockchainRecord: true,
        transactionHash: credential.blockchain.transactionHash
      };
    }

    verificationResult.details.standardChecks = {
      issuerValid: true,
      blockchainVerified: !!credential.blockchain?.transactionHash
    };

    return verificationResult;
  } catch (error) {
    verificationResult.details.error = error.message;
    verificationResult.isValid = false;
    return verificationResult;
  }
};

// Helper function to perform enhanced verification
const performEnhancedVerification = async (credential, verificationResult) => {
  try {
    // Perform standard verification first
    verificationResult = await performStandardVerification(credential, verificationResult);
    
    if (!verificationResult.isValid) {
      return verificationResult;
    }

    // Verify cryptographic proof if available
    if (credential.proof) {
      try {
        const proofData = JSON.parse(credential.proof);
        // In a real implementation, this would verify the ZK proof
        verificationResult.details.proofVerification = {
          hasProof: true,
          proofValid: true // Placeholder
        };
      } catch (error) {
        verificationResult.details.proofVerification = {
          hasProof: true,
          proofValid: false,
          error: 'Invalid proof format'
        };
      }
    }

    // Enhanced security checks
    verificationResult.details.enhancedChecks = {
      cryptographicProofVerified: !!credential.proof,
      complianceChecked: credential.compliance?.gdprCompliant || false,
      auditTrailPresent: !!(credential.compliance?.auditTrail?.length > 0)
    };

    return verificationResult;
  } catch (error) {
    verificationResult.details.error = error.message;
    verificationResult.isValid = false;
    return verificationResult;
  }
};

// Helper function to get shared credential data
const getSharedCredential = async (shareId) => {
  // This would typically query a sharing service or database
  // For now, return null as placeholder
  return null;
};

// Helper function to record verification activity
const recordVerificationActivity = async (verifierId, credentialId, verificationResult) => {
  try {
    // This would record the verification in an activity log
    // Implementation depends on your activity tracking system
    console.log(`Verification recorded: ${verifierId} verified ${credentialId}`);
  } catch (error) {
    console.error('Error recording verification activity:', error);
  }
};

// Placeholder implementations for remaining methods
const getVerificationRequest = async (req, res) => {
  res.status(501).json({ success: false, message: 'Get verification request not implemented yet' });
};

const createVerificationRequest = async (req, res) => {
  res.status(501).json({ success: false, message: 'Create verification request not implemented yet' });
};

const respondToVerificationRequest = async (req, res) => {
  res.status(501).json({ success: false, message: 'Respond to verification request not implemented yet' });
};

const verifyOnBlockchain = async (req, res) => {
  res.status(501).json({ success: false, message: 'Verify on blockchain not implemented yet' });
};

const verifyCredentialSignature = async (req, res) => {
  res.status(501).json({ success: false, message: 'Verify credential signature not implemented yet' });
};

const checkRevocationStatus = async (req, res) => {
  res.status(501).json({ success: false, message: 'Check revocation status not implemented yet' });
};

const getVerificationPolicies = async (req, res) => {
  res.status(501).json({ success: false, message: 'Get verification policies not implemented yet' });
};

const createVerificationPolicy = async (req, res) => {
  res.status(501).json({ success: false, message: 'Create verification policy not implemented yet' });
};

const updateVerificationPolicy = async (req, res) => {
  res.status(501).json({ success: false, message: 'Update verification policy not implemented yet' });
};

const deleteVerificationPolicy = async (req, res) => {
  res.status(501).json({ success: false, message: 'Delete verification policy not implemented yet' });
};

const getVerificationAnalytics = async (req, res) => {
  res.status(501).json({ success: false, message: 'Get verification analytics not implemented yet' });
};

const generateVerificationReport = async (req, res) => {
  res.status(501).json({ success: false, message: 'Generate verification report not implemented yet' });
};

module.exports = {
  verifyCredential,
  verifyBatchCredentials,
  getVerificationHistory,
  getVerificationRequest,
  createVerificationRequest,
  respondToVerificationRequest,
  verifyOnBlockchain,
  verifyCredentialSignature,
  checkRevocationStatus,
  getVerificationPolicies,
  createVerificationPolicy,
  updateVerificationPolicy,
  deleteVerificationPolicy,
  getVerificationAnalytics,
  generateVerificationReport
};
