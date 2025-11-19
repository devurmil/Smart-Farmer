const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 255
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: false, // Can be null for social logins
    minlength: 6,
    maxlength: 255,
    select: false // Don't include password in queries by default
  },
  profile_picture: {
    type: String,
    default: null
  },
  facebook_id: {
    type: String,
    default: null,
    sparse: true // Allows multiple nulls but enforces uniqueness for non-null values
  },
  google_id: {
    type: String,
    default: null,
    sparse: true
  },
  login_method: {
    type: String,
    enum: ['email', 'facebook', 'google'],
    default: 'email',
    required: true
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  phone: {
    type: String,
    default: null,
    maxlength: 20
  },
  location: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  last_login: {
    type: Date,
    default: null
  },
  role: {
    type: String,
    enum: ['farmer', 'owner', 'supplier', 'admin'],
    default: 'farmer'
  },
  role_selection_pending: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'users'
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to convert user to JSON (exclude password)
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Indexes
const User = mongoose.model('User', userSchema);

module.exports = User;
