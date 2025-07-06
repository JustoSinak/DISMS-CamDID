// server/routes/verification.js - Enhanced verification routes as specified in PRD
const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const verificationController = require('../controllers/verificationController');

// Apply authentication to all routes
router.use(authenticateToken);

// @route   POST /api/verify/credential
// @desc    Verify a credential (main verification endpoint)
// @access  Private
router.post('/credential',
  [
    body('credentialId').optional().isMongoId()
      .withMessage('Credential ID must be valid if provided'),
    body('credentialHash').optional().isString()
      .withMessage('Credential hash must be a string if provided'),
    body('shareId').optional().isUUID()
      .withMessage('Share ID must be valid if provided'),
    body('verificationLevel').optional().isIn(['basic', 'standard', 'enhanced'])
      .withMessage('Verification level must be basic, standard, or enhanced'),
    body('requestedAttributes').optional().isArray()
      .withMessage('Requested attributes must be an array if provided'),
    body('purpose').optional().isLength({ min: 5, max: 200 })
      .withMessage('Purpose must be between 5 and 200 characters if provided')
  ],
  handleValidationErrors,
  verificationController.verifyCredential
);

// @route   POST /api/verify/batch
// @desc    Verify multiple credentials at once
// @access  Private
router.post('/batch',
  [
    body('credentials').isArray({ min: 1, max: 10 })
      .withMessage('Credentials array must contain 1-10 items'),
    body('credentials.*.credentialId').isMongoId()
      .withMessage('Each credential ID must be valid'),
    body('credentials.*.verificationLevel').optional().isIn(['basic', 'standard', 'enhanced'])
      .withMessage('Verification level must be basic, standard, or enhanced'),
    body('purpose').optional().isLength({ min: 5, max: 200 })
      .withMessage('Purpose must be between 5 and 200 characters if provided')
  ],
  handleValidationErrors,
  verificationController.verifyBatchCredentials
);

// @route   GET /api/verify/history
// @desc    Get verification history
// @access  Private
router.get('/history',
  [
    query('credentialId').optional().isMongoId()
      .withMessage('Credential ID must be valid if provided'),
    query('verifierId').optional().isMongoId()
      .withMessage('Verifier ID must be valid if provided'),
    query('status').optional().isIn(['success', 'failed', 'pending'])
      .withMessage('Status must be success, failed, or pending'),
    query('startDate').optional().isISO8601()
      .withMessage('Start date must be valid if provided'),
    query('endDate').optional().isISO8601()
      .withMessage('End date must be valid if provided'),
    query('page').optional().isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],
  handleValidationErrors,
  verificationController.getVerificationHistory
);

// @route   GET /api/verify/request/:requestId
// @desc    Get verification request details
// @access  Private
router.get('/request/:requestId',
  [
    param('requestId').isMongoId()
      .withMessage('Request ID must be valid')
  ],
  handleValidationErrors,
  verificationController.getVerificationRequest
);

// @route   POST /api/verify/request
// @desc    Create verification request
// @access  Private
router.post('/request',
  [
    body('credentialOwnerId').isMongoId()
      .withMessage('Credential owner ID must be valid'),
    body('credentialType').isString()
      .withMessage('Credential type is required'),
    body('requestedAttributes').isArray({ min: 1 })
      .withMessage('At least one attribute must be requested'),
    body('purpose').isLength({ min: 10, max: 500 })
      .withMessage('Purpose must be between 10 and 500 characters'),
    body('urgency').optional().isIn(['low', 'medium', 'high'])
      .withMessage('Urgency must be low, medium, or high'),
    body('expirationTime').optional().isISO8601()
      .withMessage('Expiration time must be valid if provided')
  ],
  handleValidationErrors,
  verificationController.createVerificationRequest
);

// @route   PUT /api/verify/request/:requestId
// @desc    Respond to verification request
// @access  Private
router.put('/request/:requestId',
  [
    param('requestId').isMongoId()
      .withMessage('Request ID must be valid'),
    body('action').isIn(['approve', 'reject'])
      .withMessage('Action must be approve or reject'),
    body('credentialId').optional().isMongoId()
      .withMessage('Credential ID must be valid if provided'),
    body('revealedAttributes').optional().isArray()
      .withMessage('Revealed attributes must be an array if provided'),
    body('restrictions').optional().isObject()
      .withMessage('Restrictions must be an object if provided'),
    body('message').optional().isLength({ max: 500 })
      .withMessage('Message must be less than 500 characters')
  ],
  handleValidationErrors,
  verificationController.respondToVerificationRequest
);

