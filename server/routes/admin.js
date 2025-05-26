const express = require('express');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Example admin-only route
router.get('/dashboard', authenticateToken, isAdmin, (req, res) => {
  res.json({
    success: true,
    message: 'Welcome, admin!',
    user: req.user
  });
});

module.exports = router;
