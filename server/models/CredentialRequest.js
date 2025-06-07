const mongoose = require('mongoose');

const CredentialRequestSchema = new mongoose.Schema({
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  issuer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  credentialType: {
    type: String,
    required: true,
    enum: ['identity', 'education', 'employment', 'professional', 'health', 'other']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected', 'revoked'],
    default: 'pending'
  },
  metadata: {
    type: Map,
    of: String,
    default: {}
  },
  purpose: {
    type: String,
    required: true
  },
  supportingDocuments: [{
    documentType: String,
    documentHash: String,
    uploadDate: Date
  }],
  requestDate: {
    type: Date,
    default: Date.now
  },
  responseDate: {
    type: Date
  },
  responseMessage: {
    type: String
  },
  issuedCredential: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Credential'
  }
}, {
  timestamps: true
});

// Add indexes for frequent queries
CredentialRequestSchema.index({ citizen: 1, status: 1 });
CredentialRequestSchema.index({ issuer: 1, status: 1 });
CredentialRequestSchema.index({ credentialType: 1 });

module.exports = mongoose.model('CredentialRequest', CredentialRequestSchema); 