const express = require('express');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const blockchainController = require('../controllers/blockchainController');
const { body, query, param } = require('express-validator');

const router = express.Router();

// ============================================================================
// DASHBOARD & ANALYTICS
// ============================================================================

// Admin dashboard stats
router.get('/dashboard', authenticateToken, isAdmin, adminController.getDashboardStats);

// System analytics
router.get('/analytics', authenticateToken, isAdmin, adminController.getSystemAnalytics);

// System health monitoring
router.get('/monitoring/health', authenticateToken, isAdmin, (req, res) => {
  const health = {
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date()
  };
  res.json({ success: true, data: health });
});

// ============================================================================
// USER MANAGEMENT
// ============================================================================

// Get all users with pagination and filtering
router.get('/users', 
  authenticateToken, 
  isAdmin,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('role').optional().isIn(['citizen', 'issuer', 'verifier', 'admin']),
    query('status').optional().isIn(['active', 'inactive']),
    query('search').optional().isString().trim()
  ],
  adminController.getAllUsers
);

// Get user details
router.get('/users/:userId', 
  authenticateToken, 
  isAdmin,
  [param('userId').isMongoId()],
  adminController.getUserDetails
);

// Update user role
router.put('/users/:userId/role',
  authenticateToken,
  isAdmin,
  [
    param('userId').isMongoId(),
    body('role')
      .isIn(['citizen', 'issuer', 'verifier', 'admin'])
      .withMessage('Invalid role specified')
  ],
  adminController.updateUserRole
);

// Deactivate user
router.put('/users/:userId/deactivate',
  authenticateToken,
  isAdmin,
  [
    param('userId').isMongoId(),
    body('reason').optional().isString().trim()
  ],
  adminController.deactivateUser
);

// Reactivate user
router.put('/users/:userId/reactivate',
  authenticateToken,
  isAdmin,
  [param('userId').isMongoId()],
  adminController.reactivateUser
);

// ============================================================================
// ISSUER MANAGEMENT
// ============================================================================

// Get all issuers
router.get('/issuers', authenticateToken, isAdmin, adminController.getIssuerManagement);

// Approve issuer
router.post('/issuers/approve',
  authenticateToken,
  isAdmin,
  [
    body('userId').isMongoId(),
    body('approvalReason').optional().isString().trim()
  ],
  (req, res) => {
    // Implementation for issuer approval
    res.json({ success: true, message: 'Issuer approved successfully' });
  }
);

// Update issuer status
router.put('/issuers/:issuerId/status',
  authenticateToken,
  isAdmin,
  [
    param('issuerId').isMongoId(),
    body('status').isIn(['active', 'suspended', 'revoked']),
    body('reason').optional().isString().trim()
  ],
  (req, res) => {
    // Implementation for issuer status update
    res.json({ success: true, message: 'Issuer status updated successfully' });
  }
);

// ============================================================================
// VERIFIER MANAGEMENT
// ============================================================================

// Get all verifiers
router.get('/verifiers', authenticateToken, isAdmin, adminController.getVerifierManagement);

// Approve verifier
router.post('/verifiers/approve',
  authenticateToken,
  isAdmin,
  [
    body('userId').isMongoId(),
    body('permissions').isArray(),
    body('approvalReason').optional().isString().trim()
  ],
  (req, res) => {
    // Implementation for verifier approval
    res.json({ success: true, message: 'Verifier approved successfully' });
  }
);

// Update verifier permissions
router.put('/verifiers/:verifierId/permissions',
  authenticateToken,
  isAdmin,
  [
    param('verifierId').isMongoId(),
    body('permissions').isArray()
  ],
  (req, res) => {
    // Implementation for verifier permissions update
    res.json({ success: true, message: 'Verifier permissions updated successfully' });
  }
);

// ============================================================================
// SYSTEM CONFIGURATION
// ============================================================================

// Get system configuration
router.get('/config', authenticateToken, isAdmin, adminController.getSystemConfig);

// Update system configuration
router.put('/config',
  authenticateToken,
  isAdmin,
  [
    body('config').isObject(),
    body('config.maxCredentialsPerUser').optional().isInt({ min: 1 }),
    body('config.credentialExpiryDays').optional().isInt({ min: 1 }),
    body('config.minTrustScore').optional().isInt({ min: 0, max: 100 }),
    body('config.maxVerificationAttempts').optional().isInt({ min: 1 })
  ],
  adminController.updateSystemConfig
);

// ============================================================================
// AUDIT & COMPLIANCE
// ============================================================================

