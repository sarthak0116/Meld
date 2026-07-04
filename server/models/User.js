const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  avatar: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
    maxlength: 200,
  },
  region: {
    type: String,
    default: 'NA',
    enum: ['NA', 'EU', 'ASIA', 'SA', 'OCE', 'ME'],
  },
  rank: {
    type: String,
    default: 'Unranked',
    enum: ['Unranked', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master'],
  },
  mmr: {
    type: Number,
    default: 1000,
  },
  behaviorScore: {
    type: Number,
    default: 100,
    min: 0,
    max: 100,
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin', 'moderator'],
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  preferredGames: [{
    type: String,
  }],
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isOnline: {
    type: Boolean,
    default: false,
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);