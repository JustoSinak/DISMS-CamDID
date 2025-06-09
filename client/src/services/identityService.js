import axios from 'axios';
import { generateDID, createDIDDocument, anchorDIDToBlockchain, createVerifiableCredential, anchorVCToBlockchain } from '../utils/web3Utils';

class IdentityService {
  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api'
    });
  }

  // Step 1: Verify the user's national ID with government database
  async verifyNationalId(idData) {
    try {
      const response = await this.api.post('/verify-national-id', idData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to verify national ID');
    }
  }

  // Step 2: Generate DID and DID Document
  async generateIdentity(web3, account) {
    try {
      // Generate DID
      const did = await generateDID(account);
      
      // Get public key from account
      const publicKey = await web3.eth.accounts.privateKeyToAccount(account).publicKey;
      
      // Create DID Document
      const didDocument = createDIDDocument(did, publicKey);
      
      // Anchor DID to blockchain
      const txHash = await anchorDIDToBlockchain(web3, did, didDocument, account);
      
      return {
        did,
        didDocument,
        txHash
      };
    } catch (error) {
      throw new Error(`Failed to generate identity: ${error.message}`);
    }
  }

  // Step 3: Create and issue verifiable credential
  async issueCredential(web3, did, verifiedData, account) {
    try {
      // Create Verifiable Credential
      const issuerDid = process.env.REACT_APP_ISSUER_DID;
      const vc = createVerifiableCredential(did, verifiedData, issuerDid);
      
      // Hash the VC for anchoring
      const vcHash = web3.utils.sha3(JSON.stringify(vc));
      
      // Anchor VC hash to blockchain
      const txHash = await anchorVCToBlockchain(web3, vcHash, account);
      
      // Store VC in user's wallet (this would typically be encrypted)
      await this.storeCredential(vc);
      
      return {
        vc,
        txHash
      };
    } catch (error) {
      throw new Error(`Failed to issue credential: ${error.message}`);
    }
  }

  // Step 4: Store credential in user's wallet
  async storeCredential(credential) {
    try {
      const response = await this.api.post('/store-credential', { credential });
      return response.data;
    } catch (error) {
      throw new Error('Failed to store credential');
    }
  }

  // Step 5: Verify biometric data (if provided)
  async verifyBiometric(biometricData) {
    try {
      const response = await this.api.post('/verify-biometric', biometricData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to verify biometric data');
    }
  }
}

export default new IdentityService(); 