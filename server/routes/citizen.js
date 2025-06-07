// identity-blockchain-app/server/routes/citizen.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { isCitizen } = require('../middleware/roleAuth');
const citizenController = require('../controllers/citizenController');
const { handleValidationErrors } = require('../middleware/validation');

// Apply authentication and role middleware to all routes
router.use(authenticateToken, isCitizen);

// Get citizen profile
router.get('/profile', citizenController.getProfile);

// Update citizen profile
router.put('/profile',
  [
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('First name must be between 1 and 50 characters')
      .matches(/^[a-zA-Z]+$/)
      .withMessage('First name can only contain letters'),
    
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Last name must be between 1 and 50 characters')
      .matches(/^[a-zA-Z]+$/)
      .withMessage('Last name can only contain letters'),
    
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores')
  ],
  handleValidationErrors,
  citizenController.updateProfile
);

// Get citizen's credentials
router.get('/credentials', citizenController.getCredentials);

// Request a new credential
router.post('/credentials/request',
  [
    body('issuerId').notEmpty().withMessage('Issuer ID is required'),
    body('templateId').notEmpty().withMessage('Template ID is required'),
    body('purpose').trim().notEmpty().withMessage('Purpose is required')
  ],
  handleValidationErrors,
  citizenController.requestCredential
);

// Share a credential
router.post('/credentials/share',
  [
    body('credentialId').notEmpty().withMessage('Credential ID is required'),
    body('recipientId').notEmpty().withMessage('Recipient ID is required'),
    body('expiresAt').optional().isISO8601().withMessage('Invalid expiration date')
  ],
  handleValidationErrors,
  citizenController.shareCredential
);

// Get verification history
router.get('/verifications', citizenController.getVerificationHistory);

// Get dashboard statistics
router.get('/dashboard/stats', citizenController.getDashboardStats);

// Submit government verification
router.post('/government-verification',
  [
    body('method')
      .isIn(['government_database', 'document_upload', 'in_person'])
      .withMessage('Invalid verification method'),
    body('documents').optional().isArray().withMessage('Documents must be an array')
  ],
  handleValidationErrors,
  citizenController.submitGovernmentVerification
);

module.exports = router; 