const mongoose = require('mongoose');

const CredentialTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['identity', 'education', 'employment', 'professional', 'health', 'other']
  },
  issuer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  version: {
    type: String,
    required: true,
    default: '1.0.0'
  },
  schema: {
    type: Map,
    of: {
      type: {
        type: String,
        enum: ['string', 'number', 'date', 'boolean', 'object', 'array'],
        required: true
      },
      required: {
        type: Boolean,
        default: false
      },
      description: String,
      validation: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
      }
    },
    required: true
  },
  displayConfig: {
    icon: String,
    color: String,
    layout: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  validityPeriod: {
    type: Number, // in days
    required: true
  },
  allowsRenewal: {
    type: Boolean,
    default: true
  },
  renewalRules: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  requiredDocuments: [{
    name: String,
    description: String,
    required: Boolean
  }]
}, {
  timestamps: true
});

// Add indexes for frequent queries
CredentialTemplateSchema.index({ issuer: 1, type: 1 });
CredentialTemplateSchema.index({ name: 1, version: 1 });

module.exports = mongoose.model('CredentialTemplate', CredentialTemplateSchema); 