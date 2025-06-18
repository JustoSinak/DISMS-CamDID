const express = require('express');
const router = express.Router();
const multer = require('multer');
const credentialController = require('../controllers/credentialController');
const { authenticate } = require('../middleware/auth');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// All routes require authentication
router.use(authenticate);

// Create new credential
router.post('/:identityId/credentials', 
  upload.single('document'),
  credentialController.createCredential
);

// Get all credentials for an identity
router.get('/:identityId/credentials', credentialController.getCredentials);

// Share credential
router.post('/credentials/:credentialId/share', credentialController.shareCredential);

// Verify credential
router.post('/credentials/:credentialId/verify', credentialController.verifyCredential);

// Revoke credential
router.post('/credentials/:credentialId/revoke', credentialController.revokeCredential);

// Generate sharing QR code
router.post('/credentials/:credentialId/qr', credentialController.generateSharingQR);

// Get credential activity
router.get('/credentials/:credentialId/activity', credentialController.getCredentialActivity);

module.exports = router; 