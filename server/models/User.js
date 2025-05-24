const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Government Identity Information
  nationalId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 8,
    maxlength: 20
  },
  
  // Basic User Information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    match: [/^(\+237|237)?[0-9]{8,9}$/, 'Please enter a valid Cameroon phone number']
  },
  
  // Verification Status
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Government Verification (will be expanded later)
  governmentVerification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date,
    verificationMethod: {
      type: String,
      enum: ['government_database', 'document_upload', 'in_person'],
      default: null
    }
  },
  
  // Digital Identity (will be expanded for DID integration)
  digitalIdentity: {
    didDocument: {
      type: String,
      default: null
    },
    walletAddress: {
      type: String,
      default: null
    },
    publicKey: {
      type: String,
      default: null
    }
  },
  
  // Security and Access
  role: {
    type: String,
    enum: ['citizen', 'issuer', 'verifier', 'admin'],
    default: 'citizen'
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  lastLogin: {
    type: Date,
    default: null
  },
  
  // Profile completion tracking
  profileCompletion: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  versionKey: false
});

// Index for faster queries
userSchema.index({ nationalId: 1 });
userSchema.index({ email: 1 });
userSchema.index({ phoneNumber: 1 });

// Pre-save middleware to calculate profile completion
userSchema.pre('save', function(next) {
  let completion = 0;
  const requiredFields = [
    'nationalId', 'email', 'firstName', 'lastName', 'phoneNumber'
  ];
  
  requiredFields.forEach(field => {
    if (this[field]) completion += 20;
  });
  
  // Additional completion for verification
  if (this.governmentVerification.isVerified) completion += 20;
  if (this.digitalIdentity.didDocument) completion += 20;
  
  this.profileCompletion = Math.min(completion, 100);
  next();
});

// Instance method to get public profile
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    isVerified: this.isVerified,
    profileCompletion: this.profileCompletion,
    role: this.role,
    createdAt: this.createdAt
  };
};

// Static method to find by national ID
userSchema.statics.findByNationalId = function(nationalId) {
  return this.findOne({ nationalId });
};

module.exports = mongoose.model('User', userSchema);