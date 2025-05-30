// identity-blockchain-app/server/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Basic User Information
  username: {
    type: String,
    trim: true,
    maxlength: 50,
    default: undefined
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
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // Verification Status
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Government Verification
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
  
  // Digital Identity
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
  timestamps: true,
  versionKey: false
});

// Create proper indexes with partial filter expression
userSchema.index({ email: 1 }, { unique: true });
userSchema.index(
  { username: 1 },
  { 
    unique: true,
    sparse: true,
    partialFilterExpression: { username: { $type: "string" } }
  }
);

// Pre-save middleware to calculate profile completion
userSchema.pre('save', function(next) {
  let completion = 0;
  const requiredFields = [
    'email', 'firstName', 'lastName'
  ];
  
  requiredFields.forEach(field => {
    if (this[field]) completion += 25;
  });
  
  if (this.governmentVerification.isVerified) completion += 25;
  if (this.digitalIdentity.didDocument) completion += 25;
  
  this.profileCompletion = Math.min(completion, 100);
  next();
});

// Instance method to get public profile
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    username: this.username,
    isVerified: this.isVerified,
    profileCompletion: this.profileCompletion,
    role: this.role,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('User', userSchema);
