// server/utils/zkProofs.js - Zero-Knowledge Proof utilities for DISMS
const crypto = require('crypto');
const { generateHash, generateHMAC, verifyHMAC } = require('./encryption');

/**
 * Zero-Knowledge Proof implementation for selective disclosure
 * This is a simplified implementation for demonstration purposes.
 * In production, you would use libraries like snarkjs, circomlib, or similar.
 */

class ZKProofService {
  constructor() {
    this.proofTypes = {
      AGE_VERIFICATION: 'age_verification',
      IDENTITY_VERIFICATION: 'identity_verification',
      CREDENTIAL_OWNERSHIP: 'credential_ownership',
      ATTRIBUTE_DISCLOSURE: 'attribute_disclosure'
    };
  }

  /**
   * Generate a commitment for a value (Pedersen commitment scheme)
   * @param {*} value - The value to commit to
   * @param {string} randomness - Random value for blinding
   * @returns {Object} Commitment object
   */
  generateCommitment(value, randomness = null) {
    try {
      const r = randomness || crypto.randomBytes(32).toString('hex');
      const valueHash = generateHash(value);
      const commitment = generateHash({ value: valueHash, randomness: r });
      
      return {
        commitment,
        randomness: r,
        valueHash
      };
    } catch (error) {
      throw new Error(`Commitment generation failed: ${error.message}`);
    }
  }

  /**
   * Verify a commitment
   * @param {*} value - The original value
   * @param {string} randomness - The randomness used in commitment
   * @param {string} commitment - The commitment to verify
   * @returns {boolean} True if commitment is valid
   */
  verifyCommitment(value, randomness, commitment) {
    try {
      const valueHash = generateHash(value);
      const expectedCommitment = generateHash({ value: valueHash, randomness });
      return commitment === expectedCommitment;
    } catch (error) {
      throw new Error(`Commitment verification failed: ${error.message}`);
    }
  }

  /**
   * Generate a zero-knowledge proof for age verification
   * Proves that age >= minAge without revealing actual age
   * @param {number} actualAge - The actual age
   * @param {number} minAge - The minimum age to prove
   * @param {string} secret - Secret key for proof generation
   * @returns {Object} ZK proof object
   */
  generateAgeProof(actualAge, minAge, secret) {
    try {
      if (actualAge < minAge) {
        throw new Error('Cannot generate proof: age requirement not met');
      }

      // Generate proof components
      const nonce = crypto.randomBytes(16).toString('hex');
      const timestamp = Date.now();
      
      // Create proof data (simplified)
      const proofData = {
        type: this.proofTypes.AGE_VERIFICATION,
        minAge,
        nonce,
        timestamp,
        // In a real implementation, this would be a complex mathematical proof
        // For now, we use a hash-based approach
        challenge: generateHash({ actualAge, minAge, nonce, timestamp }),
        response: generateHMAC({ actualAge, minAge, nonce, timestamp }, secret)
      };

      return {
        proof: proofData,
        isValid: true,
        proofType: this.proofTypes.AGE_VERIFICATION
      };
    } catch (error) {
      throw new Error(`Age proof generation failed: ${error.message}`);
    }
  }

  /**
   * Verify age proof
   * @param {Object} proof - The proof to verify
   * @param {number} minAge - The minimum age that was proven
   * @param {string} secret - Secret key for verification
   * @returns {boolean} True if proof is valid
   */
  verifyAgeProof(proof, minAge, secret) {
    try {
      const { type, minAge: proofMinAge, nonce, timestamp, challenge, response } = proof;

      // Basic validation
      if (type !== this.proofTypes.AGE_VERIFICATION) {
        return false;
      }

      if (proofMinAge !== minAge) {
        return false;
      }

      // Check timestamp (proof should not be too old)
      const maxAge = 5 * 60 * 1000; // 5 minutes
      if (Date.now() - timestamp > maxAge) {
        return false;
      }

      // Verify the proof (simplified)
      // In a real implementation, this would involve complex mathematical verification
      const expectedResponse = generateHMAC({ minAge, nonce, timestamp }, secret);
      return response === expectedResponse;
    } catch (error) {
      throw new Error(`Age proof verification failed: ${error.message}`);
    }
  }

