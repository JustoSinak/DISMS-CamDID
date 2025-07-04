const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const UserCredentialSchema = new Schema({
  // Basic User Information for Credential Registration
  username: {
    type: String,
    trim: true,
    maxlength: 50,
    default: undefined
  },
  
  // Profile information for credential creation
  profile: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: 50
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: 50
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String
    },
    profileImage: {
      type: String,
      required: false
    }
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },

  // Wallet and Blockchain Information
  walletAddress: {
    type: String,
    required: false,
    trim: true
  },
  
  // Identity and Verification Information
  nationalId: {
    type: String,
    required: [true, 'National ID is required'],
    unique: true,
    trim: true
  },
  
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  
  // Document Information
  documents: [{
    type: {
      type: String,
      enum: ['national_id', 'passport', 'driver_license', 'birth_certificate'],
      required: true
    },
    documentHash: String,
    ipfsHash: String,
    verified: {
      type: Boolean,
      default: false
    },
    issuedAt: Date,
    expiresAt: Date
  }],
  
  // Verification Status
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  
  // Biometric Data (encrypted)
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
  
  // Cryptographic Keys (encrypted)
  cryptographicKeys: {
    masterSeed: String, // Encrypted
    identityKey: String, // Encrypted
    documentKey: String, // Encrypted
    sharingKey: String, // Encrypted
    recoveryPhrase: String // Encrypted
  },
  
  // DID Information
  did: {
    type: String,
    required: false,
    unique: true,
    sparse: true
  },
  
  blockchainId: {
    type: String,
    required: false,
    trim: true
  },
  
  // Status and Timestamps
  isActive: {
    type: Boolean,
    default: true
  },
  
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false
});

// Create indexes
UserCredentialSchema.index({ email: 1 }, { unique: true });
UserCredentialSchema.index({ nationalId: 1 }, { unique: true });
UserCredentialSchema.index({ did: 1 }, { unique: true, sparse: true });
UserCredentialSchema.index(
  { username: 1 },
  { 
    unique: true,
    sparse: true,
    partialFilterExpression: { username: { $type: "string" } }
  }
);
UserCredentialSchema.index({ userId: 1 });

// Pre-save middleware to hash password
UserCredentialSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
UserCredentialSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
UserCredentialSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    firstName: this.profile.firstName,
    lastName: this.profile.lastName,
    username: this.username,
    email: this.email,
    nationalId: this.nationalId,
    verificationStatus: this.verificationStatus,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('UserCredential', UserCredentialSchema); 