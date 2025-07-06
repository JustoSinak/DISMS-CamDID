// server/utils/hsm.js - Hardware Security Module utilities for DISMS
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const { encryptData, decryptData, generateKeyPair, generateSecureToken } = require('./encryption');

/**
 * Hardware Security Module (HSM) simulation
 * In production, this would interface with actual HSM hardware or cloud HSM services
 * like AWS CloudHSM, Azure Dedicated HSM, or physical HSM devices
 */

class HSMService {
  constructor() {
    this.keyStore = new Map(); // In-memory key store (would be HSM in production)
    this.keyDirectory = process.env.HSM_KEY_DIR || path.join(__dirname, '../keys');
    this.initialized = false;
    this.masterKeyId = 'master-key-001';
  }

  /**
   * Initialize the HSM service
   */
  async initialize() {
    try {
      // Ensure key directory exists
      await this.ensureKeyDirectory();
      
      // Load or generate master key
      await this.initializeMasterKey();
      
      this.initialized = true;
      console.log('HSM Service initialized successfully');
    } catch (error) {
      throw new Error(`HSM initialization failed: ${error.message}`);
    }
  }

  /**
   * Ensure key directory exists
   */
  async ensureKeyDirectory() {
    try {
      await fs.access(this.keyDirectory);
    } catch (error) {
      // Directory doesn't exist, create it
      await fs.mkdir(this.keyDirectory, { recursive: true, mode: 0o700 });
    }
  }

  /**
   * Initialize or load master key
   */
  async initializeMasterKey() {
    const masterKeyPath = path.join(this.keyDirectory, `${this.masterKeyId}.key`);
    
    try {
      // Try to load existing master key
      const encryptedMasterKey = await fs.readFile(masterKeyPath, 'utf8');
      const masterKey = JSON.parse(encryptedMasterKey);
      this.keyStore.set(this.masterKeyId, masterKey);
    } catch (error) {
      // Master key doesn't exist, generate new one
      console.log('Generating new master key...');
      await this.generateMasterKey();
    }
  }

  /**
   * Generate new master key
   */
  async generateMasterKey() {
    const keyPair = generateKeyPair();
    const keyId = this.masterKeyId;
    const createdAt = new Date().toISOString();
    
    const masterKey = {
      keyId,
      keyType: 'RSA-2048',
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey,
      createdAt,
      usage: ['sign', 'verify', 'encrypt', 'decrypt'],
      status: 'active'
    };

    // Store in memory
    this.keyStore.set(keyId, masterKey);

    // Persist to disk (encrypted)
    const masterKeyPath = path.join(this.keyDirectory, `${keyId}.key`);
    await fs.writeFile(masterKeyPath, JSON.stringify(masterKey), { mode: 0o600 });
    
    console.log(`Master key generated with ID: ${keyId}`);
    return keyId;
  }

  /**
   * Generate a new key pair
   * @param {string} keyType - Type of key (RSA-2048, RSA-4096, EC-P256, etc.)
   * @param {Array} usage - Key usage array ['sign', 'verify', 'encrypt', 'decrypt']
   * @returns {string} Key ID
   */
  async generateKey(keyType = 'RSA-2048', usage = ['sign', 'verify']) {
    this.ensureInitialized();

    const keyId = `key-${generateSecureToken(16)}`;
    const createdAt = new Date().toISOString();
    
    let keyPair;
    
    switch (keyType) {
      case 'RSA-2048':
        keyPair = crypto.generateKeyPairSync('rsa', {
          modulusLength: 2048,
          publicKeyEncoding: { type: 'spki', format: 'pem' },
          privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
        });
        break;
      case 'RSA-4096':
        keyPair = crypto.generateKeyPairSync('rsa', {
          modulusLength: 4096,
          publicKeyEncoding: { type: 'spki', format: 'pem' },
          privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
        });
        break;
      case 'EC-P256':
        keyPair = crypto.generateKeyPairSync('ec', {
          namedCurve: 'prime256v1',
          publicKeyEncoding: { type: 'spki', format: 'pem' },
          privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
        });
        break;
      default:
        throw new Error(`Unsupported key type: ${keyType}`);
    }

    const keyData = {
      keyId,
      keyType,
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey,
      createdAt,
      usage,
      status: 'active'
    };

    // Store in memory
    this.keyStore.set(keyId, keyData);

    // Persist to disk
    const keyPath = path.join(this.keyDirectory, `${keyId}.key`);
    await fs.writeFile(keyPath, JSON.stringify(keyData), { mode: 0o600 });

    console.log(`Key generated with ID: ${keyId}, Type: ${keyType}`);
    return keyId;
  }