  /**
   * Generate selective disclosure proof
   * Allows proving possession of certain attributes without revealing others
   * @param {Object} credentials - Full credential data
   * @param {Array} revealedAttributes - Attributes to reveal
   * @param {string} verifierPublicKey - Verifier's public key
   * @returns {Object} Selective disclosure proof
   */
  generateSelectiveDisclosureProof(credentials, revealedAttributes, verifierPublicKey) {
    try {
      const nonce = crypto.randomBytes(16).toString('hex');
      const timestamp = Date.now();

      // Create commitments for all attributes
      const commitments = {};
      const randomness = {};
      
      Object.keys(credentials).forEach(attr => {
        const r = crypto.randomBytes(32).toString('hex');
        randomness[attr] = r;
        commitments[attr] = this.generateCommitment(credentials[attr], r);
      });

      // Create revealed data
      const revealedData = {};
      const revealedCommitments = {};
      
      revealedAttributes.forEach(attr => {
        if (credentials[attr] !== undefined) {
          revealedData[attr] = credentials[attr];
          revealedCommitments[attr] = {
            commitment: commitments[attr].commitment,
            randomness: randomness[attr]
          };
        }
      });

      // Create proof of knowledge for hidden attributes
      const hiddenAttributes = Object.keys(credentials).filter(
        attr => !revealedAttributes.includes(attr)
      );
      
      const hiddenCommitments = {};
      hiddenAttributes.forEach(attr => {
        hiddenCommitments[attr] = commitments[attr].commitment;
      });

      const proofData = {
        type: this.proofTypes.ATTRIBUTE_DISCLOSURE,
        nonce,
        timestamp,
        revealedData,
        revealedCommitments,
        hiddenCommitments,
        verifierKey: generateHash(verifierPublicKey),
        signature: generateHMAC({
          revealedData,
          hiddenCommitments,
          nonce,
          timestamp
        }, verifierPublicKey)
      };

      return {
        proof: proofData,
        isValid: true,
        proofType: this.proofTypes.ATTRIBUTE_DISCLOSURE
      };
    } catch (error) {
      throw new Error(`Selective disclosure proof generation failed: ${error.message}`);
    }
  }

  /**
   * Verify selective disclosure proof
   * @param {Object} proof - The proof to verify
   * @param {string} verifierPrivateKey - Verifier's private key
   * @returns {Object} Verification result with revealed data
   */
  verifySelectiveDisclosureProof(proof, verifierPrivateKey) {
    try {
      const {
        type,
        nonce,
        timestamp,
        revealedData,
        revealedCommitments,
        hiddenCommitments,
        verifierKey,
        signature
      } = proof;

      // Basic validation
      if (type !== this.proofTypes.ATTRIBUTE_DISCLOSURE) {
        throw new Error('Invalid proof type');
      }

      // Check timestamp
      const maxAge = 10 * 60 * 1000; // 10 minutes
      if (Date.now() - timestamp > maxAge) {
        throw new Error('Proof has expired');
      }

      // Verify verifier key
      const expectedVerifierKey = generateHash(verifierPrivateKey);
      if (verifierKey !== expectedVerifierKey) {
        throw new Error('Invalid verifier key');
      }

      // Verify signature
      const expectedSignature = generateHMAC({
        revealedData,
        hiddenCommitments,
        nonce,
        timestamp
      }, verifierPrivateKey);

      if (signature !== expectedSignature) {
        throw new Error('Invalid proof signature');
      }

      // Verify revealed commitments
      for (const [attr, data] of Object.entries(revealedCommitments)) {
        const isValid = this.verifyCommitment(
          revealedData[attr],
          data.randomness,
          data.commitment
        );
        
        if (!isValid) {
          throw new Error(`Invalid commitment for attribute: ${attr}`);
        }
      }

      return {
        isValid: true,
        revealedData,
        hiddenAttributeCount: Object.keys(hiddenCommitments).length,
        timestamp,
        nonce
      };
    } catch (error) {
      throw new Error(`Selective disclosure proof verification failed: ${error.message}`);
    }
  }

