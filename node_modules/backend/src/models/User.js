const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'super_admin'],
    default: 'student'
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  photoURL: {
    type: String,
    default: null
  },
  secretCode: {
    type: String,
    default: null
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
