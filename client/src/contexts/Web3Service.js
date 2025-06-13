// services/web3Service.js
import Web3 from 'web3';

class Web3Service {
  constructor() {
    this.web3 = null;
    this.contracts = {};
  }

  // Initialize Web3 instance
  async initialize() {
    if (window.ethereum) {
      this.web3 = new Web3(window.ethereum);
      return this.web3;
    } else {
      throw new Error('Web3 wallet not found');
    }
  }

  // Get current account
  async getCurrentAccount() {
    if (!this.web3) await this.initialize();
    const accounts = await this.web3.eth.getAccounts();
    return accounts[0];
  }

  // Create identity hash
  createIdentityHash(data) {
    return this.web3.utils.keccak256(JSON.stringify(data));
  }

  // Create attribute hash
  createAttributeHash(value) {
    return this.web3.utils.keccak256(value.toString());
  }

  // Estimate gas for transaction
  async estimateGas(contract, method, params, from) {
    try {
      const gasEstimate = await contract.methods[method](...params)
        .estimateGas({ from });
      return Math.floor(gasEstimate * 1.2); // Add 20% buffer
    } catch (error) {
      console.error('Gas estimation error:', error);
      return 500000; // Fallback gas limit
    }
  }

  // Send transaction with proper error handling
  async sendTransaction(contract, method, params, from, value = 0) {
    try {
      const gas = await this.estimateGas(contract, method, params, from);
      
      const transaction = await contract.methods[method](...params)
        .send({
          from,
          gas,
          value
        });

      return transaction;
    } catch (error) {
      console.error('Transaction error:', error);
      throw this.parseTransactionError(error);
    }
  }

  // Parse transaction errors for user-friendly messages
  parseTransactionError(error) {
    if (error.message.includes('User denied')) {
      return new Error('Transaction was cancelled by user');
    } else if (error.message.includes('insufficient funds')) {
      return new Error('Insufficient funds for transaction');
    } else if (error.message.includes('Identity already exists')) {
      return new Error('Identity already exists for this wallet');
    } else if (error.message.includes('revert')) {
      return new Error('Transaction failed: ' + error.message);
    } else {
      return new Error('Transaction failed: ' + error.message);
    }
  }

  // Validate Ethereum address
  isValidAddress(address) {
    return this.web3.utils.isAddress(address);
  }

  // Convert Wei to Ether
  weiToEther(wei) {
    return this.web3.utils.fromWei(wei, 'ether');
  }

  // Convert Ether to Wei
  etherToWei(ether) {
    return this.web3.utils.toWei(ether, 'ether');
  }
}

export default new Web3Service();