const express = require('express');
const router = express.Router();
const Song = require('../models/Song');

// GET /api/search?q=&type=
router.get('/', async (req, res) => {
  try {
    const { q, type, genre } = req.query;
    if (!q && !genre) return res.json({ songs: [] });

    let query = {};
    if (q) {
      const regex = new RegExp(q, 'i');
      if (type === 'artist') query = { artist: regex };
      else if (type === 'genre') query = { genre: regex };
      else query = { $or: [{ title: regex }, { artist: regex }, { genre: regex }] };
    }
    if (genre) query.genre = new RegExp(genre, 'i');

    const songs = await Song.find(query).limit(30).populate('uploadedBy', 'username');
    res.json({ songs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/search/recommend — basic recommendation
router.get('/recommend', async (req, res) => {
  try {
    const { genres, limit } = req.query;
    const genreArr = genres ? genres.split(',') : [];
    let songs = [];

    if (genreArr.length > 0) {
      songs = await Song.find({ genre: { $in: genreArr.map(g => new RegExp(g, 'i')) } })
        .sort('-plays')
        .limit(parseInt(limit) || 10)
        .populate('uploadedBy', 'username');
    }

    if (songs.length < 10) {
      const more = await Song.find({ _id: { $nin: songs.map(s => s._id) } })
        .sort('-plays')
        .limit(10 - songs.length)
        .populate('uploadedBy', 'username');
      songs = [...songs, ...more];
    }

    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
