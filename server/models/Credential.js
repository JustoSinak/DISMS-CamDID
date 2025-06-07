const mongoose = require('mongoose');
const crypto = require('crypto');

const CredentialSchema = new mongoose.Schema({
  holder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  issuer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['identity', 'education', 'employment', 'professional', 'health', 'other']
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'revoked', 'expired'],
    default: 'active'
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    required: true
  },
  credentialData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    required: true
  },
  issuanceDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  expirationDate: {
    type: Date
  },
  revocationDate: {
    type: Date
  },
  revocationReason: {
    type: String
  },
  proof: {
    type: {
      type: String,
      required: true,
      enum: ['JWT', 'Ed25519Signature2018']
    },
    created: {
      type: Date,
      required: true,
      default: Date.now
    },
    verificationMethod: {
      type: String,
      required: true
    },
    signature: {
      type: String,
      required: true
    }
  },
  verificationHistory: [{
    verifier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verificationDate: {
      type: Date,
      default: Date.now
    },
    verificationResult: {
      type: Boolean,
      required: true
    },
    verificationPurpose: String
  }]
}, {
  timestamps: true
});

// Add indexes for frequent queries
CredentialSchema.index({ holder: 1, status: 1 });
CredentialSchema.index({ issuer: 1, status: 1 });
CredentialSchema.index({ type: 1 });
CredentialSchema.index({ 'verificationHistory.verifier': 1 });

// Virtual for checking if credential is expired
CredentialSchema.virtual('isExpired').get(function() {
  if (!this.expirationDate) return false;
  return new Date() > this.expirationDate;
});

// Pre-save middleware to update status if expired
CredentialSchema.pre('save', function(next) {
  if (this.expirationDate && new Date() > this.expirationDate) {
    this.status = 'expired';
  }
  next();
});

// Instance method for cryptographic validation
CredentialSchema.methods.validateSignature = async function(publicKey) {
  try {
    // Implementation would verify the issuerSignature using the issuer's public key
    return true; // Placeholder
  } catch (error) {
    return false;
  }
};

// Instance method for schema validation
CredentialSchema.methods.validateSchema = async function() {
  // Implementation would validate claims against schemaReference
  return true; // Placeholder
};

// Instance method for revocation
CredentialSchema.methods.revoke = async function(reason, revokedBy) {
  this.status = 'revoked';
  this.revocationReason = reason;
  this.revocationDate = new Date();
  // Implementation would update blockchain revocation registry
  return this.save();
};

// Instance method for renewal
CredentialSchema.methods.renew = async function(newExpirationDate) {
  const oldExpirationDate = this.expirationDate;
  
  // Update credential
  this.expirationDate = newExpirationDate;
  this.issuanceDate = new Date();
  
  return this.save();
};

// Static method to find valid credentials by holder
CredentialSchema.statics.findValidByHolder = function(holder) {
  return this.find({
    holder,
    status: 'active',
    expirationDate: { $gt: new Date() }
  });
};

module.exports = mongoose.model('Credential', CredentialSchema); 