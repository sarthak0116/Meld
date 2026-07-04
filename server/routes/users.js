const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware.js');

const router = express.Router();

// PUT /me must come before GET /:id to avoid "me" being matched as an :id param
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { bio, region, avatar, preferredGames } = req.body;

    // Whitelist — do NOT allow rank/mmr/role/behaviorScore to be user-editable
    const allowedUpdate = {};
    if (bio !== undefined) {
      if (typeof bio !== 'string' || bio.length > 200) {
        return res.status(400).json({ message: 'Bio must be a string under 200 characters' });
      }
      allowedUpdate.bio = bio.trim();
    }
    if (region !== undefined) {
      const validRegions = ['NA', 'EU', 'ASIA', 'SA', 'OCE', 'ME'];
      if (!validRegions.includes(region)) {
        return res.status(400).json({ message: 'Invalid region' });
      }
      allowedUpdate.region = region;
    }
    if (avatar !== undefined) {
      if (typeof avatar !== 'string' || avatar.length > 500) {
        return res.status(400).json({ message: 'Invalid avatar value' });
      }
      allowedUpdate.avatar = avatar.trim();
    }
    if (preferredGames !== undefined) {
      if (!Array.isArray(preferredGames) || preferredGames.length > 10) {
        return res.status(400).json({ message: 'preferredGames must be an array of up to 10 items' });
      }
      allowedUpdate.preferredGames = preferredGames.map(g => String(g).trim()).filter(Boolean);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      allowedUpdate,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