  /**
   * Get public key by key ID
   * @param {string} keyId - Key identifier
   * @returns {string} Public key in PEM format
   */
  getPublicKey(keyId) {
    this.ensureInitialized();
    
    const keyData = this.keyStore.get(keyId);
    if (!keyData) {
      throw new Error(`Key not found: ${keyId}`);
    }

    if (keyData.status !== 'active') {
      throw new Error(`Key is not active: ${keyId}`);
    }

    return keyData.publicKey;
  }

  /**
   * Sign data using specified key
   * @param {*} data - Data to sign
   * @param {string} keyId - Key identifier
   * @param {string} algorithm - Signature algorithm
   * @returns {string} Signature in base64 format
   */
  sign(data, keyId, algorithm = 'sha256') {
    this.ensureInitialized();
    
    const keyData = this.keyStore.get(keyId);
    if (!keyData) {
      throw new Error(`Key not found: ${keyId}`);
    }

    if (!keyData.usage.includes('sign')) {
      throw new Error(`Key does not support signing: ${keyId}`);
    }

    if (keyData.status !== 'active') {
      throw new Error(`Key is not active: ${keyId}`);
    }

    try {
      const sign = crypto.createSign(algorithm);
      sign.update(JSON.stringify(data));
      return sign.sign(keyData.privateKey, 'base64');
    } catch (error) {
      throw new Error(`Signing failed: ${error.message}`);
    }
  }

  /**
   * Verify signature using specified key
   * @param {*} data - Original data
   * @param {string} signature - Signature to verify
   * @param {string} keyId - Key identifier
   * @param {string} algorithm - Signature algorithm
   * @returns {boolean} True if signature is valid
   */
  verify(data, signature, keyId, algorithm = 'sha256') {
    this.ensureInitialized();
    
    const keyData = this.keyStore.get(keyId);
    if (!keyData) {
      throw new Error(`Key not found: ${keyId}`);
    }

    if (!keyData.usage.includes('verify')) {
      throw new Error(`Key does not support verification: ${keyId}`);
    }

    try {
      const verify = crypto.createVerify(algorithm);
      verify.update(JSON.stringify(data));
      return verify.verify(keyData.publicKey, signature, 'base64');
    } catch (error) {
      throw new Error(`Verification failed: ${error.message}`);
    }
  }

