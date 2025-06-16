import { Wallet, hexlify, randomBytes, verifyMessage } from 'ethers';
import CryptoJS from 'crypto-js';
import { keccak256, toUtf8Bytes } from 'ethers';
import { ipfsService } from './ipfsService';

export class CryptoService {
  constructor() {
    this.encryptionKey = process.env.REACT_APP_ENCRYPTION_KEY;
  }

  async encryptIdentityData(data) {
    try {
      // Convert data to JSON string
      const dataString = JSON.stringify(data);
      
      // Encrypt with AES
      const encrypted = CryptoJS.AES.encrypt(
        dataString,
        this.encryptionKey
      ).toString();

      // Generate hash for integrity verification
      const hash = keccak256(toUtf8Bytes(dataString));

      return {
        encryptedData: encrypted,
        hash
      };
    } catch (error) {
      throw new Error('Failed to encrypt identity data');
    }
  }

  async decryptIdentityData(encryptedData) {
    try {
      const bytes = CryptoJS.AES.decrypt(
        encryptedData,
        this.encryptionKey
      );
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      throw new Error('Failed to decrypt identity data');
    }
  }

  async encryptCredential(credentialData) {
    try {
      // Generate credential ID
      const credentialId = hexlify(randomBytes(32));
      
      // Encrypt credential data
      const encrypted = await this.encryptIdentityData(credentialData);
      
      // Store encrypted data on IPFS
      const ipfsHash = await ipfsService.storeData(encrypted);
      
      return {
        id: credentialId,
        ipfsHash,
        type: credentialData.type,
        issuer: credentialData.issuer,
        subject: credentialData.subject,
        issuanceDate: new Date().toISOString()
      };
    } catch (error) {
      throw new Error('Failed to encrypt credential');
    }
  }

  async decryptCredential(encryptedCredential) {
    try {
      // Retrieve encrypted data from IPFS
      const encryptedData = await ipfsService.retrieveData(encryptedCredential.ipfsHash);
      
      // Decrypt the data
      const credentialData = await this.decryptIdentityData(encryptedData.encryptedData);
      
      return {
        ...encryptedCredential,
        data: credentialData
      };
    } catch (error) {
      throw new Error('Failed to decrypt credential');
    }
  }

  async generateSignature(data, privateKey) {
    try {
      const wallet = new Wallet(privateKey);
      return wallet.signMessage(data);
    } catch (error) {
      throw new Error('Failed to generate signature');
    }
  }

  async verifySignature(data, signature, publicKey) {
    try {
      return verifyMessage(data, signature) === publicKey;
    } catch (error) {
      throw new Error('Failed to verify signature');
    }
  }
}

export const cryptoService = new CryptoService();
