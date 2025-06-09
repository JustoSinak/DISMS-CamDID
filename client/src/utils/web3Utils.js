import Web3 from 'web3';
import { v4 as uuidv4 } from 'uuid';

export const generateDID = async (address) => {
  // Generate a unique identifier for the DID
  const uniqueId = uuidv4().replace(/-/g, '');
  return `did:cam:${uniqueId}`;
};

export const createDIDDocument = (did, publicKey) => {
  return {
    '@context': ['https://www.w3.org/ns/did/v1'],
    id: did,
    verificationMethod: [{
      id: `${did}#keys-1`,
      type: 'EcdsaSecp256k1VerificationKey2019',
      controller: did,
      publicKeyHex: publicKey
    }],
    authentication: [`${did}#keys-1`],
    assertionMethod: [`${did}#keys-1`]
  };
};

export const anchorDIDToBlockchain = async (web3, did, didDocument, account) => {
  try {
    // This would be replaced with your actual smart contract interaction
    const didRegistryContract = new web3.eth.Contract(DID_REGISTRY_ABI, DID_REGISTRY_ADDRESS);
    
    const tx = await didRegistryContract.methods.registerDID(
      did,
      web3.utils.sha3(JSON.stringify(didDocument))
    ).send({ from: account });
    
    return tx.transactionHash;
  } catch (error) {
    throw new Error(`Failed to anchor DID: ${error.message}`);
  }
};

export const createVerifiableCredential = (did, claims, issuerDid) => {
  const vc = {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://www.w3.org/2018/credentials/identity/v1'
    ],
    type: ['VerifiableCredential', 'NationalIdentityCredential'],
    issuer: issuerDid,
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: did,
      ...claims
    }
  };
  return vc;
};

export const anchorVCToBlockchain = async (web3, vcHash, account) => {
  try {
    // This would be replaced with your actual smart contract interaction
    const vcRegistryContract = new web3.eth.Contract(VC_REGISTRY_ABI, VC_REGISTRY_ADDRESS);
    
    const tx = await vcRegistryContract.methods.registerVC(
      vcHash
    ).send({ from: account });
    
    return tx.transactionHash;
  } catch (error) {
    throw new Error(`Failed to anchor VC: ${error.message}`);
  }
};

// Smart contract ABIs and addresses would be defined here
const DID_REGISTRY_ABI = [];
const DID_REGISTRY_ADDRESS = 'YOUR_DID_REGISTRY_CONTRACT_ADDRESS';
const VC_REGISTRY_ABI = [];
const VC_REGISTRY_ADDRESS = 'YOUR_VC_REGISTRY_CONTRACT_ADDRESS'; 