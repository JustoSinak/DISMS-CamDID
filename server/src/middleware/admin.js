const adminService = require('../services/adminService');

/**
 * Middleware to check if the user has admin privileges
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
async function adminMiddleware(req, res, next) {
    try {
        // Check if user exists and has a wallet address
        if (!req.user || !req.user.walletAddress) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized - User not authenticated'
            });
        }

        // Check if user has admin privileges on the blockchain
        const isAdmin = await adminService.isAdmin(req.user.walletAddress);
        
        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden - User does not have admin privileges'
            });
        }

        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error checking admin privileges'
        });
    }
}

module.exports = adminMiddleware; 