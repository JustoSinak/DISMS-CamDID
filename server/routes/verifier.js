const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { isVerifier } = require('../middleware/roleAuth');
const verifierController = require('../controllers/verifierController');

// Apply authentication and role middleware to all routes
router.use(authenticateToken, isVerifier);

// Verify a credential
router.post('/verify', verifierController.verifyCredential);

// Get verification history
router.get('/verifications', verifierController.getVerificationHistory);

// Search verification records
router.get('/verifications/search', verifierController.searchVerifications);

// Get dashboard statistics
router.get('/dashboard/stats', verifierController.getDashboardStats);

module.exports = router; 