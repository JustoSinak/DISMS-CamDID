// server/routes/biometric.js - Biometric authentication routes
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const biometricController = require('../controllers/biometricController');

// Apply authentication to all routes
router.use(authenticateToken);

// @route   POST /api/auth/biometric/register
// @desc    Register biometric credential
// @access  Private
router.post('/register',
  [
    body('credentialData').isObject()
      .withMessage('Credential data is required'),
    body('credentialData.id').isString()
      .withMessage('Credential ID is required'),
    body('credentialData.rawId').isArray()
      .withMessage('Raw ID must be an array'),
    body('credentialData.type').equals('public-key')
      .withMessage('Credential type must be public-key'),
    body('biometricType').isIn(['fingerprint', 'face', 'voice'])
      .withMessage('Biometric type must be fingerprint, face, or voice')
  ],
  handleValidationErrors,
  biometricController.registerBiometric
);

// @route   GET /api/auth/biometric/credentials
// @desc    Get user's registered biometric credentials
// @access  Private
router.get('/credentials', biometricController.getBiometricCredentials);

// @route   POST /api/auth/biometric/verify
// @desc    Verify biometric assertion
// @access  Private
router.post('/verify',
  [
    body('verificationData').isObject()
      .withMessage('Verification data is required'),
    body('verificationData.id').isString()
      .withMessage('Credential ID is required'),
    body('verificationData.rawId').isArray()
      .withMessage('Raw ID must be an array'),
    body('biometricType').isIn(['fingerprint', 'face', 'voice'])
      .withMessage('Biometric type must be fingerprint, face, or voice')
  ],
  handleValidationErrors,
  biometricController.verifyBiometric
);

// @route   DELETE /api/auth/biometric/credentials/:credentialId
// @desc    Remove biometric credential
// @access  Private
router.delete('/credentials/:credentialId',
  biometricController.removeBiometricCredential
);

// @route   GET /api/auth/biometric/status
// @desc    Get biometric authentication status for user
// @access  Private
router.get('/status', biometricController.getBiometricStatus);

// @route   POST /api/auth/biometric/enable
// @desc    Enable biometric authentication for user
// @access  Private
router.post('/enable',
  [
    body('biometricTypes').isArray({ min: 1 })
      .withMessage('At least one biometric type must be specified'),
    body('biometricTypes.*').isIn(['fingerprint', 'face', 'voice'])
      .withMessage('Each biometric type must be fingerprint, face, or voice')
  ],
  handleValidationErrors,
  biometricController.enableBiometric
);

// @route   POST /api/auth/biometric/disable
// @desc    Disable biometric authentication for user
// @access  Private
router.post('/disable',
  [
    body('biometricTypes').optional().isArray()
      .withMessage('Biometric types must be an array if provided'),
    body('biometricTypes.*').optional().isIn(['fingerprint', 'face', 'voice'])
      .withMessage('Each biometric type must be fingerprint, face, or voice'),
    body('disableAll').optional().isBoolean()
      .withMessage('Disable all must be a boolean if provided')
  ],
  handleValidationErrors,
  biometricController.disableBiometric
);

// @route   POST /api/auth/biometric/challenge
// @desc    Generate challenge for biometric authentication
// @access  Private
router.post('/challenge',
  [
    body('purpose').isIn(['login', 'transaction', 'verification'])
      .withMessage('Purpose must be login, transaction, or verification'),
    body('biometricType').isIn(['fingerprint', 'face', 'voice'])
      .withMessage('Biometric type must be fingerprint, face, or voice')
  ],
  handleValidationErrors,
  biometricController.generateChallenge
);

// @route   POST /api/auth/biometric/verify-challenge
// @desc    Verify challenge response
// @access  Private
router.post('/verify-challenge',
  [
    body('challengeId').isUUID()
      .withMessage('Valid challenge ID is required'),
    body('response').isObject()
      .withMessage('Response object is required'),
    body('biometricType').isIn(['fingerprint', 'face', 'voice'])
      .withMessage('Biometric type must be fingerprint, face, or voice')
  ],
  handleValidationErrors,
  biometricController.verifyChallenge
);

// @route   GET /api/auth/biometric/history
// @desc    Get biometric authentication history
// @access  Private
router.get('/history',
  biometricController.getBiometricHistory
);

// @route   POST /api/auth/biometric/backup-codes
// @desc    Generate backup codes for biometric authentication
// @access  Private
router.post('/backup-codes',
  biometricController.generateBackupCodes
);

// @route   POST /api/auth/biometric/use-backup-code
// @desc    Use backup code for authentication
// @access  Private
router.post('/use-backup-code',
  [
    body('backupCode').isLength({ min: 8, max: 12 })
      .withMessage('Backup code must be between 8 and 12 characters')
  ],
  handleValidationErrors,
  biometricController.useBackupCode
);

module.exports = router;
