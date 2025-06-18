const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CredentialSchema = new Schema({
  identityId: {
    type: Schema.Types.ObjectId,
    ref: 'Identity',
    required: true
  },
  type: {
    type: String,
    enum: [
      'government_id',
      'passport',
      'birth_certificate',
      'diploma',
      'certificate',
      'driving_license',
      'professional_certification',
      'vaccination',
      'medical_record',
      'bank_statement',
      'credit_report'
    ],
    required: true
  },
  category: {
    type: String,
    enum: [
      'government',
      'educational',
      'professional',
      'health',
      'financial'
    ],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked'],
    default: 'active'
  },
  issuer: {
    name: String,
    did: String,
    signature: String
  },
  metadata: {
    title: String,
    description: String,
    issueDate: Date,
    expirationDate: Date,
    attributes: [{
      name: String,
      value: String,
      isPrivate: {
        type: Boolean,
        default: true
      }
    }]
  },
  document: {
    ipfsHash: String,
    encryptionKey: String, // Encrypted document key
    mimeType: String,
    size: Number
  },
  blockchain: {
    transactionHash: String,
    blockNumber: Number,
    merkleRoot: String,
    merkleProof: [String]
  },
  sharing: {
    accessControl: {
      type: String,
      enum: ['private', 'public', 'restricted'],
      default: 'private'
    },
    allowedViewers: [{
      did: String,
      permissions: [String],
      expiresAt: Date
    }],
    sharingHistory: [{
      viewerDid: String,
      timestamp: Date,
      purpose: String,
      attributes: [String]
    }]
  },
  verification: {
    lastVerified: Date,
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'failed'],
      default: 'pending'
    },
    verificationHistory: [{
      timestamp: Date,
      status: String,
      verifier: String,
      details: Schema.Types.Mixed
    }]
  },
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
CredentialSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient querying
CredentialSchema.index({ identityId: 1, type: 1 });
CredentialSchema.index({ 'sharing.allowedViewers.did': 1 });
CredentialSchema.index({ 'blockchain.transactionHash': 1 });

module.exports = mongoose.model('Credential', CredentialSchema); 