// routes/identity.js
const express = require('express');
const router = express.Router();
const identityController = require('../controllers/identityController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Create new identity
router.post('/', identityController.createIdentity);

// Verify government ID
router.post('/:identityId/verify-government-id', identityController.verifyGovernmentId);

// Setup biometrics
router.post('/:identityId/setup-biometrics', identityController.setupBiometrics);

// Verify contact information
router.post('/:identityId/verify-contact', identityController.verifyContactInfo);

// Finalize identity
router.post('/:identityId/finalize', identityController.finalizeIdentity);

// Get identity details
router.get('/:identityId', identityController.getIdentity);

module.exports = router;