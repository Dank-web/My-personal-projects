const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Playlist = require('../models/Playlist');
const User = require('../models/User');

// POST /api/playlists
router.post('/', auth, async (req, res) => {
  try {
    const { name, isPublic } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });

    const playlist = await Playlist.create({ name, userId: req.user._id, isPublic: isPublic || false });
    await User.findByIdAndUpdate(req.user._id, { $push: { playlists: playlist._id } });
    res.status(201).json(playlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/playlists — user's playlists
router.get('/', auth, async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.user._id }).populate('songs');
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/playlists/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate('songs');
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    if (!playlist.isPublic && playlist.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Access denied' });
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/playlists/:id — add/remove songs or rename
router.put('/:id', auth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    if (playlist.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    const { name, addSong, removeSong } = req.body;
    if (name) playlist.name = name;
    if (addSong && !playlist.songs.includes(addSong)) playlist.songs.push(addSong);
    if (removeSong) playlist.songs.pull(removeSong);

    await playlist.save();
    await playlist.populate('songs');
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/playlists/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    if (playlist.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    await playlist.deleteOne();
    await User.findByIdAndUpdate(req.user._id, { $pull: { playlists: playlist._id } });
    res.json({ message: 'Playlist deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
