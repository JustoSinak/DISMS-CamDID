const IdentityRegistry = artifacts.require("IdentityRegistry");
const CredentialVerifier = artifacts.require("CredentialVerifier");
const VerificationManager = artifacts.require("VerificationManager");

module.exports = async function(deployer) {
  // Deploy IdentityRegistry first as it's used by other contracts
  await deployer.deploy(IdentityRegistry);
  
  // Deploy CredentialVerifier
  await deployer.deploy(CredentialVerifier, IdentityRegistry.address);
  
  // Deploy VerificationManager
  await deployer.deploy(VerificationManager, CredentialVerifier.address);
};
