const Identity = require('../models/identity');
const crypto = require('crypto');
const { ethers } = require('ethers');
const { createMerkleTree } = require('../utils/merkleTree');
const { encryptData, decryptData } = require('../utils/encryption');
const { uploadToIPFS } = require('../utils/ipfs');
const { generateDID } = require('../utils/did');

class IdentityService {
  async createIdentity(userId, governmentIdData) {
    try {
      // Generate HD wallet
      const wallet = ethers.Wallet.createRandom();
      const recoveryPhrase = wallet.mnemonic.phrase;
      
      // Derive keys using BIP32
      const masterSeed = wallet.privateKey;
      const identityKey = this.deriveKey(masterSeed, "m/44'/60'/0'/0/0");
      const documentKey = this.deriveKey(masterSeed, "m/44'/60'/0'/1/0");
      const sharingKey = this.deriveKey(masterSeed, "m/44'/60'/0'/2/0");

      // Encrypt sensitive data
      const encryptedKeys = {
        masterSeed: await encryptData(masterSeed),
        identityKey: await encryptData(identityKey),
        documentKey: await encryptData(documentKey),
        sharingKey: await encryptData(sharingKey),
        recoveryPhrase: await encryptData(recoveryPhrase)
      };

      // Generate DID
      const did = await generateDID(wallet.address);

      // Create initial identity document
      const identity = new Identity({
        userId,
        did,
        governmentId: {
          documentType: governmentIdData.type,
          documentNumber: governmentIdData.number,
          documentImage: await uploadToIPFS(governmentIdData.image)
        },
        cryptographicKeys: encryptedKeys,
        status: 'pending'
      });

      await identity.save();
      return identity;
    } catch (error) {
      throw new Error(`Failed to create identity: ${error.message}`);
    }
  }

  async verifyGovernmentId(identityId, verificationData) {
    try {
      const identity = await Identity.findById(identityId);
      if (!identity) {
        throw new Error('Identity not found');
      }

      // Verify document through government API
      const verificationResult = await this.verifyWithGovernmentAPI(
        identity.governmentId.documentNumber,
        verificationData
      );

      if (verificationResult.verified) {
        identity.governmentId.verificationStatus = 'verified';
        identity.governmentId.verifiedAt = new Date();
        identity.verificationLevel = 'basic';
        await identity.save();
      }

      return verificationResult;
    } catch (error) {
      throw new Error(`Failed to verify government ID: ${error.message}`);
    }
  }

  async setupBiometrics(identityId, biometricData) {
    try {
      const identity = await Identity.findById(identityId);
      if (!identity) {
        throw new Error('Identity not found');
      }

      // Process and encrypt biometric templates
      if (biometricData.fingerprint) {
        identity.biometrics.fingerprint = {
          template: await encryptData(biometricData.fingerprint),
          verified: true,
          verifiedAt: new Date()
        };
      }

      if (biometricData.facial) {
        identity.biometrics.facial = {
          template: await encryptData(biometricData.facial),
          verified: true,
          verifiedAt: new Date()
        };
      }

      if (biometricData.voice) {
        identity.biometrics.voice = {
          template: await encryptData(biometricData.voice),
          verified: true,
          verifiedAt: new Date()
        };
      }

      await identity.save();
      return identity;
    } catch (error) {
      throw new Error(`Failed to setup biometrics: ${error.message}`);
    }
  }

  async verifyContactInfo(identityId, contactData) {
    try {
      const identity = await Identity.findById(identityId);
      if (!identity) {
        throw new Error('Identity not found');
      }

      if (contactData.phone) {
        // Verify phone number through SMS OTP
        const phoneVerified = await this.verifyPhoneNumber(contactData.phone);
        if (phoneVerified) {
          identity.contactInfo.phone = {
            number: contactData.phone,
            verified: true,
            verifiedAt: new Date()
          };
        }
      }

      if (contactData.email) {
        // Verify email through confirmation link
        const emailVerified = await this.verifyEmail(contactData.email);
        if (emailVerified) {
          identity.contactInfo.email = {
            address: contactData.email,
            verified: true,
            verifiedAt: new Date()
          };
        }
      }

      if (contactData.address) {
        // Verify address through utility bills or bank statements
        const addressVerified = await this.verifyAddress(contactData.address);
        if (addressVerified) {
          identity.contactInfo.address = {
            ...contactData.address,
            verified: true,
            verifiedAt: new Date()
          };
        }
      }

      await identity.save();
      return identity;
    } catch (error) {
      throw new Error(`Failed to verify contact info: ${error.message}`);
    }
  }

  async finalizeIdentity(identityId) {
    try {
      const identity = await Identity.findById(identityId);
      if (!identity) {
        throw new Error('Identity not found');
      }

      // Create Merkle tree from identity claims
      const claims = this.gatherIdentityClaims(identity);
      const merkleTree = await createMerkleTree(claims);
      identity.merkleRoot = merkleTree.getRoot();

      // Create and issue base credentials
      await this.issueBaseCredentials(identity);

      // Update identity status
      identity.status = 'verified';
      identity.verificationLevel = 'advanced';
      await identity.save();

      return identity;
    } catch (error) {
      throw new Error(`Failed to finalize identity: ${error.message}`);
    }
  }

  // Helper methods
  deriveKey(masterSeed, path) {
    // Implement BIP32 key derivation
    return crypto.createHash('sha256')
      .update(masterSeed + path)
      .digest('hex');
  }

  gatherIdentityClaims(identity) {
    // Gather all verifiable claims from the identity
    const claims = [];
    
    if (identity.governmentId.verificationStatus === 'verified') {
      claims.push({
        type: 'government_id',
        value: identity.governmentId.documentNumber,
        verified: true
      });
    }

    // Add other claims from biometrics and contact info
    // ...

    return claims;
  }

  async issueBaseCredentials(identity) {
    // Issue base credentials based on verified information
    const credentials = [];

    if (identity.governmentId.verificationStatus === 'verified') {
      credentials.push({
        type: 'government_id',
        status: 'active',
        issuedAt: new Date(),
        metadata: {
          documentType: identity.governmentId.documentType,
          documentNumber: identity.governmentId.documentNumber
        }
      });
    }

    // Add other credentials based on verified information
    // ...

    identity.credentials = credentials;
  }

  // Mock methods for external service integration
  async verifyWithGovernmentAPI(documentNumber, verificationData) {
    // Implement actual government API integration
    return { verified: true };
  }

  async verifyPhoneNumber(phoneNumber) {
    // Implement SMS OTP verification
    return true;
  }

  async verifyEmail(email) {
    // Implement email verification
    return true;
  }

  async verifyAddress(address) {
    // Implement address verification
    return true;
  }
}

module.exports = new IdentityService(); 