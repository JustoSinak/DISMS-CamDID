const mongoose = require('mongoose');
const { Schema } = mongoose;

const credentialSchema = new Schema({
  did: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true
  },
  issuer: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  encryptedData: {
    type: String,
    required: true
  },
  encryptionKey: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'revoked'],
    default: 'active'
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  revokedAt: {
    type: Date
  },
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for searching by DID
credentialSchema.index({ did: 1 });

// Index for searching by issuer
credentialSchema.index({ issuer: 1 });

// Index for searching by subject
credentialSchema.index({ subject: 1 });

module.exports = mongoose.model('Credential', credentialSchema);
