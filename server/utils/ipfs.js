const { Buffer } = require('buffer');

let ipfs;

async function getIpfsClient() {
  if (!ipfs) {
    const { create } = await import('ipfs-http-client');
    ipfs = create({
      host: process.env.IPFS_HOST || 'ipfs.infura.io',
      port: process.env.IPFS_PORT || 5001,
      protocol: process.env.IPFS_PROTOCOL || 'https'
    });
  }
  return ipfs;
}

async function uploadToIPFS(data) {
  try {
    const ipfsClient = await getIpfsClient();
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(JSON.stringify(data));
    const result = await ipfsClient.add(buffer);
    return result.path;
  } catch (error) {
    throw new Error(`IPFS upload failed: ${error.message}`);
  }
}

async function getFromIPFS(hash) {
  try {
    const ipfsClient = await getIpfsClient();
    const stream = ipfsClient.cat(hash);
    let data = '';
    for await (const chunk of stream) {
      data += chunk.toString();
    }
    try {
      return JSON.parse(data);
    } catch {
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
