const Web3 = require('web3');
const { IdentityRegistry } = require('../contracts/IdentityRegistry');
const { config } = require('../config');

const web3 = new Web3(config.blockchain.provider);

// Initialize contract instance
const identityContract = new web3.eth.Contract(
  IdentityRegistry.abi,
  config.blockchain.contractAddress
);

// Event listeners
identityContract.events.IdentityCreated((error, event) => {
  if (error) {
    console.error('Error in IdentityCreated event:', error);
    return;
  }
  console.log('New identity created:', event.returnValues);
});

identityContract.events.CredentialIssued((error, event) => {
  if (error) {
    console.error('Error in CredentialIssued event:', error);
    return;
  }
  console.log('New credential issued:', event.returnValues);
});

// Create identity on blockchain
async function createIdentity(did) {
  try {
    const accounts = await web3.eth.getAccounts();
    const tx = await identityContract.methods.createIdentity(did).send({
      from: accounts[0],
      gas: 3000000
    });
    return tx;
  } catch (error) {
    console.error('Error creating identity:', error);
    throw error;
  }
}

// Issue credential on blockchain
async function issueCredential(did, credentialId, issuer, subject) {
  try {
    const accounts = await web3.eth.getAccounts();
    const tx = await identityContract.methods.issueCredential(
      did,
      credentialId,
      issuer,
      subject
    ).send({
      from: accounts[0],
      gas: 3000000
    });
    return tx;
  } catch (error) {
    console.error('Error issuing credential:', error);
    throw error;
  }
}

// Revoke credential on blockchain
async function revokeCredential(did, credentialId) {
  try {
    const accounts = await web3.eth.getAccounts();
    const tx = await identityContract.methods.revokeCredential(
      did,
      credentialId
    ).send({
      from: accounts[0],
      gas: 3000000
    });
    return tx;
  } catch (error) {
    console.error('Error revoking credential:', error);
    throw error;
  }
}

// Get identity status from blockchain
async function getIdentityStatus(did) {
  try {
    const [exists, revoked, createdAt, updatedAt] = await identityContract.methods
      .getIdentity(did)
      .call();
    return {
      exists,
      revoked,
      createdAt,
      updatedAt
    };
  } catch (error) {
    console.error('Error getting identity status:', error);
    throw error;
  }
}

// Get credential status from blockchain
async function getCredentialStatus(did, credentialId) {
  try {
    const [credId, issuer, subject, revoked, issuedAt, revokedAt] = await identityContract.methods
      .getCredential(did, credentialId)
      .call();
    return {
      credentialId: credId,
      issuer,
      subject,
      revoked,
      issuedAt,
      revokedAt
    };
  } catch (error) {
    console.error('Error getting credential status:', error);
    throw error;
  }
}

module.exports = {
  createIdentity,
  issueCredential,
  revokeCredential,
  getIdentityStatus,
  getCredentialStatus
};
