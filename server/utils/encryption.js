// server/utils/encryption.js - Enhanced encryption utilities for DISMS
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 32; // 256 bits

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(KEY_LENGTH);
const MASTER_SECRET = process.env.ENCRYPTION_SECRET || 'default-secret-key-change-in-production';
const MASTER_SALT = process.env.ENCRYPTION_SALT || 'default-salt-change-in-production';

async function encryptData(data) {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      iv: iv.toString('hex'),
      encryptedData: encrypted,
      authTag: authTag.toString('hex')
    };
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

async function decryptData(encryptedData) {
  try {
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      ENCRYPTION_KEY,
      Buffer.from(encryptedData.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

// Derive master key from environment variables
function deriveMasterKey() {
  return crypto.pbkdf2Sync(MASTER_SECRET, MASTER_SALT, 100000, KEY_LENGTH, 'sha512');
}

// Generate a random encryption key
function generateKey() {
  return crypto.randomBytes(KEY_LENGTH);
}

// Generate a random salt
function generateSalt() {
  return crypto.randomBytes(SALT_LENGTH);
}

// Derive key from password using PBKDF2
function deriveKeyFromPassword(password, salt, iterations = 100000) {
  return crypto.pbkdf2Sync(password, salt, iterations, KEY_LENGTH, 'sha512');
}

// Enhanced encryption with user-specific keys
async function encryptUserData(data, userKey = null) {
  try {
    const encryptionKey = userKey || deriveMasterKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);

    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      iv: iv.toString('hex'),
      encryptedData: encrypted,
      authTag: authTag.toString('hex'),
      algorithm: ALGORITHM
    };
  } catch (error) {
    throw new Error(`User data encryption failed: ${error.message}`);
  }
}

// Enhanced decryption with user-specific keys
async function decryptUserData(encryptedData, userKey = null) {
  try {
    const decryptionKey = userKey || deriveMasterKey();
    const { iv, encryptedData: encrypted, authTag, algorithm } = encryptedData;

    if (algorithm && algorithm !== ALGORITHM) {
      throw new Error('Unsupported encryption algorithm');
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, decryptionKey, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  } catch (error) {
    throw new Error(`User data decryption failed: ${error.message}`);
  }
}

// Hash password with bcrypt
async function hashPassword(password, saltRounds = 12) {
  try {
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
}

// Verify password with bcrypt
async function verifyPassword(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error(`Password verification failed: ${error.message}`);
  }
}

// Generate secure random token
function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Generate cryptographic hash
function generateHash(data, algorithm = 'sha256') {
  return crypto.createHash(algorithm).update(JSON.stringify(data)).digest('hex');
}

// Generate HMAC signature
function generateHMAC(data, secret, algorithm = 'sha256') {
  return crypto.createHmac(algorithm, secret).update(JSON.stringify(data)).digest('hex');
}

// Verify HMAC signature
function verifyHMAC(data, signature, secret, algorithm = 'sha256') {
  const expectedSignature = generateHMAC(data, secret, algorithm);
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

// Generate key pair for asymmetric encryption
function generateKeyPair() {
  return crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });
}

// Encrypt with public key
function encryptWithPublicKey(data, publicKey) {
  try {
    const buffer = Buffer.from(JSON.stringify(data), 'utf8');
    const encrypted = crypto.publicEncrypt(publicKey, buffer);
    return encrypted.toString('base64');
  } catch (error) {
    throw new Error(`Public key encryption failed: ${error.message}`);
  }
}

// Decrypt with private key
function decryptWithPrivateKey(encryptedData, privateKey) {
  try {
    const buffer = Buffer.from(encryptedData, 'base64');
    const decrypted = crypto.privateDecrypt(privateKey, buffer);
    return JSON.parse(decrypted.toString('utf8'));
  } catch (error) {
    throw new Error(`Private key decryption failed: ${error.message}`);
  }
}

// Sign data with private key
function signData(data, privateKey, algorithm = 'sha256') {
  try {
    const sign = crypto.createSign(algorithm);
    sign.update(JSON.stringify(data));
    return sign.sign(privateKey, 'base64');
  } catch (error) {
    throw new Error(`Data signing failed: ${error.message}`);
  }
}

// Verify signature with public key
function verifySignature(data, signature, publicKey, algorithm = 'sha256') {
  try {
    const verify = crypto.createVerify(algorithm);
    verify.update(JSON.stringify(data));
    return verify.verify(publicKey, signature, 'base64');
  } catch (error) {
    throw new Error(`Signature verification failed: ${error.message}`);
  }
}

// Generate secure random string for OTP, backup codes, etc.
function generateSecureCode(length = 8, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') {
  let result = '';
  const bytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    result += charset[bytes[i] % charset.length];
  }

  return result;
}

module.exports = {
  // Original functions (backward compatibility)
  encryptData,
  decryptData,

  // Enhanced functions
  encryptUserData,
  decryptUserData,
  hashPassword,
  verifyPassword,
  generateSecureToken,
  generateHash,
  generateHMAC,
  verifyHMAC,
  generateKeyPair,
  encryptWithPublicKey,
  decryptWithPrivateKey,
  signData,
  verifySignature,
  generateSecureCode,
  generateKey,
  generateSalt,
  deriveKeyFromPassword,
  deriveMasterKey,

  // Constants
  ALGORITHM,
  KEY_LENGTH,
  IV_LENGTH,
  SALT_LENGTH
};