  /**
   * Generate proof of credential ownership
   * @param {string} credentialId - ID of the credential
   * @param {string} ownerPrivateKey - Owner's private key
   * @param {string} challenge - Challenge from verifier
   * @returns {Object} Ownership proof
   */
  generateOwnershipProof(credentialId, ownerPrivateKey, challenge) {
    try {
      const timestamp = Date.now();
      const nonce = crypto.randomBytes(16).toString('hex');

      const proofData = {
        type: this.proofTypes.CREDENTIAL_OWNERSHIP,
        credentialId,
        challenge,
        nonce,
        timestamp,
        response: generateHMAC({
          credentialId,
          challenge,
          nonce,
          timestamp
        }, ownerPrivateKey)
      };

      return {
        proof: proofData,
        isValid: true,
        proofType: this.proofTypes.CREDENTIAL_OWNERSHIP
      };
    } catch (error) {
      throw new Error(`Ownership proof generation failed: ${error.message}`);
    }
  }

  /**
   * Verify ownership proof
   * @param {Object} proof - The proof to verify
   * @param {string} credentialId - Expected credential ID
   * @param {string} ownerPublicKey - Owner's public key
   * @param {string} originalChallenge - Original challenge
   * @returns {boolean} True if proof is valid
   */
  verifyOwnershipProof(proof, credentialId, ownerPublicKey, originalChallenge) {
    try {
      const { type, credentialId: proofCredId, challenge, nonce, timestamp, response } = proof;

      // Basic validation
      if (type !== this.proofTypes.CREDENTIAL_OWNERSHIP) {
        return false;
      }

      if (proofCredId !== credentialId) {
        return false;
      }

      if (challenge !== originalChallenge) {
        return false;
      }

      // Check timestamp
      const maxAge = 5 * 60 * 1000; // 5 minutes
      if (Date.now() - timestamp > maxAge) {
        return false;
      }

      // Verify response
      const expectedResponse = generateHMAC({
        credentialId,
        challenge,
        nonce,
        timestamp
      }, ownerPublicKey);

      return response === expectedResponse;
    } catch (error) {
      throw new Error(`Ownership proof verification failed: ${error.message}`);
    }
  }

  /**
   * Generate a challenge for interactive proofs
   * @returns {string} Random challenge
   */
  generateChallenge() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Create a Merkle tree for batch proofs
   * @param {Array} data - Array of data items
   * @returns {Object} Merkle tree structure
   */
  createMerkleTree(data) {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Data must be a non-empty array');
    }

    // Create leaf nodes
    let currentLevel = data.map(item => generateHash(item));
    const tree = [currentLevel];

    // Build tree levels
    while (currentLevel.length > 1) {
      const nextLevel = [];
      
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1] || left; // Handle odd number of nodes
        nextLevel.push(generateHash({ left, right }));
      }
      
      tree.push(nextLevel);
      currentLevel = nextLevel;
    }

    return {
      root: currentLevel[0],
      tree,
      leaves: tree[0]
    };
  }

  /**
   * Generate Merkle proof for a specific item
   * @param {Array} data - Original data array
   * @param {number} index - Index of item to prove
   * @returns {Object} Merkle proof
   */
  generateMerkleProof(data, index) {
    const merkleTree = this.createMerkleTree(data);
    const proof = [];
    let currentIndex = index;

    for (let level = 0; level < merkleTree.tree.length - 1; level++) {
      const currentLevel = merkleTree.tree[level];
      const isRightNode = currentIndex % 2 === 1;
      const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;
      
      if (siblingIndex < currentLevel.length) {
        proof.push({
          hash: currentLevel[siblingIndex],
          isRight: !isRightNode
        });
      }
      
      currentIndex = Math.floor(currentIndex / 2);
    }

    return {
      proof,
      root: merkleTree.root,
      leaf: merkleTree.leaves[index],
      index
    };
  }

  /**
   * Verify Merkle proof
   * @param {Object} merkleProof - The Merkle proof to verify
   * @param {*} data - The original data item
   * @returns {boolean} True if proof is valid
   */
  verifyMerkleProof(merkleProof, data) {
    try {
      const { proof, root, index } = merkleProof;
      let currentHash = generateHash(data);

      for (const proofElement of proof) {
        if (proofElement.isRight) {
          currentHash = generateHash({ left: currentHash, right: proofElement.hash });
        } else {
          currentHash = generateHash({ left: proofElement.hash, right: currentHash });
        }
      }

      return currentHash === root;
    } catch (error) {
      throw new Error(`Merkle proof verification failed: ${error.message}`);
    }
  }
}

// Export singleton instance
const zkProofService = new ZKProofService();

module.exports = {
  zkProofService,
  ZKProofService
};
