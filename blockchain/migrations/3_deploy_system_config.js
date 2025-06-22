const SystemConfig = artifacts.require('SystemConfig');
const AdminRegistry = artifacts.require('AdminRegistry');

module.exports = async function (deployer) {
  const adminRegistry = await AdminRegistry.deployed();
  await deployer.deploy(SystemConfig, adminRegistry.address);
}; 