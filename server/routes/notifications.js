const express = require('express');
const Notification = require('../models/Notification');
const Friendship = require('../models/Friendship');
const authMiddleware = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

const router = express.Router();
router.use(authMiddleware);

// Rate limiter for actionable endpoints to prevent spam
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again after a minute' },
});

// ── GET /api/notifications  ───────────────────────────────────────────────────
// Returns the 30 most recent notifications for the current user.
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    res.json({
      notifications: notifications.map((n) => ({
        id: String(n._id),
        type: n.type,
        title: n.title,
        message: n.message,
        sender: n.sender,
        game: n.game,
        resolved: n.resolved,
        statusText: n.statusText,
        tourneyId: n.tourneyId,
        time: timeAgo(n.createdAt),
      })),
    });
  } catch (err) {
    console.error('GET /notifications error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST /api/notifications  ──────────────────────────────────────────────────
// Send a lobby invitation notification to a friend.
// Body: { recipientId, type, title, message, game }
router.post('/', apiLimiter, async (req, res) => {
  try {
    const uid = req.user.id;
    const { recipientId, type, title, message, game } = req.body;

    if (!recipientId || !type || !title || !message) {
      return res.status(400).json({ message: 'recipientId, type, title, and message are required' });
    }
    if (!['lobby', 'tournament'].includes(type)) {
      return res.status(400).json({ message: 'type must be lobby or tournament' });
    }

    // Only allow sending to accepted friends (prevents notification spam)
    const isFriend = await Friendship.findOne({
      $or: [
        { requester: uid, recipient: recipientId, status: 'accepted' },
        { requester: recipientId, recipient: uid, status: 'accepted' },
      ],
    });
    if (!isFriend) {
      return res.status(403).json({ message: 'Can only send notifications to accepted friends' });
    }

    const User = require('../models/User');
    const me = await User.findById(uid).select('username');

    await Notification.create({
      recipient: recipientId,
      type,
      title: String(title).substring(0, 100),
      message: String(message).substring(0, 300),
      sender: me.username,
      game: game || '',
    });

    res.json({ message: 'Notification sent' });
  } catch (err) {
    console.error('POST /notifications error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── PATCH /api/notifications/:id/resolve  ────────────────────────────────────
// Mark a notification as resolved with an optional status text.
// For friend_request notifications also updates the Friendship document.
router.patch('/:id/resolve', async (req, res) => {
  try {
    const { action, detail } = req.body; // action: 'accept' | 'decline' | 'view' | generic

    const notif = await Notification.findOne({ _id: req.params.id, recipient: req.user.id });
    if (!notif) return res.status(404).json({ message: 'Notification not found' });

    // Handle friend request acceptance via notification
    if (notif.type === 'friend_request' && action === 'accept') {
      // Find the friendship where the sender is the requester
      const User = require('../models/User');
      const sender = await User.findOne({ username: notif.sender });
      if (sender) {
        const uid = req.user.id;
        const sid = sender._id;
        // Use same normalization as friends.js normalizedPair helper
        const reqId = String(uid) < String(sid) ? uid : sid;
        const recId = String(uid) < String(sid) ? sid : uid;
        await Friendship.findOneAndUpdate(
          { requester: reqId, recipient: recId, status: 'pending' },
          { status: 'accepted' }
        );
      }
    }

    notif.resolved = true;
    notif.statusText = detail || '';
    await notif.save();

    res.json({ message: 'Resolved' });
  } catch (err) {
    console.error('PATCH /notifications/:id/resolve error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Utility ───────────────────────────────────────────────────────────────────
function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

module.exports = router;
