const credentialService = require('../services/credentialService');
const { uploadToIPFS } = require('../utils/ipfs');

exports.createCredential = async (req, res) => {
  try {
    const { identityId } = req.params;
    const credentialData = req.body;

    // Handle document upload if present
    if (req.file) {
      credentialData.document = {
        buffer: req.file.buffer,
        mimeType: req.file.mimetype,
        size: req.file.size
      };
    }

    const credential = await credentialService.createCredential(
      identityId,
      credentialData
    );

    res.status(201).json({
      success: true,
      data: {
        credentialId: credential._id,
        type: credential.type,
        category: credential.category,
        status: credential.status,
        metadata: {
          title: credential.metadata.title,
          description: credential.metadata.description,
          issueDate: credential.metadata.issueDate,
          expirationDate: credential.metadata.expirationDate
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getCredentials = async (req, res) => {
  try {
    const { identityId } = req.params;
    const filters = req.query;

    const credentials = await credentialService.getCredentials(identityId, filters);

    res.json({
      success: true,
      data: credentials
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.shareCredential = async (req, res) => {
  try {
    const { credentialId } = req.params;
    const sharingData = req.body;

    const credential = await credentialService.shareCredential(
      credentialId,
      sharingData
    );

    res.json({
      success: true,
      data: {
        credentialId: credential._id,
        sharing: {
          accessControl: credential.sharing.accessControl,
          allowedViewers: credential.sharing.allowedViewers,
          lastShared: credential.sharing.sharingHistory[
            credential.sharing.sharingHistory.length - 1
          ]
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.verifyCredential = async (req, res) => {
  try {
    const { credentialId } = req.params;
    const verificationData = req.body;

    const verificationResult = await credentialService.verifyCredential(
      credentialId,
      verificationData
    );

    res.json({
      success: true,
      data: verificationResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.revokeCredential = async (req, res) => {
  try {
    const { credentialId } = req.params;
    const { reason } = req.body;

    const credential = await credentialService.revokeCredential(
      credentialId,
      reason
    );

    res.json({
      success: true,
      data: {
        credentialId: credential._id,
        status: credential.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.generateSharingQR = async (req, res) => {
  try {
    const { credentialId } = req.params;
    const { attributes, expiresIn } = req.body;

    // Generate sharing URL with embedded permissions
    const sharingUrl = await credentialService.generateSharingUrl(
      credentialId,
      attributes,
      expiresIn
    );

    // Generate QR code
    const qrCode = await credentialService.generateQRCode(sharingUrl);

    res.json({
      success: true,
      data: {
        qrCode,
        sharingUrl,
        expiresAt: new Date(Date.now() + expiresIn * 1000)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getCredentialActivity = async (req, res) => {
  try {
    const { credentialId } = req.params;
    const { startDate, endDate } = req.query;

    const activity = await credentialService.getCredentialActivity(
      credentialId,
      startDate,
      endDate
    );

    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}; 