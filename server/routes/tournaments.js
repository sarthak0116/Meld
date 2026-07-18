const express = require('express');
const Tournament = require('../models/Tournament');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);

// ── GET /api/tournaments  ─────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const tournaments = await Tournament.find().sort({ createdAt: -1 }).lean();
    const uid = String(req.user.id);

    res.json({
      tournaments: tournaments.map((t) => ({
        id: String(t._id),
        name: t.name,
        game: t.game,
        prize: t.prize,
        spots: `${t.registeredCount}/${t.maxSlots} Teams`,
        time: t.scheduledAt ? formatSchedule(t.scheduledAt, t.status) : t.status,
        status: t.status,
        isRegistered: t.registrations.map(String).includes(uid),
      })),
    });
  } catch (err) {
    console.error('GET /tournaments error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST /api/tournaments/:id/register  ──────────────────────────────────────
router.post('/:id/register', async (req, res) => {
  try {
    const uid = req.user.id;
    const t = await Tournament.findById(req.params.id);
    if (!t) return res.status(404).json({ message: 'Tournament not found' });
    if (t.status !== 'Registering') {
      return res.status(400).json({ message: 'Registration is closed' });
    }
    if (t.registrations.map(String).includes(String(uid))) {
      return res.status(400).json({ message: 'Already registered' });
    }
    if (t.registeredCount >= t.maxSlots) {
      return res.status(400).json({ message: 'Tournament is full' });
    }

    t.registrations.push(uid);
    t.registeredCount += 1;
    t.spots = `${t.registeredCount}/${t.maxSlots} Teams`;
    await t.save();

    res.json({ message: 'Registered successfully' });
  } catch (err) {
    console.error('POST /tournaments/:id/register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST /api/tournaments  (admin seed) ──────────────────────────────────────
// Creates a tournament. In a real app this would be admin-only.
router.post('/', async (req, res) => {
  try {
    const { name, game, prize, maxSlots, scheduledAt } = req.body;
    const t = await Tournament.create({
      name, game, prize,
      maxSlots: maxSlots || 16,
      registeredCount: 0,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      status: 'Registering',
    });
    res.status(201).json({ tournament: t });
  } catch (err) {
    console.error('POST /tournaments error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Utility ───────────────────────────────────────────────────────────────────
function formatSchedule(date, status) {
  if (status === 'Live') return 'Live Now';
  if (status === 'Completed') return 'Completed';
  const diff = new Date(date).getTime() - Date.now();
  const hrs = Math.round(diff / 3600000);
  if (hrs < 0)   return 'Starting soon';
  if (hrs < 2)   return `Starts in ${hrs}h`;
  if (hrs < 24)  return `Starts in ${hrs}h`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

module.exports = router;
