const User = require('../models/User');
const Credential = require('../models/Credential');
const CredentialTemplate = require('../models/CredentialTemplate');
const VerificationRecord = require('../models/VerificationRecord');

// Get all credential templates
const getTemplates = async (req, res) => {
  try {
    const templates = await CredentialTemplate.find({ issuerId: req.user.id });
    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Error getting templates:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching templates'
    });
  }
};

// Create a new credential template
const createTemplate = async (req, res) => {
  try {
    const { name, schema, fields, validityPeriod } = req.body;

    const newTemplate = new CredentialTemplate({
      name,
      schema,
      fields,
      validityPeriod,
      issuerId: req.user.id
    });

    await newTemplate.save();

    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      template: newTemplate
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating template'
    });
  }
};

// Issue a credential to a citizen
const issueCredential = async (req, res) => {
  try {
    const { citizenId, templateId, credentialData } = req.body;

    // Verify citizen exists
    const citizen = await User.findOne({ _id: citizenId, role: 'citizen' });
    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: 'Citizen not found'
      });
    }

    // Verify template exists
    const template = await CredentialTemplate.findOne({ 
      _id: templateId,
      issuerId: req.user.id
    });
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Create credential
    const newCredential = new Credential({
      templateId,
      issuerId: req.user.id,
      citizenId,
      data: credentialData,
      issuedAt: new Date(),
      expiresAt: template.validityPeriod ? new Date(Date.now() + template.validityPeriod) : null,
      status: 'active'
    });

    await newCredential.save();

    res.status(201).json({
      success: true,
      message: 'Credential issued successfully',
      credential: newCredential
    });
  } catch (error) {
    console.error('Error issuing credential:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while issuing credential'
    });
  }
};

// Get all issued credentials
const getIssuedCredentials = async (req, res) => {
  try {
    const credentials = await Credential.find({ issuerId: req.user.id })
      .populate('citizenId', 'firstName lastName email')
      .populate('templateId', 'name');

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

// Revoke a credential
const revokeCredential = async (req, res) => {
  try {
    const { credentialId, reason } = req.body;

    const credential = await Credential.findOne({
      _id: credentialId,
      issuerId: req.user.id
    });

    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credential not found'
      });
    }

    credential.status = 'revoked';
    credential.revocationReason = reason;
    credential.revokedAt = new Date();

    await credential.save();

    res.json({
      success: true,
      message: 'Credential revoked successfully',
      credential
    });
  } catch (error) {
    console.error('Error revoking credential:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while revoking credential'
    });
  }
};

// Get issuer dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const totalCredentials = await Credential.countDocuments({ issuerId: req.user.id });
    const activeCredentials = await Credential.countDocuments({ 
      issuerId: req.user.id,
      status: 'active'
    });
    const totalTemplates = await CredentialTemplate.countDocuments({ issuerId: req.user.id });
    const uniqueCitizens = await Credential.distinct('citizenId', { issuerId: req.user.id });

    res.json({
      success: true,
      stats: {
        totalCredentials,
        activeCredentials,
        totalTemplates,
        uniqueCitizens: uniqueCitizens.length
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

// Off-chain ID verification
const verifyUserIdentity = async (req, res) => {
  try {
    const { userId, personalInfo, idDocumentScan, biometricData } = req.body;

    // TODO: Implement connection to government databases or secure repositories
    // For now, simulate verification success
    const verificationSuccess = true;

    if (!verificationSuccess) {
      return res.status(400).json({
        success: false,
        message: 'ID verification failed'
      });
    }

    // Record verification result
    const verificationRecord = new VerificationRecord({
      userId,
      personalInfo,
      idDocumentScan,
      biometricData,
      verifiedAt: new Date(),
      status: 'verified'
    });

    await verificationRecord.save();

    res.status(200).json({
      success: true,
      message: 'ID verification successful',
      verificationRecord
    });
  } catch (error) {
    console.error('ID verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during ID verification'
    });
  }
};

module.exports = {
  getTemplates,
  createTemplate,
  issueCredential,
  getIssuedCredentials,
  revokeCredential,
  getDashboardStats,
  verifyUserIdentity
};