  /**
   * Encrypt data using specified key
   * @param {*} data - Data to encrypt
   * @param {string} keyId - Key identifier
   * @returns {string} Encrypted data in base64 format
   */
  encrypt(data, keyId) {
    this.ensureInitialized();
    
    const keyData = this.keyStore.get(keyId);
    if (!keyData) {
      throw new Error(`Key not found: ${keyId}`);
    }

    if (!keyData.usage.includes('encrypt')) {
      throw new Error(`Key does not support encryption: ${keyId}`);
    }

    if (keyData.status !== 'active') {
      throw new Error(`Key is not active: ${keyId}`);
    }

    try {
      const buffer = Buffer.from(JSON.stringify(data), 'utf8');
      const encrypted = crypto.publicEncrypt(keyData.publicKey, buffer);
      return encrypted.toString('base64');
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt data using specified key
   * @param {string} encryptedData - Encrypted data in base64 format
   * @param {string} keyId - Key identifier
   * @returns {*} Decrypted data
   */
  decrypt(encryptedData, keyId) {
    this.ensureInitialized();
    
    const keyData = this.keyStore.get(keyId);
    if (!keyData) {
      throw new Error(`Key not found: ${keyId}`);
    }

    if (!keyData.usage.includes('decrypt')) {
      throw new Error(`Key does not support decryption: ${keyId}`);
    }

    if (keyData.status !== 'active') {
      throw new Error(`Key is not active: ${keyId}`);
    }

    try {
      const buffer = Buffer.from(encryptedData, 'base64');
      const decrypted = crypto.privateDecrypt(keyData.privateKey, buffer);
      return JSON.parse(decrypted.toString('utf8'));
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Rotate a key (generate new version)
   * @param {string} keyId - Key identifier to rotate
   * @returns {string} New key ID
   */
  async rotateKey(keyId) {
    this.ensureInitialized();
    
    const oldKeyData = this.keyStore.get(keyId);
    if (!oldKeyData) {
      throw new Error(`Key not found: ${keyId}`);
    }

    // Mark old key as rotated
    oldKeyData.status = 'rotated';
    oldKeyData.rotatedAt = new Date().toISOString();

    // Generate new key with same properties
    const newKeyId = await this.generateKey(oldKeyData.keyType, oldKeyData.usage);
    
    console.log(`Key rotated: ${keyId} -> ${newKeyId}`);
    return newKeyId;
  }

  /**
   * Revoke a key
   * @param {string} keyId - Key identifier to revoke
   */
  async revokeKey(keyId) {
    this.ensureInitialized();
    
    const keyData = this.keyStore.get(keyId);
    if (!keyData) {
      throw new Error(`Key not found: ${keyId}`);
    }

    keyData.status = 'revoked';
    keyData.revokedAt = new Date().toISOString();

    // Update persisted key
    const keyPath = path.join(this.keyDirectory, `${keyId}.key`);
    await fs.writeFile(keyPath, JSON.stringify(keyData), { mode: 0o600 });

    console.log(`Key revoked: ${keyId}`);
  }

  /**
   * List all keys
   * @returns {Array} Array of key metadata
   */
  listKeys() {
    this.ensureInitialized();
    
    const keys = [];
    for (const [keyId, keyData] of this.keyStore.entries()) {
      keys.push({
        keyId: keyData.keyId,
        keyType: keyData.keyType,
        usage: keyData.usage,
        status: keyData.status,
        createdAt: keyData.createdAt,
        rotatedAt: keyData.rotatedAt,
        revokedAt: keyData.revokedAt
      });
    }
    
    return keys;
  }

  /**
   * Get key metadata
   * @param {string} keyId - Key identifier
   * @returns {Object} Key metadata
   */
  getKeyMetadata(keyId) {
    this.ensureInitialized();
    
    const keyData = this.keyStore.get(keyId);
    if (!keyData) {
      throw new Error(`Key not found: ${keyId}`);
    }

    return {
      keyId: keyData.keyId,
      keyType: keyData.keyType,
      usage: keyData.usage,
      status: keyData.status,
      createdAt: keyData.createdAt,
      rotatedAt: keyData.rotatedAt,
      revokedAt: keyData.revokedAt
    };
  }

  /**
   * Ensure HSM is initialized
   */
  ensureInitialized() {
    if (!this.initialized) {
      throw new Error('HSM service not initialized. Call initialize() first.');
    }
  }

  /**
   * Get master key ID
   * @returns {string} Master key ID
   */
  getMasterKeyId() {
    return this.masterKeyId;
  }

  /**
   * Backup keys (encrypted)
   * @param {string} backupPath - Path to backup file
   * @param {string} backupPassword - Password for backup encryption
   */
  async backupKeys(backupPath, backupPassword) {
    this.ensureInitialized();
    
    const backup = {
      timestamp: new Date().toISOString(),
      keys: {}
    };

    // Collect all keys
    for (const [keyId, keyData] of this.keyStore.entries()) {
      backup.keys[keyId] = keyData;
    }

    // Encrypt backup
    const encryptedBackup = await encryptData(backup);
    
    // Save to file
    await fs.writeFile(backupPath, JSON.stringify(encryptedBackup), { mode: 0o600 });
    
    console.log(`Keys backed up to: ${backupPath}`);
  }

  /**
   * Restore keys from backup
   * @param {string} backupPath - Path to backup file
   * @param {string} backupPassword - Password for backup decryption
   */
  async restoreKeys(backupPath, backupPassword) {
    try {
      const encryptedBackup = JSON.parse(await fs.readFile(backupPath, 'utf8'));
      const backup = await decryptData(encryptedBackup);

      // Restore keys
      for (const [keyId, keyData] of Object.entries(backup.keys)) {
        this.keyStore.set(keyId, keyData);
        
        // Persist to disk
        const keyPath = path.join(this.keyDirectory, `${keyId}.key`);
        await fs.writeFile(keyPath, JSON.stringify(keyData), { mode: 0o600 });
      }

      console.log(`Keys restored from backup: ${backupPath}`);
    } catch (error) {
      throw new Error(`Key restoration failed: ${error.message}`);
    }
  }
}

// Export singleton instance
const hsmService = new HSMService();

module.exports = {
  hsmService,
  HSMService
};
