import CryptoJS from 'crypto-js';

class CryptoUtils {
  // Generate a random encryption key
  generateKey() {
    return CryptoJS.lib.WordArray.random(256/8).toString();
  }

  // Encrypt data
  encrypt(data, key) {
    try {
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  // Decrypt data
  decrypt(encryptedData, key) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, key);
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      return decryptedData;