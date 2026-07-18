const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const Friendship = require('../models/Friendship');
const Notification = require('../models/Notification');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);

// Rate limiter for actionable endpoints to prevent spam
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again after a minute' },
});

// More lenient rate limiter for type-ahead search
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { message: 'Too many search requests, please slow down' },
});


// ── Helper: normalize a friendship so requester is always the lower ObjectId ─
// This lets us look it up regardless of who initiated it.
function normalizedPair(a, b) {
  return String(a) < String(b)
    ? { requester: a, recipient: b }
    : { requester: b, recipient: a };
}

// ── GET /api/friends  ─────────────────────────────────────────────────────────
// Returns accepted friends for the current user, with their online status and
// last few DM messages.
router.get('/', async (req, res) => {
  try {
    const uid = req.user.id;
    const friendships = await Friendship.find({
      $or: [{ requester: uid }, { recipient: uid }],
      status: 'accepted',
    })
      .populate('requester', 'username isOnline lastSeen rank')
      .populate('recipient', 'username isOnline lastSeen rank');

    const friends = friendships.map((f) => {
      const isMeRequester = String(f.requester._id) === String(uid);
      const other = isMeRequester ? f.recipient : f.requester;

      // Derive display status from isOnline / lastSeen
      let status = 'Offline';
      if (other.isOnline) status = 'Online';
      else if (other.lastSeen && Date.now() - new Date(other.lastSeen).getTime() < 30 * 60 * 1000) {
        status = 'Away';
      }

      // Last 20 messages, formatted for the UI
      const messages = (f.messages || []).slice(-20).map((m) => ({
        sender: String(m.sender) === String(uid) ? 'You' : other.username,
        text: m.text,
        time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));

      return {
        id: String(f._id),          // friendship doc id
        friendId: String(other._id),
        name: other.username,
        status,
        initial: other.username.substring(0, 2).toUpperCase(),
        rank: other.rank,
        messages,
      };
    });

    res.json({ friends });
  } catch (err) {
    console.error('GET /friends error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST /api/friends/request  ────────────────────────────────────────────────
// Send a friend request to another user by username.
router.post('/request', apiLimiter, async (req, res) => {
  try {
    const uid = req.user.id;
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: 'username required' });

    const target = await User.findOne({ username });
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (String(target._id) === String(uid)) {
      return res.status(400).json({ message: 'Cannot add yourself' });
    }

    const { requester, recipient } = normalizedPair(uid, target._id);

    const existing = await Friendship.findOne({ requester, recipient });
    if (existing) {
      if (existing.status === 'accepted') return res.status(400).json({ message: 'Already friends' });
      if (existing.status === 'pending')  return res.status(400).json({ message: 'Request already sent' });
      // declined — allow re-request
      existing.status = 'pending';
      await existing.save();
    } else {
      await Friendship.create({ requester, recipient, status: 'pending' });
    }

    // Notify the recipient
    const me = await User.findById(uid).select('username');
    await Notification.create({
      recipient: target._id,
      type: 'friend_request',
      title: 'Friend Request',
      message: `${me.username} sent you a friend request.`,
      sender: me.username,
    });

    res.json({ message: 'Friend request sent' });
  } catch (err) {
    console.error('POST /friends/request error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST /api/friends/respond  ────────────────────────────────────────────────
// Accept or decline a pending request. Body: { friendshipId, action: 'accept'|'decline' }
// Only the RECIPIENT (non-requester) may respond — fixes B1 security hole.
router.post('/respond', async (req, res) => {
  try {
    const uid = req.user.id;
    const { friendshipId, action } = req.body;
    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ message: 'action must be accept or decline' });
    }

    const f = await Friendship.findById(friendshipId);
    if (!f) return res.status(404).json({ message: 'Friendship not found' });

    // The requester cannot accept/decline their own request
    if (String(f.requester) === String(uid)) {
      return res.status(403).json({ message: 'Cannot respond to your own friend request' });
    }

    // Must be the recipient
    if (String(f.recipient) !== String(uid)) {
      return res.status(403).json({ message: 'Not your request' });
    }

    f.status = action === 'accept' ? 'accepted' : 'declined';
    await f.save();

    res.json({ message: `Request ${f.status}` });
  } catch (err) {
    console.error('POST /friends/respond error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/friends/search?q=<query>  ───────────────────────────────────────
// Search users by username prefix. Excludes self and already-friended users.
// Returns up to 10 suggestions: [{ id, username, rank }]
router.get('/search', searchLimiter, async (req, res) => {
  try {
    const uid = req.user.id;
    const q = (req.query.q || '').trim();
    if (!q || q.length < 1) {
      return res.json({ users: [] });
    }

    // Escape special regex characters to prevent injection
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Find users matching the prefix (case-insensitive)
    const candidates = await User.find({
      username: { $regex: `^${escaped}`, $options: 'i' },
      _id: { $ne: uid },
    })
      .select('username rank')
      .limit(20)
      .lean();

    if (candidates.length === 0) return res.json({ users: [] });

    // Exclude users who already have an accepted or pending friendship with the current user
    const candidateIds = candidates.map((c) => c._id);
    const existingFriendships = await Friendship.find({
      $or: [
        { requester: uid, recipient: { $in: candidateIds } },
        { requester: { $in: candidateIds }, recipient: uid },
      ],
      status: { $in: ['accepted', 'pending'] },
    })
      .select('requester recipient')
      .lean();

    const excludedIds = new Set(
      existingFriendships.flatMap((f) => [
        String(f.requester),
        String(f.recipient),
      ])
    );
    // Always exclude self (already filtered above, but belt-and-suspenders)
    excludedIds.add(String(uid));

    const users = candidates
      .filter((c) => !excludedIds.has(String(c._id)))
      .slice(0, 10)
      .map((c) => ({ id: String(c._id), username: c.username, rank: c.rank }));

    res.json({ users });
  } catch (err) {
    console.error('GET /friends/search error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST /api/friends/:friendshipId/message  ─────────────────────────────────
// Send a DM within an accepted friendship.
router.post('/:friendshipId/message', async (req, res) => {
  try {
    const uid = req.user.id;
    const { text } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ message: 'text required' });
    }

    const f = await Friendship.findById(req.params.friendshipId);
    if (!f || f.status !== 'accepted') {
      return res.status(404).json({ message: 'Friendship not found or not accepted' });
    }
    const isParty = String(f.requester) === String(uid) || String(f.recipient) === String(uid);
    if (!isParty) return res.status(403).json({ message: 'Forbidden' });

    f.messages.push({ sender: uid, text: text.trim() });
    await f.save();

    const newMsg = f.messages[f.messages.length - 1];
    res.json({
      message: {
        sender: 'You',
        text: newMsg.text,
        time: new Date(newMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    });
  } catch (err) {
    console.error('POST /friends/:id/message error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
