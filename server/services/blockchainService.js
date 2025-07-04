const Web3 = require('web3');
const DIDRegistryABI = require('../blockchain/build/contracts/DIDRegistry.json').abi;

const web3 = new Web3("http://localhost:8545"); // Ganache or testnet
const contractAddress = "0x..."; // Replace with actual deployed contract address

const didRegistry = new web3.eth.Contract(DIDRegistryABI, contractAddress);

exports.registerDIDOnChain = async (did) => {
  const accounts = await web3.eth.getAccounts();
  try {
    const tx = await didRegistry.methods.registerDID(did).send({
      from: accounts[0], gas: 300000
    });
    return tx.transactionHash;
  } catch (err) {
    throw new Error("Blockchain registration failed: " + err.message);
  }
};
