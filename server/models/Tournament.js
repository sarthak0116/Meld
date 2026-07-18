const mongoose = require('mongoose');

/**
 * Tournament — stores tournament listings.
 */
const tournamentSchema = new mongoose.Schema({
  name:   { type: String, required: true },
  game:   { type: String, required: true },
  prize:  { type: String, required: true },
  // e.g. "14/16 Teams"
  spots:  { type: String, required: true },
  // registered team/player count
  registeredCount: { type: Number, default: 0 },
  maxSlots:        { type: Number, default: 16 },
  scheduledAt: { type: Date },
  status: {
    type: String,
    enum: ['Registering', 'Live', 'Completed'],
    default: 'Registering',
  },
  registrations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Tournament', tournamentSchema);
