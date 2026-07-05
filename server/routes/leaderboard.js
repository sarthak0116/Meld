const express = require('express');
const User = require('../models/User');

const router = express.Router();

// GET /api/leaderboard?limit=10
// Public — no auth required, safe fields only
router.get('/', async (_req, res) => {
  try {
    const limit = Math.min(parseInt(_req.query.limit, 10) || 10, 50);

    const players = await User.find({})
      .sort({ mmr: -1 })
      .limit(limit)
      .select('username mmr rank region avatar');

    res.json({ players });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
