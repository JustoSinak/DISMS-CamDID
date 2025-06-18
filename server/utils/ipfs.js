const { create } = require('ipfs-http-client');
const { Buffer } = require('buffer');

// Initialize IPFS client
const ipfs = create({
  host: process.env.IPFS_HOST || 'ipfs.infura.io',
  port: process.env.IPFS_PORT || 5001,
  protocol: process.env.IPFS_PROTOCOL || 'https'
});

async function uploadToIPFS(data) {
  try {
    // If data is a file buffer, use it directly
    // If data is a string or object, convert to buffer
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(JSON.stringify(data));
    
    const result = await ipfs.add(buffer);
    return result.path;
  } catch (error) {
    throw new Error(`IPFS upload failed: ${error.message}`);
  }
}

async function getFromIPFS(hash) {
  try {
    const stream = ipfs.cat(hash);
    let data = '';
    
    for await (const chunk of stream) {
      data += chunk.toString();
    }
    
    try {
      // Try to parse as JSON
      return JSON.parse(data);
    } catch {
      // Return as string if not JSON
      return data;
    }
  } catch (error) {
    throw new Error(`IPFS retrieval failed: ${error.message}`);
  }
}

module.exports = {
  uploadToIPFS,
  getFromIPFS
}; 