const Credential = require('../models/Credential');
const crypto = require('crypto');
const { decryptCredential } = require('../services/cryptoService');
const { createIdentity, issueCredential, getIdentityStatus, getCredentialStatus } = require('../services/web3Service');
const { config } = require('../config');

// Helper function to convert string to bytes32
function stringToBytes32(str) {
  return web3.utils.padRight(web3.utils.utf8ToHex(str), 64);
}

// Helper function to convert bytes32 to string
function bytes32ToString(bytes32) {
  return web3.utils.hexToUtf8(bytes32);
}

// Issue a new credential
exports.issueCredential = async (req, res) => {
  try {
    const {
      did,
      type,
      issuer,
      subject,
      encryptedData,
      encryptionKey,
      metadata
    } = req.body;

    // Validate required fields
    if (!did || !type || !issuer || !subject || !encryptedData || !encryptionKey) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if identity exists on blockchain
    const identityStatus = await getIdentityStatus(stringToBytes32(did));
    if (!identityStatus.exists) {
      // Create identity on blockchain if it doesn't exist
      await createIdentity(stringToBytes32(did));
    }

    // Generate a unique credential ID
    const credentialId = crypto.randomBytes(32).toString('hex');

    // Issue credential on blockchain
    await issueCredential(
      stringToBytes32(did),
      stringToBytes32(credentialId),
      stringToBytes32(issuer),
      stringToBytes32(subject)
    );

    // Create the credential in database
    const credential = new Credential({
      _id: credentialId,
      did,
      type,
      issuer,
      subject,
      encryptedData,
      encryptionKey,
      metadata
    });

    await credential.save();

    res.status(201).json({
      success: true,
      credential: {
        id: credentialId,
        type,
        issuer,
        subject,
        status: 'active',
        issuedAt: credential.issuedAt,
        metadata
      }
    });

    // Emit event for blockchain synchronization
    credentialContract.methods.emitCredentialIssued(
      did,
      credentialId,
      issuer,
      subject
    ).send({
      from: config.blockchain.ownerAddress,
      gas: 3000000
    });

  } catch (error) {
    console.error('Error issuing credential:', error);
    res.status(500).json({
      success: false,
      message: 'Error issuing credential',
      error: error.message
    });
  }
};

// Get credential by ID
exports.getCredential = async (req, res) => {
  try {
    const { credentialId } = req.params;
    const { encryptionKey } = req.query;

    if (!encryptionKey) {
      return res.status(400).json({
        success: false,
        message: 'Encryption key is required'
      });
    }

    const credential = await Credential.findById(credentialId);

    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credential not found'
      });
    }

    // Decrypt the credential data
    const decryptedData = await decryptCredential(
      credential.encryptedData,
      encryptionKey
    );

    res.json({
      success: true,
      credential: {
        ...credential.toObject(),
        data: decryptedData,
        encryptionKey: null // Don't return the encryption key
      }
    });
  } catch (error) {
    console.error('Error getting credential:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting credential',
      error: error.message
    });
  }
};

// Get all credentials for a DID
exports.getCredentialsByDid = async (req, res) => {
  try {
    const { did } = req.params;
    const { encryptionKey } = req.query;

    if (!encryptionKey) {
      return res.status(400).json({
        success: false,
        message: 'Encryption key is required'
      });
    }

    const credentials = await Credential.find({ did });

    // Decrypt all credentials
    const decryptedCredentials = await Promise.all(
      credentials.map(async (credential) => {
        const decryptedData = await decryptCredential(
          credential.encryptedData,
          encryptionKey
        );
        return {
          ...credential.toObject(),
          data: decryptedData,
          encryptionKey: null // Don't return the encryption key
        };
      })
    );

    res.json({
      success: true,
      credentials: decryptedCredentials
    });
  } catch (error) {
    console.error('Error getting credentials:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting credentials',
      error: error.message
    });
  }
};

// Revoke a credential
exports.revokeCredential = async (req, res) => {
  try {
    const { credentialId } = req.params;

    const credential = await Credential.findByIdAndUpdate(
      credentialId,
      {
        status: 'revoked',
        revokedAt: new Date()
      },
      { new: true }
    );

    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credential not found'
      });
    }

    res.json({
      success: true,
      message: 'Credential revoked successfully',
      credential
    });
  } catch (error) {
    console.error('Error revoking credential:', error);
    res.status(500).json({
      success: false,
      message: 'Error revoking credential',
      error: error.message
    });
  }
};

// Verify a credential
exports.verifyCredential = async (req, res) => {
  try {
    const { credentialId } = req.params;
    const { encryptionKey } = req.query;

    if (!encryptionKey) {
      return res.status(400).json({
        success: false,
        message: 'Encryption key is required'
      });
    }

    const credential = await Credential.findById(credentialId);

    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credential not found'
      });
    }

    // Verify the signature and encryption key
    const isValid = await verifyCredentialSignature(
      credential.encryptedData,
      credential.encryptionKey,
      encryptionKey
    );

    res.json({
      success: true,
      verification: {
        valid: isValid,
        status: credential.status,
        revokedAt: credential.revokedAt
      }
    });
  } catch (error) {
    console.error('Error verifying credential:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying credential',
      error: error.message
    });
  }
};
