const express = require('express');
const { body, param } = require('express-validator');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

const router = express.Router();

// All routes require authentication and admin privileges
router.use(authMiddleware);
router.use(adminMiddleware);

// Validate Ethereum address
const validateAddress = (field) => 
    body(field).matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Invalid Ethereum address');

const validateAddressParam = param('address').matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid Ethereum address');

// Get system statistics
router.get('/stats', adminController.getSystemStats);

// Admin management routes
router.get('/admins', adminController.getAllAdmins);
router.post('/admins',
    validateAddress('address'),
    adminController.addAdmin
);
router.delete('/admins/:address',
    validateAddressParam,
    adminController.removeAdmin
);

// Issuer management routes
router.get('/issuers', adminController.getAllIssuers);
router.post('/issuers',
    validateAddress('address'),
    adminController.addIssuer
);
router.delete('/issuers/:address',
    validateAddressParam,
    adminController.removeIssuer
);

module.exports = router; 