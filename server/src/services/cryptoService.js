const crypto = require('crypto');
const { promisify } = require('util');
const scrypt = promisify(crypto.scrypt);

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY_LENGTH = 32;
const IV_LENGTH = 12;

// Generate a secure encryption key
async function generateEncryptionKey(password, salt) {
  return await scrypt(password, salt, ENCRYPTION_KEY_LENGTH);
}

// Encrypt credential data
async function encryptCredentialData(data, password) {
  try {
    // Generate random salt and IV
    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(IV_LENGTH);

    // Generate encryption key from password
    const key = await generateEncryptionKey(password, salt);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt data
    const encrypted = Buffer.concat([
      cipher.update(JSON.stringify(data)),
      cipher.final()
    ]);

    // Generate auth tag
    const authTag = cipher.getAuthTag();

    // Return encrypted data with metadata
    return {
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      encryptedData: encrypted.toString('hex')
    };
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

// Decrypt credential data
async function decryptCredentialData(encryptedData, password) {
  try {
    // Parse encrypted data
    const { salt, iv, authTag, encryptedData: hexData } = encryptedData;
    
    // Convert hex strings to buffers
    const saltBuffer = Buffer.from(salt, 'hex');
    const ivBuffer = Buffer.from(iv, 'hex');
    const authTagBuffer = Buffer.from(authTag, 'hex');
    const encryptedBuffer = Buffer.from(hexData, 'hex');

    // Generate encryption key from password
    const key = await generateEncryptionKey(password, saltBuffer);

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer);
    decipher.setAuthTag(authTagBuffer);

    // Decrypt data
    const decrypted = Buffer.concat([
      decipher.update(encryptedBuffer),
      decipher.final()
    ]);

    // Parse decrypted data
    return JSON.parse(decrypted.toString());
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

// Verify credential signature
async function verifyCredentialSignature(encryptedData, storedKey, providedKey) {
  try {
    // Generate keys from both passwords
    const storedKeyBuffer = Buffer.from(storedKey, 'hex');
    const providedKeyBuffer = Buffer.from(providedKey, 'hex');

    // Compare keys using constant-time comparison
    return crypto.timingSafeEqual(storedKeyBuffer, providedKeyBuffer);
  } catch (error) {
    throw new Error(`Signature verification failed: ${error.message}`);
  }
}

module.exports = {
  encryptCredentialData,
  decryptCredentialData,
  verifyCredentialSignature
};
