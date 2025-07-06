// identity-blockchain-app/server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
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
  walletAddress: {
    type: String,
    required: false,
    trim: true
  },
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
      required: false
    },
    address: {
      type: Object,
      required: false
    },
    profileImage: {
      type: String,
      required: false
    }
  },
  verification: {
    emailVerified: {
      type: Boolean,
      default: false
    },
    phoneVerified: {
      type: Boolean,
      default: false
    },
    identityVerified: {
      type: Boolean,
      default: false
    },
    verificationLevel: {
      type: Number,
      default: 0
    }
  },
  role: {
    type: String,
    enum: ['citizen', 'verifier', 'issuer'],
    required: [true, 'Role is required']
  },
  // Biometric authentication settings
  biometrics: {
    fingerprint: {
      enabled: {
        type: Boolean,
        default: false
      },
      registeredAt: Date,
      lastUsed: Date,
      failedAttempts: {
        type: Number,
        default: 0
      }
    },
    face: {
      enabled: {
        type: Boolean,
        default: false
      },
      registeredAt: Date,
      lastUsed: Date,
      failedAttempts: {
        type: Number,
        default: 0
      }
    },
    voice: {
      enabled: {
        type: Boolean,
        default: false
      },
      registeredAt: Date,
      lastUsed: Date,
      failedAttempts: {
        type: Number,
        default: 0
      }
    }
  },
  // Security settings
  security: {
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    biometricEnabled: {
      type: Boolean,
      default: false
    },
    backupCodes: [{
      code: String,
      used: {
        type: Boolean,
        default: false
      },
      usedAt: Date
    }],
    lastPasswordChange: Date,
    passwordHistory: [String], // Store hashes of previous passwords
    accountLocked: {
      type: Boolean,
      default: false
    },
    lockoutUntil: Date,
    loginAttempts: {
      type: Number,
      default: 0
    }
  },
  // User preferences
  preferences: {
    language: {
      type: String,
      enum: ['en', 'fr'],
      default: 'en'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      shareActivity: {
        type: Boolean,
        default: false
      },
      allowAnalytics: {
        type: Boolean,
        default: true
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // DID and blockchain integration
  did: {
    type: String,
    unique: true,
    sparse: true // Allows null values while maintaining uniqueness
  },
  // API and integration settings
  apiKeys: [{
    keyId: String,
    keyHash: String, // Hashed API key
    name: String,
    permissions: [String],
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastUsed: Date,
    active: {
      type: Boolean,
      default: true
    }
  }],
  // Compliance and audit
  compliance: {
    gdprConsent: {
      type: Boolean,
      default: false
    },
    gdprConsentDate: Date,
    dataRetentionPeriod: {
      type: Number,
      default: 2555 // 7 years in days
    },
    auditLog: [{
      action: String,
      timestamp: {
        type: Date,
        default: Date.now
      },
      ipAddress: String,
      userAgent: String,
      details: mongoose.Schema.Types.Mixed
    }]
  }
}, {
  timestamps: true,
  versionKey: false
});

userSchema.index({ email: 1 }, { unique: true });

userSchema.pre('save', async function(next) {
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

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    firstName: this.profile.firstName,
    lastName: this.profile.lastName,
    email: this.email,
    role: this.role,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('User', userSchema);
