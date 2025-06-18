const Credential = require('../models/Credential');
const { uploadToIPFS, getFromIPFS } = require('../utils/ipfs');
const { encryptData, decryptData } = require('../utils/encryption');
const { createMerkleTree } = require('../utils/merkleTree');
const { registerCredentialOnChain } = require('../utils/did');

class CredentialService {
  async createCredential(identityId, credentialData) {
    try {
      // Encrypt document if provided
      let documentData = null;
      if (credentialData.document) {
        const encryptedDoc = await encryptData(credentialData.document);
        documentData = {
          ipfsHash: await uploadToIPFS(encryptedDoc),
          encryptionKey: await encryptData(credentialData.documentKey),
          mimeType: credentialData.document.mimeType,
          size: credentialData.document.size
        };
      }

      // Create credential
      const credential = new Credential({
        identityId,
        type: credentialData.type,
        category: credentialData.category,
        issuer: credentialData.issuer,
        metadata: {
          title: credentialData.title,
          description: credentialData.description,
          issueDate: new Date(),
          expirationDate: credentialData.expirationDate,
          attributes: credentialData.attributes
        },
        document: documentData,
        sharing: {
          accessControl: credentialData.accessControl || 'private'
        }
      });

      // Create Merkle tree for credential
      const merkleTree = await createMerkleTree([
        credential.metadata,
        credential.document?.ipfsHash
      ]);

      // Register on blockchain
      const blockchainData = await registerCredentialOnChain(
        credential._id,
        merkleTree.getRoot()
      );

      credential.blockchain = {
        transactionHash: blockchainData.transactionHash,
        blockNumber: blockchainData.blockNumber,
        merkleRoot: merkleTree.getRoot(),
        merkleProof: merkleTree.getProof(credential.metadata)
      };

      await credential.save();
      return credential;
    } catch (error) {
      throw new Error(`Failed to create credential: ${error.message}`);
    }
  }

  async getCredentials(identityId, filters = {}) {
    try {
      const query = { identityId, ...filters };
      const credentials = await Credential.find(query)
        .sort({ 'metadata.issueDate': -1 });

      return credentials.map(cred => ({
        id: cred._id,
        type: cred.type,
        category: cred.category,
        status: cred.status,
        metadata: {
          title: cred.metadata.title,
          description: cred.metadata.description,
          issueDate: cred.metadata.issueDate,
          expirationDate: cred.metadata.expirationDate,
          attributes: cred.metadata.attributes.filter(attr => !attr.isPrivate)
        },
        issuer: cred.issuer,
        verification: {
          status: cred.verification.verificationStatus,
          lastVerified: cred.verification.lastVerified
        }
      }));
    } catch (error) {
      throw new Error(`Failed to get credentials: ${error.message}`);
    }
  }

  async shareCredential(credentialId, sharingData) {
    try {
      const credential = await Credential.findById(credentialId);
      if (!credential) {
        throw new Error('Credential not found');
      }

      // Add viewer to allowed viewers
      credential.sharing.allowedViewers.push({
        did: sharingData.viewerDid,
        permissions: sharingData.permissions,
        expiresAt: sharingData.expiresAt
      });

      // Record sharing activity
      credential.sharing.sharingHistory.push({
        viewerDid: sharingData.viewerDid,
        timestamp: new Date(),
        purpose: sharingData.purpose,
        attributes: sharingData.attributes
      });

      await credential.save();
      return credential;
    } catch (error) {
      throw new Error(`Failed to share credential: ${error.message}`);
    }
  }

  async verifyCredential(credentialId, verificationData) {
    try {
      const credential = await Credential.findById(credentialId);
      if (!credential) {
        throw new Error('Credential not found');
      }

      // Verify blockchain integrity
      const isBlockchainValid = await this.verifyBlockchainIntegrity(credential);
      
      // Verify issuer signature
      const isSignatureValid = await this.verifyIssuerSignature(credential);
      
      // Check expiration
      const isExpired = credential.metadata.expirationDate < new Date();

      const verificationResult = {
        timestamp: new Date(),
        status: isBlockchainValid && isSignatureValid && !isExpired ? 'verified' : 'failed',
        verifier: verificationData.verifier,
        details: {
          blockchainValid: isBlockchainValid,
          signatureValid: isSignatureValid,
          notExpired: !isExpired
        }
      };

      // Update verification status
      credential.verification.verificationStatus = verificationResult.status;
      credential.verification.lastVerified = verificationResult.timestamp;
      credential.verification.verificationHistory.push(verificationResult);

      await credential.save();
      return verificationResult;
    } catch (error) {
      throw new Error(`Failed to verify credential: ${error.message}`);
    }
  }

  async revokeCredential(credentialId, reason) {
    try {
      const credential = await Credential.findById(credentialId);
      if (!credential) {
        throw new Error('Credential not found');
      }

      credential.status = 'revoked';
      await credential.save();

      // Update blockchain revocation registry
      await this.updateRevocationRegistry(credentialId, true);

      return credential;
    } catch (error) {
      throw new Error(`Failed to revoke credential: ${error.message}`);
    }
  }

  // Helper methods
  async verifyBlockchainIntegrity(credential) {
    try {
      // Implement blockchain verification logic
      return true;
    } catch (error) {
      return false;
    }
  }

  async verifyIssuerSignature(credential) {
    try {
      // Implement signature verification logic
      return true;
    } catch (error) {
      return false;
    }
  }

  async updateRevocationRegistry(credentialId, isRevoked) {
    try {
      // Implement blockchain revocation registry update
      return true;
    } catch (error) {
      throw new Error(`Failed to update revocation registry: ${error.message}`);
    }
  }
}

module.exports = new CredentialService(); 