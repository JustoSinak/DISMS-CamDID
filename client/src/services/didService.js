import { DIDRegistry } from '../contracts/DIDRegistry';
import { IdentityRegistry } from '../contracts/IdentityRegistry';
import { AccessControl } from '../contracts/AccessControl';

export class DIDService {
  constructor() {
    this.didRegistry = new DIDRegistry();
    this.identityRegistry = new IdentityRegistry();
    this.accessControl = new AccessControl();
  }

  async createDID(account, data) {
    // Generate DID
    const did = `did:eth:${account}`;
    
    // Create DID document
    const didDoc = {
      id: did,
      verificationMethod: [
        {
          id: `${did}#key-1`,
          type: 'Ed25519VerificationKey2020',
          controller: did,
          publicKeyHex: await this.generatePublicKey(account)
        }
      ],
      authentication: [`${did}#key-1`],
      service: [
        {
          id: `${did}#vc-service`,
          type: 'VerifiableCredentialService',
          serviceEndpoint: window.location.origin
        }
      ]
    };

    // Register DID on blockchain
    await this.didRegistry.registerDID(did, JSON.stringify(didDoc));

    // Create identity in IdentityRegistry
    await this.identityRegistry.createIdentity(did, data);

    return did;
  }

  async resolveDID(did) {
    const didDoc = await this.didRegistry.resolveDID(did);
    return JSON.parse(didDoc);
  }

  async generatePublicKey(account) {
    const provider = window.ethereum;
    const signer = provider.getSigner();
    const publicKey = await signer.getPublicKey();
    return publicKey;
  }

  async getPublicKey(did) {
    const didDoc = await this.resolveDID(did);
    return didDoc.verificationMethod[0].publicKeyHex;
  }

  async checkAccess(did, role) {
    return this.accessControl.hasRole(role, did);
  }
}
