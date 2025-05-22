const { v4: uuidv4 } = require('uuid');
const { registerDIDOnChain } = require('./blockchainService');

exports.generateDID = async (nationalId) => {
  const did = `did:cam:${uuidv4()}-${nationalId}`;
  await registerDIDOnChain(did);
  return did;
};

