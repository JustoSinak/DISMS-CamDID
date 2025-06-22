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

// Issue new credential
router.post('/issue',
  upload.single('document'),
  credentialController.createCredential // Assuming createCredential controller handles issue logic
);

// Get specific credential by ID
router.get('/:id', credentialController.getCredentialById); // Assuming a new controller function getCredentialById

// Get all credentials for a user
router.get('/user/:userId', credentialController.getCredentials); // Assuming getCredentials controller handles getting by userId

// Share credential
router.post('/share/:id', credentialController.shareCredential);

// Verify credential
router.post('/verify/:id', credentialController.verifyCredential);

// Revoke credential
router.put('/:id/revoke', credentialController.revokeCredential);

// Generate sharing QR code
router.post('/share/:id/qr', credentialController.generateSharingQR);

// Get sharing history for a user
router.get('/shared/:userId', credentialController.getSharingHistory); // Assuming a new controller function getSharingHistory

// Remove the old getCredentialActivity route if it's not needed based on PRD
// router.get('/credentials/:credentialId/activity', credentialController.getCredentialActivity);

// Credential schema endpoints
router.post('/schemas', credentialController.registerSchema);
router.get('/schemas', credentialController.getAllSchemas);
router.get('/schemas/:id', credentialController.getSchemaById);

module.exports = router;
