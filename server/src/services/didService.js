const Web3 = require('web3');
const { v4: uuidv4 } = require('uuid');
const crypto = require('../utils/crypto');
const DIDRegistry = require('../../blockchain/build/contracts/DIDRegistry.json');
const config = require('../config');

class DIDService {
    constructor() {
        this.web3 = new Web3(config.blockchain.provider);
        this.contract = new this.web3.eth.Contract(
            DIDRegistry.abi,
            config.blockchain.didRegistryAddress
        );
    }

    /**
     * Create a new DID for a user
     * @param {string} userId - User's ID
     * @param {Object} publicKey - User's public key
     * @returns {Promise<Object>} The created DID document
     */
    async createDID(userId) {
        try {
            // Generate DID
            const did = `did:disms:${uuidv4()}`;
            
            // Generate key pair for DID
            const keyPair = await crypto.generateKeyPair();
            
            // Create DID Document
            const didDocument = {
                id: did,
                publicKey: [{
                    id: `${did}#keys-1`,
                    type: 'Secp256k1VerificationKey2018',
                    controller: did,
                    publicKeyHex: keyPair.publicKey
                }],
                authentication: [`${did}#keys-1`],
                service: [{
                    id: `${did}#identity-service`,
                    type: 'IdentityService',
                    serviceEndpoint: config.app.apiUrl
                }]
            };

            // Register DID on blockchain
            const account = this.web3.eth.accounts.privateKeyToAccount(config.blockchain.privateKey);
            this.web3.eth.accounts.wallet.add(account);

            const tx = await this.contract.methods.createDID(
                did,
                keyPair.publicKey,
                `${did}#keys-1`,
                config.app.apiUrl
            ).send({
                from: account.address,
                gas: 500000
            });

            return {
                didDocument,
                transaction: tx.transactionHash,
                privateKey: keyPair.privateKey // Should be securely transmitted to the user
            };
        } catch (error) {
            console.error('Error creating DID:', error);
            throw new Error('Failed to create DID');
        }
    }

    /**
     * Resolve a DID to get its DID Document
     * @param {string} did - The DID to resolve
     * @returns {Promise<Object>} The resolved DID document
     */
    async resolveDID(did) {
        try {
            const result = await this.contract.methods.resolveDID(did).call();
            
            return {
                id: did,
                controller: result.owner,
                publicKey: [{
                    id: result.authenticationKey,
                    type: 'Secp256k1VerificationKey2018',
                    controller: did,
                    publicKeyHex: result.publicKey
                }],
                authentication: [result.authenticationKey],
                service: [{
                    id: `${did}#identity-service`,
                    type: 'IdentityService',
                    serviceEndpoint: result.serviceEndpoint
                }],
                created: new Date(result.created * 1000).toISOString(),
                updated: new Date(result.updated * 1000).toISOString(),
                active: result.active
            };
        } catch (error) {
            console.error('Error resolving DID:', error);
            throw new Error('Failed to resolve DID');
        }
    }

    /**
     * Update a DID Document
     * @param {string} did - The DID to update
     * @param {Object} updates - The updates to apply
     * @returns {Promise<Object>} The updated DID document
     */
    async updateDID(did, updates) {
        try {
            const account = this.web3.eth.accounts.privateKeyToAccount(config.blockchain.privateKey);
            this.web3.eth.accounts.wallet.add(account);

            const tx = await this.contract.methods.updateDID(
                did,
                updates.publicKey,
                updates.authenticationKey,
                updates.serviceEndpoint
            ).send({
                from: account.address,
                gas: 500000
            });

            return {
                transaction: tx.transactionHash,
                ...await this.resolveDID(did)
            };
        } catch (error) {
            console.error('Error updating DID:', error);
            throw new Error('Failed to update DID');
        }
    }

    /**
     * Deactivate a DID
     * @param {string} did - The DID to deactivate
     * @returns {Promise<Object>} The transaction result
     */
    async deactivateDID(did) {
        try {
            const account = this.web3.eth.accounts.privateKeyToAccount(config.blockchain.privateKey);
            this.web3.eth.accounts.wallet.add(account);

            const tx = await this.contract.methods.deactivateDID(did).send({
                from: account.address,
                gas: 500000
            });

            return {
                transaction: tx.transactionHash,
                deactivated: true
            };
        } catch (error) {
            console.error('Error deactivating DID:', error);
            throw new Error('Failed to deactivate DID');
        }
    }
}

module.exports = new DIDService(); 