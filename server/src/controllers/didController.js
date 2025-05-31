const didService = require('../services/didService');
const { validationResult } = require('express-validator');

class DIDController {
    /**
     * Create a new DID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async createDID(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { userId } = req.body;
            const result = await didService.createDID(userId);

            res.status(201).json({
                success: true,
                data: {
                    did: result.didDocument.id,
                    document: result.didDocument,
                    transaction: result.transaction
                }
            });
        } catch (error) {
            console.error('DID creation error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create DID'
            });
        }
    }

    /**
     * Resolve a DID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async resolveDID(req, res) {
        try {
            const { did } = req.params;
            const document = await didService.resolveDID(did);

            res.json({
                success: true,
                data: document
            });
        } catch (error) {
            console.error('DID resolution error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to resolve DID'
            });
        }
    }

    /**
     * Update a DID Document
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async updateDID(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { did } = req.params;
            const updates = req.body;

            const result = await didService.updateDID(did, updates);

            res.json({
                success: true,
                data: {
                    did,
                    document: result,
                    transaction: result.transaction
                }
            });
        } catch (error) {
            console.error('DID update error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update DID'
            });
        }
    }

    /**
     * Deactivate a DID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async deactivateDID(req, res) {
        try {
            const { did } = req.params;
            const result = await didService.deactivateDID(did);

            res.json({
                success: true,
                data: {
                    did,
                    deactivated: true,
                    transaction: result.transaction
                }
            });
        } catch (error) {
            console.error('DID deactivation error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to deactivate DID'
            });
        }
    }
}

module.exports = new DIDController(); 