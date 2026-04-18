const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Song = require('../models/Song');

// GET /api/user/profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('likedSongs')
      .populate('playlists');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/user/liked-songs
router.get('/liked-songs', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('likedSongs');
    res.json(user.likedSongs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/user/recently-played
router.get('/recently-played', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'recentlyPlayed',
      options: { limit: 20 },
    });
    res.json(user.recentlyPlayed);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/user/premium — buy premium with credits
router.post('/premium', auth, async (req, res) => {
  try {
    const { plan } = req.body; // '1day', '7days', '30days'
    const plans = { '1day': { cost: 5, days: 1 }, '7days': { cost: 15, days: 7 }, '30days': { cost: 30, days: 30 } };
    const selected = plans[plan];
    if (!selected) return res.status(400).json({ message: 'Invalid plan' });

    const user = await User.findById(req.user._id);
    if (user.credits < selected.cost)
      return res.status(400).json({ message: 'Insufficient credits' });

    user.credits -= selected.cost;
    const now = new Date();
    const base = user.premiumUntil && user.premiumUntil > now ? user.premiumUntil : now;
    user.premiumUntil = new Date(base.getTime() + selected.days * 24 * 60 * 60 * 1000);
    await user.save();

    res.json({ credits: user.credits, premiumUntil: user.premiumUntil, isPremium: user.isPremium });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/user/credits — add credits (simulate earning)
router.put('/credits', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user._id);
    user.credits += amount || 1;
    await user.save();
    res.json({ credits: user.credits });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
