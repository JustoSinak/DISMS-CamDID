const mongoose = require('mongoose');

const verificationRecordSchema = new mongoose.Schema({
  verifier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  credential: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Credential',
    required: true
  },
  verificationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    default: 'PENDING'
  },
  verificationMethod: {
    type: String,
    enum: ['QR_CODE', 'DIRECT', 'API'],
    required: true
  },
  verificationPurpose: {
    type: String,
    required: true
  },
  verificationResult: {
    isValid: {
      type: Boolean,
      required: true
    },
    details: {
      type: String
    }
  },
  metadata: {
    location: String,
    deviceInfo: String,
    ipAddress: String
  }
}, {
  timestamps: true
});

// Add indexes for common queries
verificationRecordSchema.index({ verifier: 1, verificationDate: -1 });
verificationRecordSchema.index({ citizen: 1, verificationDate: -1 });
verificationRecordSchema.index({ credential: 1 });

// Instance methods
verificationRecordSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  return this.save();
};

// Static methods
verificationRecordSchema.statics.getVerificationHistory = function(userId, role) {
  const query = role === 'verifier' ? { verifier: userId } : { citizen: userId };
  return this.find(query)
    .sort({ verificationDate: -1 })
    .populate('verifier', 'name email')
    .populate('citizen', 'name email')
    .populate('credential');
};

verificationRecordSchema.statics.createVerificationRecord = async function(data) {
  const record = new this(data);
  await record.save();
  return record;
};

const VerificationRecord = mongoose.model('VerificationRecord', verificationRecordSchema);

module.exports = VerificationRecord; 