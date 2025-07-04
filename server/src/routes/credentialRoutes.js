const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const credentialController = require('../controllers/credentialController');

// Issue a new credential
router.post('/', verifyToken, credentialController.issueCredential);

// Get credential by ID
router.get('/:credentialId', verifyToken, credentialController.getCredential);

// Get all credentials for a DID
router.get('/did/:did', verifyToken, credentialController.getCredentialsByDid);

// Revoke a credential
router.put('/:credentialId/revoke', verifyToken, credentialController.revokeCredential);

// Verify a credential
router.get('/:credentialId/verify', verifyToken, credentialController.verifyCredential);

module.exports = router;