// Get admin activity logs
router.get('/logs',
  authenticateToken,
  isAdmin,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('adminId').optional().isMongoId(),
    query('action').optional().isString(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601()
  ],
  adminController.getAdminActivityLogs
);

// ============================================================================
// BLOCKCHAIN MANAGEMENT
// ============================================================================

// Get blockchain status
router.get('/blockchain/status', authenticateToken, isAdmin, (req, res) => {
  // Implementation for blockchain status
  res.json({
    success: true,
    data: {
      status: 'connected',
      network: 'testnet',
      latestBlock: 12345,
      gasPrice: '20000000000',
      timestamp: new Date()
    }
  });
});

// Get blockchain transactions
router.get('/blockchain/transactions',
  authenticateToken,
  isAdmin,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('type').optional().isString()
  ],
  (req, res) => {
    // Implementation for blockchain transactions
    res.json({
      success: true,
      data: {
        transactions: [],
        pagination: {
          page: parseInt(req.query.page) || 1,
          limit: parseInt(req.query.limit) || 20,
          total: 0,
          pages: 0
        }
      }
    });
  }
);

// Deploy smart contract
router.post('/blockchain/contracts/deploy',
  authenticateToken,
  isAdmin,
  [
    body('contractName').isString(),
    body('contractAddress').optional().isString(),
    body('deploymentParams').optional().isObject()
  ],
  (req, res) => {
    // Implementation for contract deployment
    res.json({ success: true, message: 'Contract deployment initiated' });
  }
);

// ============================================================================
// EMERGENCY MANAGEMENT
// ============================================================================

// Declare emergency
router.post('/emergency/declare',
  authenticateToken,
  isAdmin,
  [
    body('level').isIn(['low', 'medium', 'high', 'critical']),
    body('type').isIn(['security', 'technical', 'compliance', 'natural']),
    body('reason').isString().trim(),
    body('description').isString().trim()
  ],
  (req, res) => {
    // Implementation for emergency declaration
    res.json({ success: true, message: 'Emergency declared successfully' });
  }
);

// Resolve emergency
router.post('/emergency/resolve/:emergencyId',
  authenticateToken,
  isAdmin,
  [param('emergencyId').isInt({ min: 1 })],
  (req, res) => {
    // Implementation for emergency resolution
    res.json({ success: true, message: 'Emergency resolved successfully' });
  }
);

// Get emergency status
router.get('/emergency/status', authenticateToken, isAdmin, (req, res) => {
  // Implementation for emergency status
  res.json({
    success: true,
    data: {
      inEmergency: false,
      currentLevel: 'none',
      activeEmergencies: 0,
      lastEmergency: null
    }
  });
});

// ============================================================================
// CREDENTIAL MANAGEMENT
// ============================================================================

// Revoke a credential
router.post('/credentials/revoke',
  authenticateToken,
  isAdmin,
  [
    body('credentialId').isMongoId(),
    body('reason').optional().isString().trim()
  ],
  blockchainController.revokeCredential
);

// Get all revoked credentials
router.get('/credentials/revoked', 
  authenticateToken, 
  isAdmin,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  blockchainController.getRevokedCredentials
);

// Get credential statistics
router.get('/credentials/stats', authenticateToken, isAdmin, (req, res) => {
  // Implementation for credential statistics
  res.json({
    success: true,
    data: {
      total: 0,
      active: 0,
      revoked: 0,
      expired: 0
    }
  });
});

// ============================================================================
// LEGACY ROUTES (for backward compatibility)
// ============================================================================

// Mine a new block
router.post('/blockchain/mine', authenticateToken, isAdmin, blockchainController.mineBlock);

// Get mining statistics
router.get('/blockchain/stats', authenticateToken, isAdmin, blockchainController.getMiningStats);

console.log('adminController.getDashboardStats:', typeof adminController.getDashboardStats);
console.log('adminController.getAllUsers:', typeof adminController.getAllUsers);
console.log('adminController.updateUserRole:', typeof adminController.updateUserRole);
console.log('adminController.deactivateUser:', typeof adminController.deactivateUser);
console.log('blockchainController.mineBlock:', typeof blockchainController.mineBlock);
console.log('blockchainController.getMiningStats:', typeof blockchainController.getMiningStats);
console.log('blockchainController.revokeCredential:', typeof blockchainController.revokeCredential);
console.log('blockchainController.getRevokedCredentials:', typeof blockchainController.getRevokedCredentials);

module.exports = router;
