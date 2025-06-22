const AdminRegistry = artifacts.require('AdminRegistry');

module.exports = async function (deployer) {
  await deployer.deploy(AdminRegistry);
}; 