// identity-blockchain-app/server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    required: [true, 'First name is required']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required']
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
  
  // Role and Status
  role: {
    type: String,
    enum: ['citizen', 'verifier', 'issuer'],
    required: [true, 'Role is required']
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
    type: Date
  },
  
  // Optional Profile Fields
  phoneNumber: {
    type: String,
    required: false
  },
  
  dateOfBirth: {
    type: Date,
    required: false
  },
  
  nationalId: {
    type: String,
    required: false,
    unique: true,
    sparse: true
  },
  
  // Credentials Reference
  credentials: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Credential'
  }]
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

// Pre-save middleware to hash password
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

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user has required role
userSchema.methods.hasRole = function(roles) {
  if (typeof roles === 'string') {
    return this.role === roles;
  }
  return roles.includes(this.role);
};

// Instance method to get public profile
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    username: this.username,
    role: this.role,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('User', userSchema);
