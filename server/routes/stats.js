const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);

// GET /api/stats — returns current user's gameStats array
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('gameStats username');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ stats: user.gameStats });
  } catch (err) {
    console.error('GET /stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/stats/record — record a match result for a game
// Body: { game, result: 'W'|'L', kda }
router.post('/record', async (req, res) => {
  try {
    const { game, result, kda } = req.body;
    if (!game || !['W', 'L'].includes(result)) {
      return res.status(400).json({ message: 'game and result (W|L) required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let entry = user.gameStats.find(s => s.game === game);
    if (!entry) {
      user.gameStats.push({ game, rank: 'Unranked', mmr: 1000, wins: 0, losses: 0, kda: 0, recentHistory: [] });
      entry = user.gameStats[user.gameStats.length - 1];
    }

    if (result === 'W') entry.wins += 1;
    else entry.losses += 1;

    if (typeof kda === 'number') {
      // Rolling average KDA
      const total = entry.wins + entry.losses;
      entry.kda = parseFloat(((entry.kda * (total - 1) + kda) / total).toFixed(2));
    }

    // Keep last 5 results
    entry.recentHistory = [...entry.recentHistory, result].slice(-5);

    await user.save();
    res.json({ stats: user.gameStats });
  } catch (err) {
    console.error('POST /stats/record error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
