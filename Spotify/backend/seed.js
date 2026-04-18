/**
 * Seed script — populates MongoDB with demo users and songs
 * Run: node backend/seed.js
 * Requires: MONGODB_URI in .env or default localhost
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/soundsphere';

// ---------- Schemas (inline so seed.js is standalone) ----------
const userSchema = new mongoose.Schema({
  username: String, email: String, password: String,
  credits: { type: Number, default: 0 },
  premiumUntil: { type: Date, default: null },
  likedSongs: [mongoose.Schema.Types.ObjectId],
  playlists: [mongoose.Schema.Types.ObjectId],
  recentlyPlayed: [mongoose.Schema.Types.ObjectId],
  createdAt: { type: Date, default: Date.now },
});
const songSchema = new mongoose.Schema({
  title: String, artist: String, genre: String,
  fileUrl: String, coverUrl: String,
  uploadedBy: mongoose.Schema.Types.ObjectId,
  plays: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  lyrics: String,
  createdAt: { type: Date, default: Date.now },
});
const playlistSchema = new mongoose.Schema({
  name: String, userId: mongoose.Schema.Types.ObjectId,
  songs: [mongoose.Schema.Types.ObjectId],
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Song = mongoose.model('Song', songSchema);
const Playlist = mongoose.model('Playlist', playlistSchema);

// ---------- Demo Data ----------
const FREE_AUDIO = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-';

const DEMO_SONGS = [
  // Pop
  { title: 'Electric Sunrise', artist: 'Nova Wave', genre: 'Pop', plays: 84200, likes: 3100, track: 1 },
  { title: 'Golden Hour', artist: 'Skyler Reed', genre: 'Pop', plays: 71000, likes: 2400, track: 2 },
  { title: 'Neon Dreams', artist: 'Prism', genre: 'Pop', plays: 52000, likes: 1800, track: 3 },
  // Electronic
  { title: 'Midnight Protocol', artist: 'CODA', genre: 'Electronic', plays: 98700, likes: 4200, track: 4 },
  { title: 'Signal Loss', artist: 'Datavoid', genre: 'Electronic', plays: 63000, likes: 2900, track: 5 },
  { title: 'Pulse State', artist: 'CODA', genre: 'Electronic', plays: 44000, likes: 1600, track: 6 },
  // Hip Hop
  { title: 'Crown Season', artist: 'J. Kross', genre: 'Hip Hop', plays: 125000, likes: 5600, track: 7 },
  { title: 'Late Night Ciphers', artist: 'The Bloc', genre: 'Hip Hop', plays: 78000, likes: 3200, track: 8 },
  { title: 'Carry Weight', artist: 'J. Kross', genre: 'Hip Hop', plays: 55000, likes: 2100, track: 9 },
  // Jazz
  { title: 'Blue Latitude', artist: 'Marcus Hale', genre: 'Jazz', plays: 32000, likes: 1200, track: 10 },
  { title: 'Smoke & Strings', artist: 'The Quartet', genre: 'Jazz', plays: 28000, likes: 980, track: 11 },
  // Rock
  { title: 'Static Gods', artist: 'Ironclad', genre: 'Rock', plays: 91000, likes: 3800, track: 12 },
  { title: 'Fault Lines', artist: 'Ironclad', genre: 'Rock', plays: 67000, likes: 2700, track: 13 },
  { title: 'Amplified', artist: 'The Surge', genre: 'Rock', plays: 48000, likes: 1900, track: 14 },
  // R&B
  { title: 'Velvet Skies', artist: 'Amara', genre: 'R&B', plays: 86000, likes: 3600, track: 15 },
  { title: 'After Midnight', artist: 'Amara', genre: 'R&B', plays: 72000, likes: 3000, track: 1 },
  // Indie
  { title: 'Paper Boats', artist: 'Slow Burn', genre: 'Indie', plays: 41000, likes: 1700, track: 2 },
  { title: 'Lavender Haze', artist: 'The Moons', genre: 'Indie', plays: 38000, likes: 1500, track: 3 },
  // Lo-fi
  { title: 'Study Room', artist: 'lo.wav', genre: 'Lo-fi', plays: 110000, likes: 4800, track: 4 },
  { title: 'Rainy Afternoon', artist: 'lo.wav', genre: 'Lo-fi', plays: 95000, likes: 4100, track: 5 },
];

const DEMO_USERS = [
  { username: 'demo', email: 'demo@soundsphere.app', password: 'demo123', credits: 50 },
  { username: 'audiophile', email: 'audiophile@soundsphere.app', password: 'music123', credits: 100 },
];

// Picsum cover images (consistent per song)
const getCoverUrl = (seed) => `https://picsum.photos/seed/ss-${seed}/500/500`;

// ---------- Main ----------
async function seed() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected');

  // Clear existing
  await Promise.all([User.deleteMany({}), Song.deleteMany({}), Playlist.deleteMany({})]);
  console.log('🗑  Cleared existing data');

  // Create users
  const hashedUsers = await Promise.all(
    DEMO_USERS.map(async (u) => ({
      ...u,
      password: await bcrypt.hash(u.password, 12),
    }))
  );
  const users = await User.insertMany(hashedUsers);
  console.log(`👥 Created ${users.length} users`);

  // Create songs
  const songDocs = DEMO_SONGS.map((s, i) => ({
    title: s.title,
    artist: s.artist,
    genre: s.genre,
    plays: s.plays,
    likes: s.likes,
    fileUrl: `${FREE_AUDIO}${s.track}.mp3`,
    coverUrl: getCoverUrl(i + 1),
    uploadedBy: users[i % users.length]._id,
    lyrics: `[Verse 1]\n${s.title} — demo lyrics placeholder.\nThis is where the verse would go.\n\n[Chorus]\nAnd this is the chorus of the song.\nFeel the rhythm, feel the sound.\n\n[Verse 2]\nSecond verse, same as the first but different.\nMusic flows through every word.`,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
  }));
  const songs = await Song.insertMany(songDocs);
  console.log(`🎵 Created ${songs.length} songs`);

  // Liked songs for demo user
  const demoUser = users[0];
  const likedIds = songs.slice(0, 6).map(s => s._id);
  await User.findByIdAndUpdate(demoUser._id, { likedSongs: likedIds, credits: 50 });

  // Create a demo playlist
  const playlist = await Playlist.create({
    name: 'My Favorites',
    userId: demoUser._id,
    songs: songs.slice(0, 5).map(s => s._id),
  });
  await User.findByIdAndUpdate(demoUser._id, { playlists: [playlist._id] });

  console.log('📂 Created demo playlist');
  console.log('\n✅ Seed complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Demo account:');
  console.log('  Email:    demo@soundsphere.app');
  console.log('  Password: demo123');
  console.log('  Credits:  50');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
