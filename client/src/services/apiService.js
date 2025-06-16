import axios from 'axios';
import config from '../config';
import { web3Service } from './web3Service';

export class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: config.api.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async generateDid(encryptedData) {
    try {
      const response = await this.api.post('/did/generate', { encryptedData });
      return response.data.did;
    } catch (error) {
      throw new Error('Failed to generate DID');
    }
  }

  async storeIdentityOnBlockchain(did, encryptedData) {
    try {
      const { transactionHash } = await web3Service.storeIdentity(did, encryptedData);
      return transactionHash;
    } catch (error) {
      throw new Error('Failed to store identity on blockchain');
    }
  }

  async issueCredential(did, encryptedCredential) {
    try {
      const response = await this.api.post('/credentials/issue', {
        did,
        credential: encryptedCredential
      });
      return response.data.credential;
    } catch (error) {
      throw new Error('Failed to issue credential');
    }
  }

  async verifyCredential(credentialId) {
    try {
      const response = await this.api.get(`/credentials/verify/${credentialId}`);
      return response.data.verificationResult;
    } catch (error) {
      throw new Error('Failed to verify credential');
    }
  }

  async shareCredential(credentialId, recipientDid) {
    try {
      const response = await this.api.post('/credentials/share', {
        credentialId,
        recipientDid
      });
      return response.data.shareResult;
    } catch (error) {
      throw new Error('Failed to share credential');
    }
  }

  async getCredentialById(credentialId) {
    try {
      const response = await this.api.get(`/credentials/${credentialId}`);
      return response.data.credential;
    } catch (error) {
      throw new Error('Failed to get credential');
    }
  }

  async getCredentialsByDid(did) {
    try {
      const response = await this.api.get(`/credentials/did/${did}`);
      return response.data.credentials;
    } catch (error) {
      throw new Error('Failed to get credentials');
    }
  }
}

export const apiService = new ApiService();
