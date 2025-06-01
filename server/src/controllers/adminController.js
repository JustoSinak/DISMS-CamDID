const adminService = require('../services/adminService');
const { validationResult } = require('express-validator');

class AdminController {
    /**
     * Get system statistics
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getSystemStats(req, res) {
        try {
            const stats = await adminService.getSystemStats();
            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error getting system stats:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get system statistics'
            });
        }
    }

    /**
     * Get list of all admins
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getAllAdmins(req, res) {
        try {
            const admins = await adminService.getAllAdmins();
            res.json({
                success: true,
                data: admins
            });
        } catch (error) {
            console.error('Error getting admins:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get admin list'
            });
        }
    }

    /**
     * Add a new admin
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async addAdmin(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { address } = req.body;
            const result = await adminService.addAdmin(address);

            res.status(201).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Error adding admin:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to add admin'
            });
        }
    }

    /**
     * Remove an admin
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async removeAdmin(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { address } = req.params;
            const result = await adminService.removeAdmin(address);

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Error removing admin:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to remove admin'
            });
        }
    }

    /**
     * Get list of all issuers
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getAllIssuers(req, res) {
        try {
            const issuers = await adminService.getAllIssuers();
            res.json({
                success: true,
                data: issuers
            });
        } catch (error) {
            console.error('Error getting issuers:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get issuer list'
            });
        }
    }

    /**
     * Add a new issuer
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async addIssuer(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { address } = req.body;
            const result = await adminService.addIssuer(address);

            res.status(201).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Error adding issuer:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to add issuer'
            });
        }
    }

    /**
     * Remove an issuer
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async removeIssuer(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { address } = req.params;
            const result = await adminService.removeIssuer(address);

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Error removing issuer:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to remove issuer'
            });
        }
    }
}

module.exports = new AdminController(); 