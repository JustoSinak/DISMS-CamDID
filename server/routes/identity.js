// routes/identity.js
const express = require('express');
const router = express.Router();
const identityController = require('../controllers/identityController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Create new identity
router.post('/create', identityController.createIdentity);

// Verify government ID
router.post('/:identityId/verify-government-id', identityController.verifyGovernmentId);

// Setup biometrics
router.post('/:identityId/setup-biometrics', identityController.setupBiometrics);

// Verify contact information
router.post('/:identityId/verify-contact', identityController.verifyContactInfo);

// Finalize identity
router.post('/:identityId/finalize', identityController.finalizeIdentity);

// Get identity details
router.get('/:id', identityController.getIdentity);

// Update identity details
router.put('/:id', identityController.updateIdentity);

// Delete identity
router.delete('/:identityId', identityController.deleteIdentity);

// @route   POST /api/identity/verify
// @desc    Verify identity documents
// @access  Private
router.post('/verify', identityController.verifyIdentity);

// @route   GET /api/identity/verification-status/:id
// @desc    Get verification status
// @access  Private
router.get('/verification-status/:id', identityController.getVerificationStatus);

// Get DID version count
router.get('/did/:did/versions', identityController.getDIDVersionCount);

// Get specific DID version
router.get('/did/:did/version/:version', identityController.getDIDVersion);

module.exports = router;
