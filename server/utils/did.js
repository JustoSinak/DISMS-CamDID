const { ethers } = require('ethers');
const { createMerkleTree } = require('./merkleTree');

async function generateDID(address) {
  // Generate DID using Ethereum address
  return `did:camdid:ethereum:${address}`;
}

async function createDIDDocument(did, publicKeys, serviceEndpoints) {
  const didDocument = {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/suites/ed25519-2018/v1'
    ],
    id: did,
    controller: did,
    verificationMethod: publicKeys.map(key => ({
      id: `${did}#${key.id}`,
      type: key.type,
      controller: did,
      publicKeyHex: key.publicKeyHex
    })),
    service: serviceEndpoints.map(endpoint => ({
      id: `${did}#${endpoint.id}`,
      type: endpoint.type,
      serviceEndpoint: endpoint.url
    })),
    created: new Date().toISOString(),
    updated: new Date().toISOString()
  };

  return didDocument;
}

async function registerDIDOnChain(did, didDocument) {
  try {
    // Get the DID registry contract
    const provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const didRegistry = new ethers.Contract(
      process.env.DID_REGISTRY_ADDRESS,
      process.env.DID_REGISTRY_ABI,
      wallet
    );

    // Create Merkle tree for DID document
    const merkleTree = await createMerkleTree([didDocument]);
    const merkleRoot = merkleTree.getRoot();

    // Register DID on chain
    const tx = await didRegistry.registerDID(did, merkleRoot);
    await tx.wait();

    return {
      transactionHash: tx.hash,
      merkleRoot
    };
  } catch (error) {
    throw new Error(`Failed to register DID on chain: ${error.message}`);
  }
}

async function resolveDID(did) {
  try {
    // Get the DID registry contract
    const provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
    const didRegistry = new ethers.Contract(
      process.env.DID_REGISTRY_ADDRESS,
      process.env.DID_REGISTRY_ABI,
      provider
    );

    // Resolve DID from chain
    const didData = await didRegistry.resolveDID(did);
    
    return {
      did,
      merkleRoot: didData.merkleRoot,
      owner: didData.owner,
      lastUpdated: new Date(didData.lastUpdated.toNumber() * 1000)
    };
  } catch (error) {
    throw new Error(`Failed to resolve DID: ${error.message}`);
  }
}

module.exports = {
  generateDID,
  createDIDDocument,
  registerDIDOnChain,
  resolveDID
}; 