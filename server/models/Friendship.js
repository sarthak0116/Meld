const mongoose = require('mongoose');

/**
 * Friendship — tracks friend relationships and DM messages between users.
 * status: 'pending' (requester → recipient) | 'accepted' | 'declined'
 */
const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:   { type: String, required: true, maxlength: 1000 },
}, { timestamps: true });

const friendshipSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending',
  },
  messages: [messageSchema],
}, { timestamps: true });

// Compound index — one friendship record per pair, regardless of direction
friendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

module.exports = mongoose.model('Friendship', friendshipSchema);