// @route   POST /api/verify/blockchain
// @desc    Verify credential on blockchain
// @access  Private
router.post('/blockchain',
  [
    body('credentialHash').isString()
      .withMessage('Credential hash is required'),
    body('issuerAddress').isString()
      .withMessage('Issuer address is required'),
    body('holderAddress').optional().isString()
      .withMessage('Holder address must be a string if provided')
  ],
  handleValidationErrors,
  verificationController.verifyOnBlockchain
);

// @route   POST /api/verify/signature
// @desc    Verify credential signature
// @access  Private
router.post('/signature',
  [
    body('credential').isObject()
      .withMessage('Credential object is required'),
    body('signature').isString()
      .withMessage('Signature is required'),
    body('publicKey').isString()
      .withMessage('Public key is required')
  ],
  handleValidationErrors,
  verificationController.verifyCredentialSignature
);

// @route   POST /api/verify/revocation
// @desc    Check credential revocation status
// @access  Private
router.post('/revocation',
  [
    body('credentialId').isMongoId()
      .withMessage('Credential ID must be valid'),
    body('issuerDid').optional().isString()
      .withMessage('Issuer DID must be a string if provided')
  ],
  handleValidationErrors,
  verificationController.checkRevocationStatus
);

// @route   GET /api/verify/policies
// @desc    Get verification policies for organization
// @access  Private
router.get('/policies', verificationController.getVerificationPolicies);

// @route   POST /api/verify/policies
// @desc    Create verification policy
// @access  Private
router.post('/policies',
  [
    body('name').isLength({ min: 1, max: 100 })
      .withMessage('Policy name must be between 1 and 100 characters'),
    body('description').optional().isLength({ max: 500 })
      .withMessage('Description must be less than 500 characters'),
    body('credentialTypes').isArray({ min: 1 })
      .withMessage('At least one credential type must be specified'),
    body('requiredAttributes').isArray({ min: 1 })
      .withMessage('At least one required attribute must be specified'),
    body('verificationLevel').isIn(['basic', 'standard', 'enhanced'])
      .withMessage('Verification level must be basic, standard, or enhanced'),
    body('autoApprove').optional().isBoolean()
      .withMessage('Auto approve must be a boolean if provided')
  ],
  handleValidationErrors,
  verificationController.createVerificationPolicy
);

// @route   PUT /api/verify/policies/:policyId
// @desc    Update verification policy
// @access  Private
router.put('/policies/:policyId',
  [
    param('policyId').isMongoId()
      .withMessage('Policy ID must be valid'),
    body('name').optional().isLength({ min: 1, max: 100 })
      .withMessage('Policy name must be between 1 and 100 characters'),
    body('description').optional().isLength({ max: 500 })
      .withMessage('Description must be less than 500 characters'),
    body('credentialTypes').optional().isArray({ min: 1 })
      .withMessage('At least one credential type must be specified'),
    body('requiredAttributes').optional().isArray({ min: 1 })
      .withMessage('At least one required attribute must be specified'),
    body('verificationLevel').optional().isIn(['basic', 'standard', 'enhanced'])
      .withMessage('Verification level must be basic, standard, or enhanced'),
    body('autoApprove').optional().isBoolean()
      .withMessage('Auto approve must be a boolean if provided'),
    body('isActive').optional().isBoolean()
      .withMessage('Is active must be a boolean if provided')
  ],
  handleValidationErrors,
  verificationController.updateVerificationPolicy
);

// @route   DELETE /api/verify/policies/:policyId
// @desc    Delete verification policy
// @access  Private
router.delete('/policies/:policyId',
  [
    param('policyId').isMongoId()
      .withMessage('Policy ID must be valid')
  ],
  handleValidationErrors,
  verificationController.deleteVerificationPolicy
);

// @route   GET /api/verify/analytics
// @desc    Get verification analytics
// @access  Private
router.get('/analytics',
  [
    query('period').optional().isIn(['day', 'week', 'month', 'year'])
      .withMessage('Period must be day, week, month, or year'),
    query('credentialType').optional().isString()
      .withMessage('Credential type must be a string if provided')
  ],
  handleValidationErrors,
  verificationController.getVerificationAnalytics
);

// @route   POST /api/verify/report
// @desc    Generate verification report
// @access  Private
router.post('/report',
  [
    body('startDate').isISO8601()
      .withMessage('Start date is required and must be valid'),
    body('endDate').isISO8601()
      .withMessage('End date is required and must be valid'),
    body('format').optional().isIn(['pdf', 'csv', 'json'])
      .withMessage('Format must be pdf, csv, or json'),
    body('includeDetails').optional().isBoolean()
      .withMessage('Include details must be a boolean if provided')
  ],
  handleValidationErrors,
  verificationController.generateVerificationReport
);

module.exports = router;
