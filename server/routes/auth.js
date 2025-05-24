const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation middleware for registration
const validateRegistration = [
  body('nationalId')
    .isLength({ min: 8, max: 20 })
    .withMessage('National ID must be between 8 and 20 characters')
    .matches(/^[0-9A-Za-z]+$/)
    .withMessage('National ID can only contain letters and numbers'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  body('phoneNumber')
    .matches(/^(\+237|237)?[0-9]{8,9}$/)
    .withMessage('Please provide a valid Cameroon phone number')
];

// Validation middleware for login
const validateLogin = [
  body('nationalId')
    .notEmpty()
    .withMessage('National ID is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  next();
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', validateRegistration, handleValidationErrors, authController.register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, handleValidationErrors, authController.login);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticateToken, authController.getProfile);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticateToken, authController.logout);

// @route   GET /api/auth/verify-token
// @desc    Verify if token is still valid
// @access  Private
router.get('/verify-token', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    user: {
      id: req.user.userId,
      nationalId: req.user.nationalId,
      email: req.user.email,
      role: req.user.role,
      isVerified: req.user.isVerified
    }
  });
});

module.exports = router;