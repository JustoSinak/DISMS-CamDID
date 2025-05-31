const mongoose = require('mongoose');

const didDocumentSchema = new mongoose.Schema({
    did: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    controller: {
        type: String,
        required: true
    },
    publicKey: [{
        id: String,
        type: {
            type: String,
            enum: ['Secp256k1VerificationKey2018'],
            default: 'Secp256k1VerificationKey2018'
        },
        controller: String,
        publicKeyHex: String
    }],
    authentication: [{
        type: String
    }],
    service: [{
        id: String,
        type: String,
        serviceEndpoint: String
    }],
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    },
    active: {
        type: Boolean,
        default: true
    },
    // Reference to the blockchain transaction that created/updated this document
    blockchainRef: {
        transactionHash: String,
        blockNumber: Number,
        timestamp: Date
    }
}, {
    timestamps: true
});

// Update the 'updated' field before saving
didDocumentSchema.pre('save', function(next) {
    this.updated = new Date();
    next();
});

// Indexes for efficient querying
didDocumentSchema.index({ controller: 1 });
didDocumentSchema.index({ active: 1 });
didDocumentSchema.index({ 'blockchainRef.transactionHash': 1 });

// Virtual getter for the document age
didDocumentSchema.virtual('age').get(function() {
    return (new Date() - this.created) / 1000; // Age in seconds
});

// Instance method to deactivate a DID document
didDocumentSchema.methods.deactivate = function(transactionHash) {
    this.active = false;
    this.blockchainRef = {
        ...this.blockchainRef,
        transactionHash,
        timestamp: new Date()
    };
    return this.save();
};

// Instance method to update blockchain reference
didDocumentSchema.methods.updateBlockchainRef = function(transactionHash, blockNumber) {
    this.blockchainRef = {
        transactionHash,
        blockNumber,
        timestamp: new Date()
    };
    return this.save();
};

// Static method to find active DIDs by controller
didDocumentSchema.statics.findByController = function(controller) {
    return this.find({
        controller,
        active: true
    });
};

// Static method to find DID document by transaction hash
didDocumentSchema.statics.findByTransaction = function(transactionHash) {
    return this.findOne({
        'blockchainRef.transactionHash': transactionHash
    });
};

const DidDocument = mongoose.model('DidDocument', didDocumentSchema);

module.exports = DidDocument; 