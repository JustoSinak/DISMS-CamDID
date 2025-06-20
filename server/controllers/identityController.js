// controllers/identityController.js
const Identity = require('../models/Identity');
const User = require('../models/User');
const crypto = require('crypto');
const Web3 = require('web3');
const { create } = require('ipfs-http-client');
const identityService = require('../services/identityService');
const { uploadToIPFS } = require('../utils/ipfs');

// Initialize IPFS client
const ipfs = create({ host: 'localhost', port: 5001, protocol: 'http' });

// Initialize Web3 (replace with your Ethereum provider)
const web3 = new Web3(process.env.ETHEREUM_PROVIDER || 'http://localhost:8545');

// Contract ABIs and addresses (these should be loaded from deployment artifacts)
const identityRegistryABI = require('../contracts/IdentityRegistry.json').abi;
const credentialVerifierABI = require('../contracts/CredentialVerifier.json').abi;

const identityRegistryAddress = process.env.IDENTITY_REGISTRY_ADDRESS;
const credentialVerifierAddress = process.env.CREDENTIAL_VERIFIER_ADDRESS;

const identityRegistryContract = new web3.eth.Contract(identityRegistryABI, identityRegistryAddress);
const credentialVerifierContract = new web3.eth.Contract(credentialVerifierABI, credentialVerifierAddress);

// Utility function to hash identity data
const hashIdentityData = (data) => {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
};

