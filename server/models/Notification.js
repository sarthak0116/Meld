const mongoose = require('mongoose');

/**
 * Notification — inbox item for a user.
 * type: 'lobby' | 'friend_request' | 'tournament'
 */
const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: ['lobby', 'friend_request', 'tournament'],
    required: true,
  },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  sender:  { type: String, default: '' },   // username string for display
  game:    { type: String, default: '' },
  resolved:   { type: Boolean, default: false },
  statusText: { type: String, default: '' },
  // For tournament notifications
  tourneyId: { type: Number, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
