// controllers/identityController.js
const Identity = require('../models/Identity');
const User = require('../models/User');
const crypto = require('crypto');
const Web3 = require('web3');

const identityService = require('../services/identityService');
const { uploadToIPFS, getIpfsClient } = require('../utils/ipfs');
const UserCredential = require('../models/UserCredential');
const { validationResult } = require('express-validator');

// Initialize IPFS client
// const ipfs = create({ host: 'localhost', port: 5001, protocol: 'http' });    


// Initialize Web3 (replace with your Ethereum provider)
const web3 = new Web3(process.env.ETHEREUM_PROVIDER || 'http://localhost:8545');

// Contract ABIs and addresses (these should be loaded from deployment artifacts)
const identityRegistryABI = require('../../blockchain/build/contracts/IdentityRegistry.json').abi;
const credentialVerifierABI = require('../../blockchain/build/contracts/CredentialVerifier.json').abi;

const identityRegistryAddress = process.env.IDENTITY_REGISTRY_ADDRESS;
const credentialVerifierAddress = process.env.CREDENTIAL_VERIFIER_ADDRESS;

const identityRegistryContract = new web3.eth.Contract(identityRegistryABI, identityRegistryAddress);
const credentialVerifierContract = new web3.eth.Contract(credentialVerifierABI, credentialVerifierAddress);

// DID Versioning
const DIDRegistryABI = require('../../blockchain/build/contracts/DIDRegistry.json').abi;
const didRegistryAddress = process.env.DID_REGISTRY_ADDRESS;
const didRegistry = new web3.eth.Contract(DIDRegistryABI, didRegistryAddress);

// Utility function to hash identity data
const hashIdentityData = (data) => {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
};

// @desc    Create new identity
// @route   POST /api/identity/create
// @access  Private
const createIdentity = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { userId, formData, didDocument, biometricSetup, recoveryPhrase } = req.body;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if identity already exists for this user
        const existingIdentity = await UserCredential.findOne({ userId });
        if (existingIdentity) {
            return res.status(400).json({
                success: false,
                message: 'Identity already exists for this user'
            });
        }

        // Create new identity
        const identity = await UserCredential.create({
            userId,
            documents: [
                {
                    type: 'national_id',
                    documentHash: formData.nationalIdNumber,
                    verified: false
                }
            ],
            verificationStatus: 'pending',
            biometrics: biometricSetup,
            cryptographicKeys: {
                recoveryPhrase: recoveryPhrase // In production, this should be encrypted
            },
            did: didDocument?.id || null
        });

        res.status(201).json({
            success: true,
            message: 'Identity created successfully',
            identity: {
                id: identity._id,
                userId: identity.userId,
                verificationStatus: identity.verificationStatus,
                did: identity.did
            }
        });
    } catch (error) {
        console.error('Identity creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error in identity creation'
        });
    }
};

// @desc    Get identity details
// @route   GET /api/identity/:id
// @access  Private
const getIdentity = async (req, res) => {
    try {
        const { id } = req.params;
        const identity = await UserCredential.findById(id).populate('userId', 'profile.firstName profile.lastName email');

        if (!identity) {
            return res.status(404).json({
                success: false,
                message: 'Identity not found'
            });
        }

        res.json({
            success: true,
            identity: {
                id: identity._id,
                userId: identity.userId,
                verificationStatus: identity.verificationStatus,
                did: identity.did,
                documents: identity.documents,
                biometrics: identity.biometrics,
                createdAt: identity.createdAt
            }
        });
    } catch (error) {
        console.error('Get identity error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving identity'
        });
    }
};

// @desc    Update identity
// @route   PUT /api/identity/:id
// @access  Private
const updateIdentity = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const identity = await UserCredential.findByIdAndUpdate(
            id,
            { ...updateData, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!identity) {
            return res.status(404).json({
                success: false,
                message: 'Identity not found'
            });
        }

        res.json({
            success: true,
            message: 'Identity updated successfully',
            identity: {
                id: identity._id,
                userId: identity.userId,
                verificationStatus: identity.verificationStatus,
                did: identity.did,
                updatedAt: identity.updatedAt
            }
        });
    } catch (error) {
        console.error('Update identity error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating identity'
        });
    }
};

// @desc    Verify identity documents
// @route   POST /api/identity/verify
// @access  Private
const verifyIdentity = async (req, res) => {
    try {
        const { identityId, documentType, verificationResult } = req.body;

        const identity = await UserCredential.findById(identityId);
        if (!identity) {
            return res.status(404).json({
                success: false,
                message: 'Identity not found'
            });
        }

        // Update document verification status
        const document = identity.documents.find(doc => doc.type === documentType);
        if (document) {
            document.verified = verificationResult;
            document.verifiedAt = Date.now();
        }

        // Update overall verification status
        const allDocumentsVerified = identity.documents.every(doc => doc.verified);
        if (allDocumentsVerified) {
            identity.verificationStatus = 'verified';
        }

        await identity.save();

        res.json({
            success: true,
            message: 'Identity verification updated',
            verificationStatus: identity.verificationStatus
        });
    } catch (error) {
        console.error('Verify identity error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying identity'
        });
    }
};

// @desc    Get verification status
// @route   GET /api/identity/verification-status/:id
// @access  Private
const getVerificationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const identity = await UserCredential.findById(id);

        if (!identity) {
            return res.status(404).json({
                success: false,
                message: 'Identity not found'
            });
        }

        res.json({
            success: true,
            verificationStatus: identity.verificationStatus,
            documents: identity.documents.map(doc => ({
                type: doc.type,
                verified: doc.verified,
                verifiedAt: doc.verifiedAt
            }))
        });
    } catch (error) {
        console.error('Get verification status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving verification status'
        });
    }
};

const verifyGovernmentId = async (req, res) => {
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

const setupBiometrics = async (req, res) => {
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

const verifyContactInfo = async (req, res) => {
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

const finalizeIdentity = async (req, res) => {
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

const getDIDVersionCount = async (req, res) => {
  try {
    const { did } = req.params;
    const count = await didRegistry.methods.getDIDVersionCount(did).call();
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching DID version count', error: error.message });
  }
};

const getDIDVersion = async (req, res) => {
  try {
    const { did, version } = req.params;
    const doc = await didRegistry.methods.getDIDVersion(did, version).call();
    res.json({ success: true, document: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching DID version', error: error.message });
  }
};

const deleteIdentity = async (req, res) => {
    try {
        const { identityId } = req.params;
        const identity = await UserCredential.findById(identityId);

        if (!identity) {
            return res.status(404).json({
                success: false,
                message: 'Identity not found'
            });
        }

        await UserCredential.findByIdAndDelete(identityId);

        res.status(200).json({
            success: true,
            message: 'Identity deleted successfully'
        });
    } catch (error) {
        console.error('Delete identity error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete identity',
            error: error.message
        });
    }
};

module.exports = {
    createIdentity,
    getIdentity,
    updateIdentity,
    verifyIdentity,
    getVerificationStatus,
    verifyGovernmentId,
    setupBiometrics,
    verifyContactInfo,
    finalizeIdentity,
    deleteIdentity,
    getDIDVersionCount,
    getDIDVersion
};
