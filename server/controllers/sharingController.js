// server/controllers/sharingController.js - Credential sharing controller
const QRCode = require('qrcode');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const Credential = require('../models/Credential');
const User = require('../models/User');

// In-memory storage for sharing sessions (should be moved to Redis in production)
const sharingStore = new Map();

// @desc    Generate QR code for credential sharing
// @route   POST /api/sharing/generate-qr
// @access  Private
const generateQRCode = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { credentialId, recipientId, expirationTime, revealedAttributes, accessLevel = 'view', maxUses = 1 } = req.body;

    // Verify credential ownership
    const credential = await Credential.findOne({ _id: credentialId, userId: req.user.id });
    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credential not found or access denied'
      });
    }

    // Generate unique share ID
    const shareId = uuidv4();
    const shareData = {
      shareId,
      credentialId,
      ownerId: req.user.id,
      recipientId,
      revealedAttributes,
      accessLevel,
      maxUses,
      currentUses: 0,
      expirationTime: new Date(expirationTime),
      createdAt: new Date(),
      type: 'qr'
    };

    // Store sharing session
    sharingStore.set(shareId, shareData);

    // Generate QR code data
    const qrData = {
      shareId,
      type: 'credential_share',
      url: `${process.env.CLIENT_URL}/verify-shared/${shareId}`,
      metadata: {
        credentialType: credential.type,
        issuer: credential.issuer,
        attributes: revealedAttributes.length
      }
    };

    // Generate QR code image
    const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#10b981',
        light: '#FFFFFF'
      }
    });

    res.json({
      success: true,
      data: {
        shareId,
        qrCode: qrCodeImage,
        shareUrl: qrData.url,
        expiresAt: shareData.expirationTime,
        maxUses,
        revealedAttributes
      }
    });
  } catch (error) {
    console.error('Generate QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating QR code'
    });
  }
};

// @desc    Generate shareable link for credential
// @route   POST /api/sharing/generate-link
// @access  Private
const generateShareableLink = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { credentialId, expirationTime, revealedAttributes, passwordProtected = false, password, allowedDomains } = req.body;

    // Verify credential ownership
    const credential = await Credential.findOne({ _id: credentialId, userId: req.user.id });
    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credential not found or access denied'
      });
    }

    // Generate unique share ID
    const shareId = uuidv4();
    const shareData = {
      shareId,
      credentialId,
      ownerId: req.user.id,
      revealedAttributes,
      passwordProtected,
      passwordHash: passwordProtected ? crypto.createHash('sha256').update(password).digest('hex') : null,
      allowedDomains,
      expirationTime: new Date(expirationTime),
      createdAt: new Date(),
      type: 'link',
      accessCount: 0
    };

    // Store sharing session
    sharingStore.set(shareId, shareData);

    const shareUrl = `${process.env.CLIENT_URL}/shared/${shareId}`;

    res.json({
      success: true,
      data: {
        shareId,
        shareUrl,
        expiresAt: shareData.expirationTime,
        passwordProtected,
        revealedAttributes,
        allowedDomains
      }
    });
  } catch (error) {
    console.error('Generate shareable link error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating shareable link'
    });
  }
};

// @desc    Verify and access shared credential
// @route   GET /api/sharing/verify/:shareId
// @access  Public
const verifySharedCredential = async (req, res) => {
  try {
    const { shareId } = req.params;
    const { password } = req.query;

    // Get sharing session
    const shareData = sharingStore.get(shareId);
    if (!shareData) {
      return res.status(404).json({
        success: false,
        message: 'Share link not found or expired'
      });
    }

    // Check expiration
    if (new Date() > shareData.expirationTime) {
      sharingStore.delete(shareId);
      return res.status(410).json({
        success: false,
        message: 'Share link has expired'
      });
    }

    // Check password if required
    if (shareData.passwordProtected) {
      if (!password) {
        return res.status(401).json({
          success: false,
          message: 'Password required',
          passwordRequired: true
        });
      }

      const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
      if (passwordHash !== shareData.passwordHash) {
        return res.status(401).json({
          success: false,
          message: 'Invalid password'
        });
      }
    }

    // Check usage limits for QR codes
    if (shareData.type === 'qr' && shareData.currentUses >= shareData.maxUses) {
      return res.status(410).json({
        success: false,
        message: 'Share link usage limit exceeded'
      });
    }

    // Get credential data
    const credential = await Credential.findById(shareData.credentialId);
    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credential not found'
      });
    }

    // Filter revealed attributes
    const revealedData = {};
    shareData.revealedAttributes.forEach(attr => {
      if (credential.data[attr] !== undefined) {
        revealedData[attr] = credential.data[attr];
      }
    });

    // Update usage count
    if (shareData.type === 'qr') {
      shareData.currentUses++;
      sharingStore.set(shareId, shareData);
    } else {
      shareData.accessCount++;
      sharingStore.set(shareId, shareData);
    }

    res.json({
      success: true,
      data: {
        credentialId: credential._id,
        type: credential.type,
        issuer: credential.issuer,
        issuedAt: credential.issuedAt,
        revealedData,
        verificationStatus: credential.status,
        blockchainHash: credential.blockchainHash
      }
    });
  } catch (error) {
    console.error('Verify shared credential error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying shared credential'
    });
  }
};

