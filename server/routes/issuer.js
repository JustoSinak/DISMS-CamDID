// identity-blockchain-app/server/routes/issuer.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { isIssuer } = require('../middleware/roleAuth');
const issuerController = require('../controllers/issuerController');

// Apply authentication and role middleware to all routes
router.use(authenticateToken, isIssuer);

// Get all credential templates
router.get('/templates', issuerController.getTemplates);

// Create a new credential template
router.post('/templates', issuerController.createTemplate);

// Issue a credential
router.post('/credentials/issue', issuerController.issueCredential);

// Get all issued credentials
router.get('/credentials', issuerController.getIssuedCredentials);

// Revoke a credential
router.post('/credentials/revoke', issuerController.revokeCredential);

// Get dashboard statistics
router.get('/dashboard/stats', issuerController.getDashboardStats);

module.exports = router; 