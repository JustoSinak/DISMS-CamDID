// models/Identity.js
const mongoose = require('mongoose');

const identitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    walletAddress: {
        type: String,
        required: true,
        unique: true
    },
    identityHash: {
        type: String,
        required: true,
        unique: true
    },
    metadataURI: {
        type: String,
        required: true
    },
    personalInfo: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        dateOfBirth: { type: Date, required: true },
        nationality: { type: String, required: true }
    },
    attributes: [{
        type: { type: String, required: true },
        hash: { type: String, required: true },
        value: { type: String },
        isPrivate: { type: Boolean, default: true },
        verified: { type: Boolean, default: false },
        verifier: { type: String },
        verifiedAt: { type: Date },
        addedAt: { type: Date, default: Date.now }
    }],
    credentials: [{
        credentialHash: { type: String, required: true },
        issuer: { type: String, required: true },
        credentialType: { type: String, required: true },
        issuedAt: { type: Date, required: true },
        expiresAt: { type: Date },
        revoked: { type: Boolean, default: false }
    }],
    blockchainStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'failed'],
        default: 'pending'
    },
    transactionHash: { type: String },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Identity', identitySchema);