// @desc    Get credential sharing history
// @route   GET /api/sharing/history
// @access  Private
const getSharingHistory = async (req, res) => {
  try {
    const { credentialId, type, startDate, endDate, page = 1, limit = 20 } = req.query;

    // Filter sharing sessions for current user
    const userShares = Array.from(sharingStore.values())
      .filter(share => share.ownerId === req.user.id)
      .filter(share => !credentialId || share.credentialId === credentialId)
      .filter(share => !type || share.type === type)
      .filter(share => !startDate || share.createdAt >= new Date(startDate))
      .filter(share => !endDate || share.createdAt <= new Date(endDate))
      .sort((a, b) => b.createdAt - a.createdAt);

    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedShares = userShares.slice(startIndex, endIndex);

    // Get credential details for each share
    const sharesWithCredentials = await Promise.all(
      paginatedShares.map(async (share) => {
        const credential = await Credential.findById(share.credentialId);
        return {
          shareId: share.shareId,
          credentialType: credential?.type,
          credentialTitle: credential?.metadata?.title,
          type: share.type,
          revealedAttributes: share.revealedAttributes,
          accessLevel: share.accessLevel,
          createdAt: share.createdAt,
          expirationTime: share.expirationTime,
          currentUses: share.currentUses || share.accessCount || 0,
          maxUses: share.maxUses,
          isExpired: new Date() > share.expirationTime
        };
      })
    );

    res.json({
      success: true,
      data: {
        shares: sharesWithCredentials,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: userShares.length,
          pages: Math.ceil(userShares.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get sharing history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sharing history'
    });
  }
};

// @desc    Revoke a shared credential link/QR
// @route   DELETE /api/sharing/revoke/:shareId
// @access  Private
const revokeSharedCredential = async (req, res) => {
  try {
    const { shareId } = req.params;

    const shareData = sharingStore.get(shareId);
    if (!shareData) {
      return res.status(404).json({
        success: false,
        message: 'Share not found'
      });
    }

    // Verify ownership
    if (shareData.ownerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Remove from store
    sharingStore.delete(shareId);

    res.json({
      success: true,
      message: 'Share revoked successfully'
    });
  } catch (error) {
    console.error('Revoke shared credential error:', error);
    res.status(500).json({
      success: false,
      message: 'Error revoking shared credential'
    });
  }
};

// Placeholder implementations for remaining methods
const requestAccess = async (req, res) => {
  res.status(501).json({ success: false, message: 'Request access not implemented yet' });
};

const getAccessRequests = async (req, res) => {
  res.status(501).json({ success: false, message: 'Get access requests not implemented yet' });
};

const handleAccessRequest = async (req, res) => {
  res.status(501).json({ success: false, message: 'Handle access request not implemented yet' });
};

const getSharingAnalytics = async (req, res) => {
  res.status(501).json({ success: false, message: 'Get sharing analytics not implemented yet' });
};

const createSelectiveDisclosure = async (req, res) => {
  res.status(501).json({ success: false, message: 'Create selective disclosure not implemented yet' });
};

const verifySelectiveDisclosure = async (req, res) => {
  res.status(501).json({ success: false, message: 'Verify selective disclosure not implemented yet' });
};

const getSharingTemplates = async (req, res) => {
  res.status(501).json({ success: false, message: 'Get sharing templates not implemented yet' });
};

const createSharingTemplate = async (req, res) => {
  res.status(501).json({ success: false, message: 'Create sharing template not implemented yet' });
};

module.exports = {
  generateQRCode,
  generateShareableLink,
  verifySharedCredential,
  getSharingHistory,
  revokeSharedCredential,
  requestAccess,
  getAccessRequests,
  handleAccessRequest,
  getSharingAnalytics,
  createSelectiveDisclosure,
  verifySelectiveDisclosure,
  getSharingTemplates,
  createSharingTemplate
};
