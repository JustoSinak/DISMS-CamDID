const EmergencyManager = artifacts.require('EmergencyManager');
const AdminRegistry = artifacts.require('AdminRegistry');

module.exports = async function (deployer) {
  const adminRegistry = await AdminRegistry.deployed();
  await deployer.deploy(EmergencyManager, adminRegistry.address);
}; 