import { cryptoService } from './cryptoService';
import { DIDService } from './didService';
import { IdentityRegistry } from '../contracts/IdentityRegistry';

export class VCService {
  constructor() {
    this.didService = new DIDService();
    this.identityRegistry = new IdentityRegistry();
  }

  async issueCredential(issuerDid, credentialData) {
    // Generate credential ID
    const credentialId = `urn:uuid:${crypto.randomUUID()}`;

    // Create credential
    const credential = {
      id: credentialId,
      type: ['VerifiableCredential'],
      issuer: issuerDid,
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: credentialData.subjectDid,
        ...credentialData.claims
      }
    };

    // Encrypt credential
    const encryptedCredential = await cryptoService.encryptCredential(credential);

    // Sign credential
    const signature = await this.signCredential(encryptedCredential, issuerDid);

    // Store on blockchain
    await this.identityRegistry.issueCredential(issuerDid, credentialId, encryptedCredential, signature);

    return {
      id: credentialId,
      ...credential
    };
  }

  async verifyCredential(credentialId) {
    const credential = await this.identityRegistry.getCredential(credentialId);
    
    // Check if credential exists and is not revoked
    if (!credential || credential.revoked) {
      return false;
    }

    // Verify signature
    const issuerDid = credential.issuer;
    const publicKey = await this.didService.getPublicKey(issuerDid);
    const isValid = await cryptoService.verifyCredential(credential, publicKey);

    return isValid;
  }

  async revokeCredential(credentialId) {
    const credential = await this.identityRegistry.getCredential(credentialId);
    if (!credential) {
      throw new Error('Credential not found');
    }

    await this.identityRegistry.revokeCredential(credentialId);
  }

  async createShareLink(credentialId, recipient) {
    const credential = await this.identityRegistry.getCredential(credentialId);
    if (!credential) {
      throw new Error('Credential not found');
    }

    // Generate temporary access token
    const token = await cryptoService.generateShareToken(credentialId, recipient);

    // Create share link
    const shareLink = `${window.location.origin}/share?credentialId=${credentialId}&token=${token}`;

    return shareLink;
  }

  async signCredential(credential, issuerDid) {
    const provider = window.ethereum;
    const signer = provider.getSigner();
    
    // Convert credential to JSON string
    const credentialString = JSON.stringify(credential);
    
    // Sign using issuer's key
    const signature = await signer.signMessage(credentialString);
    
    return signature;
  }
}
