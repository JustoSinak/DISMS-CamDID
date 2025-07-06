// server/routes/sharing.js - Credential sharing routes as specified in PRD
const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const sharingController = require('../controllers/sharingController');

// Apply authentication to all routes
router.use(authenticateToken);

// @route   POST /api/sharing/generate-qr
// @desc    Generate QR code for credential sharing
// @access  Private
router.post('/generate-qr',
  [
    body('credentialId').isMongoId()
      .withMessage('Valid credential ID is required'),
    body('recipientId').optional().isMongoId()
      .withMessage('Recipient ID must be valid if provided'),
    body('expirationTime').isISO8601()
      .withMessage('Valid expiration time is required'),
    body('revealedAttributes').isArray({ min: 1 })
      .withMessage('At least one attribute must be selected for sharing'),
    body('revealedAttributes.*').isString()
      .withMessage('Each revealed attribute must be a string'),
    body('accessLevel').optional().isIn(['view', 'verify', 'full'])
      .withMessage('Access level must be view, verify, or full'),
    body('maxUses').optional().isInt({ min: 1, max: 100 })
      .withMessage('Max uses must be between 1 and 100')
  ],
  handleValidationErrors,
  sharingController.generateQRCode
);

// @route   POST /api/sharing/generate-link
// @desc    Generate shareable link for credential
// @access  Private
router.post('/generate-link',
  [
    body('credentialId').isMongoId()
      .withMessage('Valid credential ID is required'),
    body('expirationTime').isISO8601()
      .withMessage('Valid expiration time is required'),
    body('revealedAttributes').isArray({ min: 1 })
      .withMessage('At least one attribute must be selected for sharing'),
    body('passwordProtected').optional().isBoolean()
      .withMessage('Password protected must be a boolean'),
    body('password').optional().isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters if provided'),
    body('allowedDomains').optional().isArray()
      .withMessage('Allowed domains must be an array'),
    body('allowedDomains.*').optional().isURL()
      .withMessage('Each allowed domain must be a valid URL')
  ],
  handleValidationErrors,
  sharingController.generateShareableLink
);

// @route   GET /api/sharing/verify/:shareId
// @desc    Verify and access shared credential
// @access  Public (but requires valid share ID)
router.get('/verify/:shareId',
  [
    param('shareId').isUUID()
      .withMessage('Valid share ID is required'),
    query('password').optional().isString()
      .withMessage('Password must be a string if provided')
  ],
  handleValidationErrors,
  sharingController.verifySharedCredential
);

// @route   POST /api/sharing/request-access
// @desc    Request access to a credential
// @access  Private
router.post('/request-access',
  [
    body('credentialOwnerId').isMongoId()
      .withMessage('Valid credential owner ID is required'),
    body('credentialId').isMongoId()
      .withMessage('Valid credential ID is required'),
    body('requestedAttributes').isArray({ min: 1 })
      .withMessage('At least one attribute must be requested'),
    body('requestedAttributes.*').isString()
      .withMessage('Each requested attribute must be a string'),
    body('purpose').isLength({ min: 10, max: 500 })
      .withMessage('Purpose must be between 10 and 500 characters'),
    body('organization').optional().isLength({ max: 100 })
      .withMessage('Organization name must be less than 100 characters')
  ],
  handleValidationErrors,
  sharingController.requestAccess
);

// @route   GET /api/sharing/requests
// @desc    Get credential access requests (for credential owners)
// @access  Private
router.get('/requests',
  [
    query('status').optional().isIn(['pending', 'approved', 'rejected'])
      .withMessage('Status must be pending, approved, or rejected'),
    query('page').optional().isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50')
  ],
  handleValidationErrors,
  sharingController.getAccessRequests
);

// @route   PUT /api/sharing/requests/:requestId
// @desc    Approve or reject access request
// @access  Private
router.put('/requests/:requestId',
  [
    param('requestId').isMongoId()
      .withMessage('Valid request ID is required'),
    body('action').isIn(['approve', 'reject'])
      .withMessage('Action must be approve or reject'),
    body('expirationTime').optional().isISO8601()
      .withMessage('Expiration time must be valid if provided'),
    body('restrictions').optional().isObject()
      .withMessage('Restrictions must be an object if provided')
  ],
  handleValidationErrors,
  sharingController.handleAccessRequest
);

// @route   GET /api/sharing/history
// @desc    Get credential sharing history
// @access  Private
router.get('/history',
  [
    query('credentialId').optional().isMongoId()
      .withMessage('Credential ID must be valid if provided'),
    query('type').optional().isIn(['shared', 'accessed', 'requested'])
      .withMessage('Type must be shared, accessed, or requested'),
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
  sharingController.getSharingHistory
);

// @route   DELETE /api/sharing/revoke/:shareId
// @desc    Revoke a shared credential link/QR
// @access  Private
router.delete('/revoke/:shareId',
  [
    param('shareId').isUUID()
      .withMessage('Valid share ID is required')
  ],
  handleValidationErrors,
  sharingController.revokeSharedCredential
);

// @route   GET /api/sharing/analytics
// @desc    Get sharing analytics for user's credentials
// @access  Private
router.get('/analytics',
  [
    query('period').optional().isIn(['day', 'week', 'month', 'year'])
      .withMessage('Period must be day, week, month, or year'),
    query('credentialId').optional().isMongoId()
      .withMessage('Credential ID must be valid if provided')
  ],
  handleValidationErrors,
  sharingController.getSharingAnalytics
);

// @route   POST /api/sharing/selective-disclosure
// @desc    Create selective disclosure proof
// @access  Private
router.post('/selective-disclosure',
  [
    body('credentialId').isMongoId()
      .withMessage('Valid credential ID is required'),
    body('disclosureRequest').isObject()
      .withMessage('Disclosure request must be an object'),
    body('disclosureRequest.attributes').isArray({ min: 1 })
      .withMessage('At least one attribute must be disclosed'),
    body('disclosureRequest.predicates').optional().isArray()
      .withMessage('Predicates must be an array if provided'),
    body('verifierDid').optional().isString()
      .withMessage('Verifier DID must be a string if provided')
  ],
  handleValidationErrors,
  sharingController.createSelectiveDisclosure
);

// @route   POST /api/sharing/verify-disclosure
// @desc    Verify selective disclosure proof
// @access  Private
router.post('/verify-disclosure',
  [
    body('proof').isObject()
      .withMessage('Proof object is required'),
    body('credentialHash').isString()
      .withMessage('Credential hash is required'),
    body('disclosureRequest').isObject()
      .withMessage('Disclosure request is required')
  ],
  handleValidationErrors,
  sharingController.verifySelectiveDisclosure
);

// @route   GET /api/sharing/templates
// @desc    Get sharing templates for quick setup
// @access  Private
router.get('/templates', sharingController.getSharingTemplates);

// @route   POST /api/sharing/templates
// @desc    Create custom sharing template
// @access  Private
router.post('/templates',
  [
    body('name').isLength({ min: 1, max: 100 })
      .withMessage('Template name must be between 1 and 100 characters'),
    body('description').optional().isLength({ max: 500 })
      .withMessage('Description must be less than 500 characters'),
    body('defaultAttributes').isArray({ min: 1 })
      .withMessage('At least one default attribute must be specified'),
    body('defaultExpirationHours').isInt({ min: 1, max: 8760 })
      .withMessage('Default expiration must be between 1 hour and 1 year'),
    body('accessLevel').isIn(['view', 'verify', 'full'])
      .withMessage('Access level must be view, verify, or full')
  ],
  handleValidationErrors,
  sharingController.createSharingTemplate
);

module.exports = router;