// Create Identity
exports.createIdentity = async (req, res) => {
    try {
        const { userId } = req.user; // From auth middleware
        const { governmentId } = req.body;

        // Upload government ID document to IPFS
        const documentImage = await uploadToIPFS(governmentId.image);

<<<<<<< HEAD
        // Off-chain ID verification before proceeding
        const issuerServiceUrl = process.env.ISSUER_SERVICE_URL || 'http://localhost:3000/api/issuer/verify-id';
        const axios = require('axios');
        const verificationResponse = await axios.post(issuerServiceUrl, {
            userId,
            personalInfo,
            idDocumentScan: req.body.idDocumentScan,
            biometricData: req.body.biometricData
        });

        if (!verificationResponse.data.success) {
            return res.status(400).json({
                success: false,
                message: 'ID verification failed'
            });
        }

        // Check if user already has an identity
        const existingIdentity = await Identity.findOne({ userId });
        if (existingIdentity) {
            return res.status(400).json({
                success: false,
                message: 'Identity already exists for this user'
            });
        }

        // Prepare identity data for IPFS storage
        const identityData = {
            personalInfo: {
                firstName: personalInfo.firstName,
                lastName: personalInfo.lastName,
                dateOfBirth: personalInfo.dateOfBirth,
                nationality: personalInfo.nationality,
                // Store encrypted sensitive data
                encryptedPhone: personalInfo.phone ? encrypt(personalInfo.phone) : null,
                encryptedEmail: personalInfo.email ? encrypt(personalInfo.email) : null,
                encryptedAddress: personalInfo.address ? encrypt(JSON.stringify(personalInfo.address)) : null
            },
            attributes: attributes || [],
            metadata: {
                createdAt: new Date().toISOString(),
                version: '1.0'
            }
        };

        // Store identity data on IPFS
        const ipfsResult = await ipfs.add(JSON.stringify(identityData));
        const metadataURI = ipfsResult.path;

        // Create identity hash
        const identityHash = '0x' + hashIdentityData({
            walletAddress,
            personalInfo: personalInfo,
            timestamp: Date.now()
        });

        // Prepare blockchain transaction data
        const transactionData = {
            identityHash,
            metadataURI,
            walletAddress
        };

        // Store identity in MongoDB
        const newIdentity = new Identity({
            userId,
            walletAddress,
            identityHash,
            metadataURI,
            personalInfo: {
                firstName: personalInfo.firstName,
                lastName: personalInfo.lastName,
                dateOfBirth: personalInfo.dateOfBirth,
                nationality: personalInfo.nationality
            },
            attributes: attributes || [],
            blockchainStatus: 'pending',
            isActive: true
        });

        await newIdentity.save();

        // Update user record
        await User.findByIdAndUpdate(userId, {
            hasIdentity: true,
            walletAddress: walletAddress
=======
        const identity = await identityService.createIdentity(userId, {
            type: governmentId.type,
            number: governmentId.number,
            image: documentImage
>>>>>>> e3fdf641ea7b2b8f08f4fbd182df61170edcd336
        });

        res.status(201).json({
            success: true,
            data: {
                identityId: identity._id,
                did: identity.did,
                status: identity.status
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.verifyGovernmentId = async (req, res) => {
    try {
        const { identityId } = req.params;
        const { verificationData } = req.body;

        const result = await identityService.verifyGovernmentId(
            identityId,
            verificationData
        );

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.setupBiometrics = async (req, res) => {
    try {
        const { identityId } = req.params;
        const { biometricData } = req.body;

        const identity = await identityService.setupBiometrics(
            identityId,
            biometricData
        );

        res.json({
            success: true,
            data: {
                identityId: identity._id,
                biometrics: {
                    fingerprint: identity.biometrics.fingerprint.verified,
                    facial: identity.biometrics.facial.verified,
                    voice: identity.biometrics.voice.verified
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.verifyContactInfo = async (req, res) => {
    try {
        const { identityId } = req.params;
        const { contactData } = req.body;

        const identity = await identityService.verifyContactInfo(
            identityId,
            contactData
        );

        res.json({
            success: true,
            data: {
                identityId: identity._id,
                contactInfo: {
                    phone: identity.contactInfo.phone.verified,
                    email: identity.contactInfo.email.verified,
                    address: identity.contactInfo.address.verified
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.finalizeIdentity = async (req, res) => {
    try {
        const { identityId } = req.params;

        const identity = await identityService.finalizeIdentity(identityId);

        res.json({
            success: true,
            data: {
                identityId: identity._id,
                did: identity.did,
                status: identity.status,
                verificationLevel: identity.verificationLevel,
                merkleRoot: identity.merkleRoot
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.getIdentity = async (req, res) => {
    try {
        const { identityId } = req.params;

        const identity = await identityService.getIdentity(identityId);

        res.json({
            success: true,
            data: {
                identityId: identity._id,
                did: identity.did,
                status: identity.status,
                verificationLevel: identity.verificationLevel,
                governmentId: {
                    type: identity.governmentId.documentType,
                    verificationStatus: identity.governmentId.verificationStatus
                },
                biometrics: {
                    fingerprint: identity.biometrics.fingerprint.verified,
                    facial: identity.biometrics.facial.verified,
                    voice: identity.biometrics.voice.verified
                },
                contactInfo: {
                    phone: identity.contactInfo.phone.verified,
                    email: identity.contactInfo.email.verified,
                    address: identity.contactInfo.address.verified
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Add Identity Attribute
exports.addAttribute = async (req, res) => {
    try {
        const userId = req.user.id;
        const { attributeType, attributeValue, isPrivate = true } = req.body;

        if (!attributeType || !attributeValue) {
            return res.status(400).json({
                success: false,
                message: 'Attribute type and value are required'
            });
        }

        const identity = await Identity.findOne({ userId });
        if (!identity) {
            return res.status(404).json({
                success: false,
                message: 'Identity not found'
            });
        }

        // Create attribute hash
        const attributeHash = '0x' + crypto
            .createHash('sha256')
            .update(attributeValue.toString())
            .digest('hex');

        // Prepare attribute data
        const attributeData = {
            type: attributeType,
            hash: attributeHash,
            value: isPrivate ? encrypt(attributeValue) : attributeValue,
            isPrivate,
            verified: false,
            addedAt: new Date()
        };

        // Add to identity attributes array
        identity.attributes.push(attributeData);
        await identity.save();

        res.status(200).json({
            success: true,
            message: 'Attribute added successfully',
            data: {
                attributeType,
                attributeHash,
                isPrivate
            }
        });

    } catch (error) {
        console.error('Add attribute error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add attribute',
            error: error.message
        });
    }
};

// Update Blockchain Status
exports.updateBlockchainStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { transactionHash, status } = req.body;

        const identity = await Identity.findOne({ userId });
        if (!identity) {
            return res.status(404).json({
                success: false,
                message: 'Identity not found'
            });
        }

        identity.blockchainStatus = status;
        if (transactionHash) {
            identity.transactionHash = transactionHash;
        }

        await identity.save();

        res.status(200).json({
            success: true,
            message: 'Blockchain status updated',
            data: {
                status,
                transactionHash
            }
        });

    } catch (error) {
        console.error('Update blockchain status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update blockchain status',
            error: error.message
        });
    }
};

// Verify Identity on Blockchain
exports.verifyOnBlockchain = async (req, res) => {
    try {
        const { walletAddress } = req.params;

        // Query the blockchain to verify identity
        const blockchainIdentity = await identityRegistryContract.methods
            .getIdentity(walletAddress)
            .call();

        if (!blockchainIdentity.active) {
            return res.status(404).json({
                success: false,
                message: 'Identity not found on blockchain'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                identityHash: blockchainIdentity.identityHash,
                metadataURI: blockchainIdentity.metadataURI,
                active: blockchainIdentity.active,
                createdAt: blockchainIdentity.createdAt,
                updatedAt: blockchainIdentity.updatedAt
            }
        });

    } catch (error) {
        console.error('Verify blockchain identity error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify identity on blockchain',
            error: error.message
        });
    }
};

// Utility function for encryption (implement based on your security requirements)
function encrypt(text) {
    const algorithm = 'aes-256-cbc';
    const key = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return encrypted;
}