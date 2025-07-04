const { v4: uuidv4 } = require('uuid');
const { registerDIDOnChain } = require('./blockchainService');

exports.generateDID = async () => {
  const did = `did:cam:${uuidv4()}`;
  await registerDIDOnChain(did);
  return did;
};

