const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { uploadAudio, uploadImage, cloudinary } = require('../middleware/upload');
const Song = require('../models/Song');
const User = require('../models/User');
const multer = require('multer');

// Upload song (audio + cover in one request using fields)
const uploadFields = multer({
  storage: require('multer').memoryStorage(),
}).fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]);

// POST /api/songs/upload
router.post('/upload', auth, async (req, res) => {
  uploadAudio.single('audio')(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    try {
      const { title, artist, genre, lyrics } = req.body;
      if (!title || !artist || !genre)
        return res.status(400).json({ message: 'Title, artist, genre required' });
      if (!req.file) return res.status(400).json({ message: 'Audio file required' });

      const song = await Song.create({
        title, artist, genre, lyrics: lyrics || '',
        fileUrl: req.file.path,
        cloudinaryPublicId: req.file.filename,
        coverUrl: 'https://picsum.photos/seed/' + Math.random() + '/500/500',
        uploadedBy: req.user._id,
      });
      res.status(201).json(song);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
});

// GET /api/songs — get all songs with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sort = req.query.sort || '-createdAt';
    const genre = req.query.genre;

    const query = genre ? { genre: new RegExp(genre, 'i') } : {};
    const songs = await Song.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('uploadedBy', 'username');

    const total = await Song.countDocuments(query);
    res.json({ songs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/songs/trending
router.get('/trending', async (req, res) => {
  try {
    const songs = await Song.find().sort('-plays').limit(20).populate('uploadedBy', 'username');
    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/songs/:id
router.get('/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id).populate('uploadedBy', 'username');
    if (!song) return res.status(404).json({ message: 'Song not found' });
    res.json(song);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/songs/play/:id — increment plays + earn credit
router.put('/play/:id', auth, async (req, res) => {
  try {
    const song = await Song.findByIdAndUpdate(req.params.id, { $inc: { plays: 1 } }, { new: true });
    if (!song) return res.status(404).json({ message: 'Song not found' });

    // Earn 1 credit for playing
    const user = await User.findByIdAndUpdate(req.user._id, { $inc: { credits: 1 }, $push: { recentlyPlayed: { $each: [song._id], $slice: -20 } } }, { new: true });

    res.json({ plays: song.plays, credits: user.credits });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/songs/like/:id — toggle like
router.put('/like/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const songId = req.params.id;
    const isLiked = user.likedSongs.includes(songId);

    if (isLiked) {
      user.likedSongs.pull(songId);
      await Song.findByIdAndUpdate(songId, { $inc: { likes: -1 } });
    } else {
      user.likedSongs.push(songId);
      await Song.findByIdAndUpdate(songId, { $inc: { likes: 1 } });
    }
    await user.save();
    res.json({ liked: !isLiked, likedSongs: user.likedSongs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
