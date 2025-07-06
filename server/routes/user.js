// server/routes/user.js - User management routes as specified in PRD
const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const userController = require('../controllers/userController');

// Apply authentication to all routes
router.use(authenticateToken);

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', userController.getProfile);

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', 
  [
    body('firstName').optional().trim().isLength({ min: 1, max: 50 })
      .withMessage('First name must be between 1 and 50 characters'),
    body('lastName').optional().trim().isLength({ min: 1, max: 50 })
      .withMessage('Last name must be between 1 and 50 characters'),
    body('dateOfBirth').optional().isISO8601()
      .withMessage('Date of birth must be a valid date'),
    body('address.street').optional().trim().isLength({ max: 100 })
      .withMessage('Street address must be less than 100 characters'),
    body('address.city').optional().trim().isLength({ max: 50 })
      .withMessage('City must be less than 50 characters'),
    body('address.state').optional().trim().isLength({ max: 50 })
      .withMessage('State must be less than 50 characters'),
    body('address.postalCode').optional().trim().isLength({ max: 20 })
      .withMessage('Postal code must be less than 20 characters'),
    body('address.country').optional().trim().isLength({ max: 50 })
      .withMessage('Country must be less than 50 characters')
  ],
  handleValidationErrors,
  userController.updateProfile
);

// @route   GET /api/user/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', userController.getDashboard);

// @route   GET /api/user/account
// @desc    Get user account information
// @access  Private
router.get('/account', userController.getAccount);

// @route   PUT /api/user/account
// @desc    Update user account settings
// @access  Private
router.put('/account',
  [
    body('emailNotifications').optional().isBoolean()
      .withMessage('Email notifications must be a boolean'),
    body('smsNotifications').optional().isBoolean()
      .withMessage('SMS notifications must be a boolean'),
    body('twoFactorEnabled').optional().isBoolean()
      .withMessage('Two factor enabled must be a boolean'),
    body('language').optional().isIn(['en', 'fr'])
      .withMessage('Language must be either en or fr'),
    body('timezone').optional().isString()
      .withMessage('Timezone must be a string')
  ],
  handleValidationErrors,
  userController.updateAccount
);

// @route   GET /api/user/activity
// @desc    Get user activity history
// @access  Private
router.get('/activity',
  [
    query('page').optional().isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('type').optional().isIn(['login', 'credential', 'verification', 'sharing'])
      .withMessage('Type must be one of: login, credential, verification, sharing'),
    query('startDate').optional().isISO8601()
      .withMessage('Start date must be a valid ISO date'),
    query('endDate').optional().isISO8601()
      .withMessage('End date must be a valid ISO date')
  ],
  handleValidationErrors,
  userController.getActivity
);

// @route   GET /api/user/statistics
// @desc    Get user statistics
// @access  Private
router.get('/statistics', userController.getStatistics);

// @route   POST /api/user/upload-avatar
// @desc    Upload user profile picture
// @access  Private
const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

router.post('/upload-avatar', 
  upload.single('avatar'),
  userController.uploadAvatar
);

// @route   DELETE /api/user/avatar
// @desc    Delete user profile picture
// @access  Private
router.delete('/avatar', userController.deleteAvatar);

// @route   GET /api/user/preferences
// @desc    Get user preferences
// @access  Private
router.get('/preferences', userController.getPreferences);

// @route   PUT /api/user/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences',
  [
    body('theme').optional().isIn(['light', 'dark', 'auto'])
      .withMessage('Theme must be light, dark, or auto'),
    body('language').optional().isIn(['en', 'fr'])
      .withMessage('Language must be en or fr'),
    body('notifications.email').optional().isBoolean(),
    body('notifications.sms').optional().isBoolean(),
    body('notifications.push').optional().isBoolean(),
    body('privacy.shareActivity').optional().isBoolean(),
    body('privacy.allowAnalytics').optional().isBoolean()
  ],
  handleValidationErrors,
  userController.updatePreferences
);

// @route   POST /api/user/deactivate
// @desc    Deactivate user account
// @access  Private
router.post('/deactivate',
  [
    body('password').notEmpty()
      .withMessage('Password is required for account deactivation'),
    body('reason').optional().trim().isLength({ max: 500 })
      .withMessage('Reason must be less than 500 characters')
  ],
  handleValidationErrors,
  userController.deactivateAccount
);

// @route   POST /api/user/export-data
// @desc    Export user data (GDPR compliance)
// @access  Private
router.post('/export-data', userController.exportUserData);

// @route   GET /api/user/export-data/:exportId
// @desc    Download exported user data
// @access  Private
router.get('/export-data/:exportId', userController.downloadExportedData);

module.exports = router;
