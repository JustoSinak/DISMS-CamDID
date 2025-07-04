const IdentityRegistry = artifacts.require("IdentityRegistry");

module.exports = async function (deployer, network, accounts) {
  // Deploy IdentityRegistry contract
  await deployer.deploy(IdentityRegistry);
  
  // Set owner as the deployer account
  const identityRegistry = await IdentityRegistry.deployed();
  await identityRegistry.transferOwnership(accounts[0]);
  
  console.log(`IdentityRegistry deployed at: ${identityRegistry.address}`);
  console.log(`Owner set to: ${accounts[0]}`);
};
