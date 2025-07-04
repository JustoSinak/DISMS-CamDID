import { jsSHA } from 'jssha';

export const generateDID = (cniNumber, publicKey) => {
  // Generate SHA-256 hash of CNI number
  const shaObj = new jsSHA('SHA-256', 'TEXT');
  shaObj.update(cniNumber);
  const cniHash = shaObj.getHash('HEX');
  
  // Create DID in format: did:cmr:<cniHash>:<publicKey>
  const did = `did:cmr:${cniHash}:${publicKey.slice(2, 10)}`;
  
  return did;
};

export const validateDID = (did) => {
  const didRegex = /^did:cmr:[0-9a-fA-F]{64}:[0-9a-fA-F]{8}$/;
  return didRegex.test(did);
};

export const extractCNIHash = (did) => {
  if (!validateDID(did)) {
    throw new Error('Invalid DID format');
  }
  return did.split(':')[2];
};

export const generateVerificationMethod = (did) => {
  return `${did}#key-1`;
};
