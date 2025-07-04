const Web3 = require('web3');
const AdminRegistry = require('../../../blockchain/build/contracts/AdminRegistry.json');
const config = require('../config');
const User = require('../models/User');
const DidDocument = require('../models/DidDocument');

class AdminService {
    constructor() {
        this.web3 = new Web3(config.blockchain.provider);
        this.contract = new this.web3.eth.Contract(
            AdminRegistry.abi,
            config.blockchain.adminRegistryAddress
        );
    }

    /**
     * Check if an address has admin privileges
     * @param {string} address - Ethereum address to check
     * @returns {Promise<boolean>} Whether the address has admin privileges
     */
    async isAdmin(address) {
        try {
            return await this.contract.methods.isAdmin(address).call();
        } catch (error) {
            console.error('Error checking admin status:', error);
            throw new Error('Failed to check admin status');
        }
    }

    /**
     * Add a new admin
     * @param {string} adminAddress - Address to grant admin privileges
     * @returns {Promise<Object>} Transaction result
     */
    async addAdmin(adminAddress) {
        try {
            const account = this.web3.eth.accounts.privateKeyToAccount(config.blockchain.privateKey);
            this.web3.eth.accounts.wallet.add(account);

            const tx = await this.contract.methods.addAdmin(adminAddress).send({
                from: account.address,
                gas: 500000
            });

            // Update user role in database
            await User.findOneAndUpdate(
                { walletAddress: adminAddress },
                { role: 'admin' },
                { new: true }
            );

            return {
                success: true,
                transaction: tx.transactionHash
            };
        } catch (error) {
            console.error('Error adding admin:', error);
            throw new Error('Failed to add admin');
        }
    }

    /**
     * Remove an admin
     * @param {string} adminAddress - Address to revoke admin privileges
     * @returns {Promise<Object>} Transaction result
     */
    async removeAdmin(adminAddress) {
        try {
            const account = this.web3.eth.accounts.privateKeyToAccount(config.blockchain.privateKey);
            this.web3.eth.accounts.wallet.add(account);

            const tx = await this.contract.methods.removeAdmin(adminAddress).send({
                from: account.address,
                gas: 500000
            });

            // Update user role in database
            await User.findOneAndUpdate(
                { walletAddress: adminAddress },
                { role: 'user' },
                { new: true }
            );

            return {
                success: true,
                transaction: tx.transactionHash
            };
        } catch (error) {
            console.error('Error removing admin:', error);
            throw new Error('Failed to remove admin');
        }
    }

    /**
     * Get system statistics
     * @returns {Promise<Object>} System statistics
     */
    async getSystemStats() {
        try {
            const [
                totalUsers,
                totalAdmins,
                totalIssuers,
                totalDIDs,
                activeDIDs
            ] = await Promise.all([
                User.countDocuments({ role: 'user' }),
                User.countDocuments({ role: 'admin' }),
                User.countDocuments({ role: 'issuer' }),
                DidDocument.countDocuments(),
                DidDocument.countDocuments({ active: true })
            ]);

            return {
                users: {
                    total: totalUsers,
                    admins: totalAdmins,
                    issuers: totalIssuers
                },
                dids: {
                    total: totalDIDs,
                    active: activeDIDs,
                    inactive: totalDIDs - activeDIDs
                }
            };
        } catch (error) {
            console.error('Error getting system stats:', error);
            throw new Error('Failed to get system statistics');
        }
    }

    /**
     * Get list of all admins
     * @returns {Promise<Array>} List of admin users
     */
    async getAllAdmins() {
        try {
            return await User.find({ role: { $in: ['admin', 'super_admin'] } })
                .select('-password')
                .lean();
        } catch (error) {
            console.error('Error getting admins:', error);
            throw new Error('Failed to get admin list');
        }
    }

    /**
     * Get list of all issuers
     * @returns {Promise<Array>} List of issuer users
     */
    async getAllIssuers() {
        try {
            return await User.find({ role: 'issuer' })
                .select('-password')
                .lean();
        } catch (error) {
            console.error('Error getting issuers:', error);
            throw new Error('Failed to get issuer list');
        }
    }

    /**
     * Add a new issuer
     * @param {string} issuerAddress - Address to grant issuer privileges
     * @returns {Promise<Object>} Transaction result
     */
    async addIssuer(issuerAddress) {
        try {
            const account = this.web3.eth.accounts.privateKeyToAccount(config.blockchain.privateKey);
            this.web3.eth.accounts.wallet.add(account);

            const tx = await this.contract.methods.addIssuer(issuerAddress).send({
                from: account.address,
                gas: 500000
            });

            // Update user role in database
            await User.findOneAndUpdate(
                { walletAddress: issuerAddress },
                { role: 'issuer' },
                { new: true }
            );

            return {
                success: true,
                transaction: tx.transactionHash
            };
        } catch (error) {
            console.error('Error adding issuer:', error);
            throw new Error('Failed to add issuer');
        }
    }

    /**
     * Remove an issuer
     * @param {string} issuerAddress - Address to revoke issuer privileges
     * @returns {Promise<Object>} Transaction result
     */
    async removeIssuer(issuerAddress) {
        try {
            const account = this.web3.eth.accounts.privateKeyToAccount(config.blockchain.privateKey);
            this.web3.eth.accounts.wallet.add(account);

            const tx = await this.contract.methods.removeIssuer(issuerAddress).send({
                from: account.address,
                gas: 500000
            });

            // Update user role in database
            await User.findOneAndUpdate(
                { walletAddress: issuerAddress },
                { role: 'user' },
                { new: true }
            );

            return {
                success: true,
                transaction: tx.transactionHash
            };
        } catch (error) {
            console.error('Error removing issuer:', error);
            throw new Error('Failed to remove issuer');
        }
    }
}

module.exports = new AdminService(); 