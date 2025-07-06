// server/models/BiometricCredential.js - Biometric credential model
const mongoose = require('mongoose');

const biometricCredentialSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  credentialId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  rawId: {
    type: [Number], // Array of bytes
    required: true
  },
  biometricType: {
    type: String,
    enum: ['fingerprint', 'face', 'voice'],
    required: true,
    index: true
  },
  publicKey: {
    type: Buffer, // Stored securely
    required: true
  },
  counter: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true,
    index: true
  },
  registeredAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastUsed: {
    type: Date,
    default: null
  },
  deactivatedAt: {
    type: Date,
    default: null
  },
  metadata: {
    deviceInfo: {
      userAgent: String,
      platform: String,
      vendor: String
    },
    registrationIP: String,
    lastUsedIP: String,
    usageCount: {
      type: Number,
      default: 0
    },
    failedAttempts: {
      type: Number,
      default: 0
    },
    lastFailedAttempt: Date
  },
  // Security settings
  security: {
    requireUserVerification: {
      type: Boolean,
      default: true
    },
    maxFailedAttempts: {
      type: Number,
      default: 5
    },
    lockoutDuration: {
      type: Number,
      default: 300000 // 5 minutes in milliseconds
    },
    isLocked: {
      type: Boolean,
      default: false
    },
    lockedUntil: Date
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for performance
biometricCredentialSchema.index({ userId: 1, biometricType: 1 });
biometricCredentialSchema.index({ userId: 1, active: 1 });
biometricCredentialSchema.index({ credentialId: 1, active: 1 });

// Instance methods
biometricCredentialSchema.methods.incrementUsage = function() {
  this.lastUsed = new Date();
  this.counter += 1;
  this.metadata.usageCount += 1;
  return this.save();
};

biometricCredentialSchema.methods.recordFailedAttempt = function() {
  this.metadata.failedAttempts += 1;
  this.metadata.lastFailedAttempt = new Date();
  
  // Check if should be locked
  if (this.metadata.failedAttempts >= this.security.maxFailedAttempts) {
    this.security.isLocked = true;
    this.security.lockedUntil = new Date(Date.now() + this.security.lockoutDuration);
  }
  
  return this.save();
};

biometricCredentialSchema.methods.unlock = function() {
  this.security.isLocked = false;
  this.security.lockedUntil = null;
  this.metadata.failedAttempts = 0;
  return this.save();
};

biometricCredentialSchema.methods.isCurrentlyLocked = function() {
  if (!this.security.isLocked) return false;
  if (!this.security.lockedUntil) return true;
  
  return new Date() < this.security.lockedUntil;
};

biometricCredentialSchema.methods.deactivate = function(reason = 'User requested') {
  this.active = false;
  this.deactivatedAt = new Date();
  this.metadata.deactivationReason = reason;
  return this.save();
};

// Static methods
biometricCredentialSchema.statics.findActiveByUser = function(userId, biometricType = null) {
  const query = { userId, active: true };
  if (biometricType) {
    query.biometricType = biometricType;
  }
  return this.find(query);
};

biometricCredentialSchema.statics.findByCredentialId = function(credentialId) {
  return this.findOne({ credentialId, active: true });
};

biometricCredentialSchema.statics.getUserBiometricTypes = function(userId) {
  return this.distinct('biometricType', { userId, active: true });
};

// Virtual for checking if credential is expired (if needed)
biometricCredentialSchema.virtual('isExpired').get(function() {
  // Biometric credentials don't typically expire, but this could be used
  // for compliance or security policies
  return false;
});

// Pre-save middleware
biometricCredentialSchema.pre('save', function(next) {
  // Auto-unlock if lockout period has passed
  if (this.security.isLocked && this.security.lockedUntil && new Date() >= this.security.lockedUntil) {
    this.security.isLocked = false;
    this.security.lockedUntil = null;
    this.metadata.failedAttempts = 0;
  }
  
  next();
});

// Post-save middleware for logging
biometricCredentialSchema.post('save', function(doc) {
  if (this.isNew) {
    console.log(`New biometric credential registered: ${doc.biometricType} for user ${doc.userId}`);
  }
});

module.exports = mongoose.model('BiometricCredential', biometricCredentialSchema);
