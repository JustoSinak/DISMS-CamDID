const express = require('express');
const { body, param } = require('express-validator');
const didController = require('../controllers/didController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Middleware to validate DID format
const validateDID = param('did').matches(/^did:disms:[0-9a-f-]+$/)
    .withMessage('Invalid DID format');

// Create a new DID
router.post('/',
    authMiddleware,
    [
        body('userId').notEmpty().withMessage('User ID is required')
    ],
    didController.createDID
);

// Resolve a DID
router.get('/:did',
    validateDID,
    didController.resolveDID
);

// Update a DID Document
router.put('/:did',
    authMiddleware,
    [
        validateDID,
        body('publicKey').optional().isString(),
        body('authenticationKey').optional().isString(),
        body('serviceEndpoint').optional().isURL()
    ],
    didController.updateDID
);

// Deactivate a DID
router.delete('/:did',
    authMiddleware,
    validateDID,
    didController.deactivateDID
);

module.exports = router; 