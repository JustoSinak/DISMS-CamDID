// models/Identity.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const IdentitySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    did: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    verificationLevel: {
        type: String,
        enum: ['basic', 'intermediate', 'advanced'],
        default: 'basic'
    },
    governmentId: {
        documentType: {
            type: String,
            enum: ['national_id', 'passport'],
            required: true
        },
        documentNumber: {
            type: String,
            required: true
        },
        documentImage: {
            type: String, // IPFS hash of the document
            required: true
        },
        verificationStatus: {
            type: String,
            enum: ['pending', 'verified', 'rejected'],
            default: 'pending'
        },
        verifiedAt: Date
    },
    biometrics: {
        fingerprint: {
            template: String, // Encrypted template
            verified: Boolean,
            verifiedAt: Date
        },
        facial: {
            template: String, // Encrypted template
            verified: Boolean,
            verifiedAt: Date
        },
        voice: {
            template: String, // Encrypted template
            verified: Boolean,
            verifiedAt: Date
        }
    },
    contactInfo: {
        phone: {
            number: String,
            verified: Boolean,
            verifiedAt: Date
        },
        email: {
            address: String,
            verified: Boolean,
            verifiedAt: Date
        },
        address: {
            street: String,
            city: String,
            state: String,
            country: String,
            postalCode: String,
            verified: Boolean,
            verifiedAt: Date
        }
    },
    cryptographicKeys: {
        masterSeed: String, // Encrypted
        identityKey: String, // Encrypted
        documentKey: String, // Encrypted
        sharingKey: String, // Encrypted
        recoveryPhrase: String // Encrypted
    },
    credentials: [{
        type: {
            type: String,
            enum: ['government_id', 'biometric', 'contact', 'address'],
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'active', 'revoked'],
            default: 'pending'
        },
        issuedAt: Date,
        expiresAt: Date,
        metadata: Schema.Types.Mixed
    }],
    merkleRoot: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
IdentitySchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Identity', IdentitySchema);