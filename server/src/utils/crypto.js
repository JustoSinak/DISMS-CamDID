const crypto = require('crypto');
const secp256k1 = require('secp256k1');
const { Buffer } = require('buffer');

class CryptoUtils {
    /**
     * Generate a new key pair for DID
     * @returns {Promise<Object>} Object containing public and private keys
     */
    async generateKeyPair() {
        return new Promise((resolve, reject) => {
            try {
                // Generate private key
                let privateKey;
                do {
                    privateKey = crypto.randomBytes(32);
                } while (!secp256k1.privateKeyVerify(privateKey));

                // Generate public key
                const publicKey = Buffer.from(secp256k1.publicKeyCreate(privateKey));

                resolve({
                    privateKey: privateKey.toString('hex'),
                    publicKey: publicKey.toString('hex')
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Sign data using a private key
     * @param {string} data - Data to sign
     * @param {string} privateKeyHex - Private key in hex format
     * @returns {string} Signature in hex format
     */
    sign(data, privateKeyHex) {
        try {
            const privateKey = Buffer.from(privateKeyHex, 'hex');
            const messageHash = crypto.createHash('sha256').update(data).digest();
            const signature = secp256k1.ecdsaSign(messageHash, privateKey);
            return Buffer.from(signature.signature).toString('hex');
        } catch (error) {
            throw new Error('Failed to sign data');
        }
    }

    /**
     * Verify a signature
     * @param {string} data - Original data
     * @param {string} signatureHex - Signature in hex format
     * @param {string} publicKeyHex - Public key in hex format
     * @returns {boolean} Whether the signature is valid
     */
    verify(data, signatureHex, publicKeyHex) {
        try {
            const messageHash = crypto.createHash('sha256').update(data).digest();
            const signature = Buffer.from(signatureHex, 'hex');
            const publicKey = Buffer.from(publicKeyHex, 'hex');

            return secp256k1.ecdsaVerify(signature, messageHash, publicKey);
        } catch (error) {
            return false;
        }
    }

    /**
     * Encrypt data using a public key
     * @param {string} data - Data to encrypt
     * @param {string} publicKeyHex - Public key in hex format
     * @returns {string} Encrypted data in hex format
     */
    encrypt(data, publicKeyHex) {
        try {
            const publicKey = crypto.createPublicKey({
                key: Buffer.from(publicKeyHex, 'hex'),
                format: 'der',
                type: 'spki'
            });

            const encrypted = crypto.publicEncrypt(
                {
                    key: publicKey,
                    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                    oaepHash: 'sha256'
                },
                Buffer.from(data)
            );

            return encrypted.toString('hex');
        } catch (error) {
            throw new Error('Failed to encrypt data');
        }
    }

    /**
     * Decrypt data using a private key
     * @param {string} encryptedDataHex - Encrypted data in hex format
     * @param {string} privateKeyHex - Private key in hex format
     * @returns {string} Decrypted data
     */
    decrypt(encryptedDataHex, privateKeyHex) {
        try {
            const privateKey = crypto.createPrivateKey({
                key: Buffer.from(privateKeyHex, 'hex'),
                format: 'der',
                type: 'pkcs8'
            });

            const decrypted = crypto.privateDecrypt(
                {
                    key: privateKey,
                    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                    oaepHash: 'sha256'
                },
                Buffer.from(encryptedDataHex, 'hex')
            );

            return decrypted.toString();
        } catch (error) {
            throw new Error('Failed to decrypt data');
        }
    }

    /**
     * Generate a hash of data
     * @param {string} data - Data to hash
     * @returns {string} Hash in hex format
     */
    hash(data) {
        return crypto.createHash('sha256')
            .update(data)
            .digest('hex');
    }
}

module.exports = new CryptoUtils(); 