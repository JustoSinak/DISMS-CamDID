// routes/identity.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validation = require('../middleware/validation');
const identityController = require('../controllers/identityController');

// Identity routes
router.post('/create', 
    auth, 
    validation.validateIdentityCreation, 
    identityController.createIdentity
);

router.post('/attributes', 
    auth, 
    validation.validateAttribute, 
    identityController.addAttribute
);

router.get('/', 
    auth, 
    identityController.getIdentity
);

router.put('/blockchain-status', 
    auth, 
    identityController.updateBlockchainStatus
);

router.get('/verify/:walletAddress', 
    identityController.verifyOnBlockchain
);

module.exports = router;