const express = require('express');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const blockchainController = require('../controllers/blockchainController');
const { body } = require('express-validator');

const router = express.Router();

// Admin dashboard stats
router.get('/dashboard', authenticateToken, isAdmin, adminController.getDashboardStats);

// Get all users
router.get('/users', authenticateToken, isAdmin, adminController.getAllUsers);

// Update user role
router.put(
  '/users/:userId/role',
  authenticateToken,
  isAdmin,
  body('role')
    .isIn(['citizen', 'issuer', 'verifier', 'admin'])
    .withMessage('Invalid role specified'),
  adminController.updateUserRole
);

// Deactivate user
router.put(
  '/users/:userId/deactivate',
  authenticateToken,
  isAdmin,
  adminController.deactivateUser
);

// Blockchain-related routes
// Mine a new block
router.post('/blockchain/mine', authenticateToken, isAdmin, blockchainController.mineBlock);

// Get mining statistics
router.get('/blockchain/stats', authenticateToken, isAdmin, blockchainController.getMiningStats);

// Credential management routes
// Revoke a credential
router.post(
  '/credentials/revoke',
  authenticateToken,
  isAdmin,
  body('credentialId').notEmpty().withMessage('Credential ID is required'),
  body('reason').optional().isString().trim(),
  blockchainController.revokeCredential
);

// Get all revoked credentials
router.get('/credentials/revoked', authenticateToken, isAdmin, blockchainController.getRevokedCredentials);

console.log('adminController.getDashboardStats:', typeof adminController.getDashboardStats);
console.log('adminController.getAllUsers:', typeof adminController.getAllUsers);
console.log('adminController.updateUserRole:', typeof adminController.updateUserRole);
console.log('adminController.deactivateUser:', typeof adminController.deactivateUser);
console.log('blockchainController.mineBlock:', typeof blockchainController.mineBlock);
console.log('blockchainController.getMiningStats:', typeof blockchainController.getMiningStats);
console.log('blockchainController.revokeCredential:', typeof blockchainController.revokeCredential);
console.log('blockchainController.getRevokedCredentials:', typeof blockchainController.getRevokedCredentials);

module.exports = router;
