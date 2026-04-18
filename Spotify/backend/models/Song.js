const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  artist: { type: String, required: true, trim: true },
  genre: { type: String, required: true, trim: true },
  fileUrl: { type: String, required: true },
  coverUrl: { type: String, default: '' },
  cloudinaryPublicId: { type: String },
  coverPublicId: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plays: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  duration: { type: Number, default: 0 }, // in seconds
  lyrics: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

songSchema.index({ title: 'text', artist: 'text', genre: 'text' });

module.exports = mongoose.model('Song', songSchema);
