const Blockchain = require("../models/Blockchain");
const RevokedCredential = require("../models/RevokedCredential");

const mineBlock = async (req, res) => {
    try {
        const { transactions } = req.body;
        
        if (!Array.isArray(transactions) || transactions.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Transactions array is required and cannot be empty"
            });
        }

        // Get the latest block
        const latestBlock = await Blockchain.getLatestBlock();
        const newBlockIndex = latestBlock ? latestBlock.index + 1 : 0;
        const previousHash = latestBlock ? latestBlock.hash : '0'.repeat(64);
        
        // Get current difficulty
        const difficulty = await Blockchain.getDifficulty();

        // Create new block
        const newBlock = new Blockchain({
            index: newBlockIndex,
            timestamp: new Date(),
            transactions,
            previousHash,
            difficulty,
            nonce: 0,
            hash: ''
        });

        // Mine the block (Proof of Work)
        let nonce = 0;
        while (true) {
            newBlock.nonce = nonce;
            newBlock.hash = newBlock.calculateHash();
            
            if (newBlock.hasValidProofOfWork()) {
                break;
            }
            nonce++;
        }

        // Save the block
        await newBlock.save();

        res.json({
            success: true,
            message: "Block mined successfully",
            block: newBlock
        });
    } catch (error) {
        console.error("Error mining block:", error);
        res.status(500).json({
            success: false,
            message: "Error mining block"
        });
    }
};

const getMiningStats = async (req, res) => {
    try {
        const totalBlocks = await Blockchain.countDocuments();
        const latestBlock = await Blockchain.getLatestBlock();
        const difficulty = await Blockchain.getDifficulty();
        
        // Get mining rate (blocks per hour) for the last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const blocksLast24h = await Blockchain.countDocuments({
            timestamp: { $gte: oneDayAgo }
        });
        const blockRate = blocksLast24h / 24; // blocks per hour

        res.json({
            success: true,
            stats: {
                totalBlocks,
                lastBlockMined: latestBlock ? latestBlock.timestamp : null,
                difficulty,
                blockRate,
                blocksLast24h
            }
        });
    } catch (error) {
        console.error("Error fetching mining stats:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching mining statistics"
        });
    }
};

const revokeCredential = async (req, res) => {
    try {
        const { credentialId, reason } = req.body;

        // Create revocation record
        const revokedCredential = new RevokedCredential({
            credentialId,
            reason,
            revokedBy: req.user.id,
            revokedAt: new Date()
        });
        await revokedCredential.save();

        // Create revocation transaction
        const transaction = {
            type: 'CREDENTIAL_REVOKE',
            credentialId,
            issuerId: req.user.id,
            recipientId: req.user.id, // In revocation, issuer and recipient are the same
            data: {
                reason,
                revokedAt: new Date()
            }
        };

        // Mine a new block with the revocation transaction
        const mineResponse = await mineBlock({ body: { transactions: [transaction] }, user: req.user });
        
        res.json({
            success: true,
            message: "Credential revoked successfully",
            revocation: revokedCredential,
            block: mineResponse.block
        });
    } catch (error) {
        console.error("Error revoking credential:", error);
        res.status(500).json({
            success: false,
            message: "Error revoking credential"
        });
    }
};

const getRevokedCredentials = async (req, res) => {
    try {
        const revokedCredentials = await RevokedCredential.find()
            .populate("revokedBy", "email")
            .sort({ revokedAt: -1 });

        res.json({
            success: true,
            revokedCredentials
        });
    } catch (error) {
        console.error("Error fetching revoked credentials:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching revoked credentials"
        });
    }
};

module.exports = {
    mineBlock,
    getMiningStats,
    revokeCredential,
    getRevokedCredentials
};