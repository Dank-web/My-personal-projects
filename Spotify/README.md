# 🎵 SoundSphere

A full-stack Spotify-like music streaming web application built with React, Node.js, Express, MongoDB, and Cloudinary.

---

## ✨ Features

- 🔐 **JWT Authentication** — Register, login, secure protected routes
- 🎵 **Music Streaming** — Upload and stream MP3 files via Cloudinary
- 🔥 **Trending Songs** — Sorted by play count
- 🔍 **Search** — Find by song, artist, or genre with debounce
- ❤️ **Liked Songs** — Toggle likes, store in user profile
- 📂 **Playlists** — Create, add/remove songs, delete
- 💰 **Credit System** — Earn 1 credit per song played
- ✦ **Premium Plans** — 1 day (5cr), 7 days (15cr), 30 days (30cr)
- 📢 **Ad System** — Ads shown after each song for free users (5s skip)
- 🎨 **Dark UI** — Spotify-inspired design with Syne + DM Sans fonts
- 📱 **Responsive** — Works on desktop and mobile

---

## 🛠 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, React Router v6, CSS      |
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB + Mongoose                  |
| Storage    | Cloudinary (audio + cover images)   |
| Auth       | JWT + bcryptjs                      |

---

## 🚀 Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)
- Cloudinary account (free tier works)

### 1. Clone and install

```bash
git clone <repo-url>
cd soundsphere

# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and Cloudinary credentials

# Frontend
cd ../frontend
npm install
```

### 2. Configure `.env` (backend)

```env
PORT=5000
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/soundsphere
JWT_SECRET=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Start development

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm start
```

Open http://localhost:3000

---

## 📁 Project Structure

```
soundsphere/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema (credits, premium, liked songs)
│   │   ├── Song.js          # Song schema (fileUrl, plays, likes)
│   │   └── Playlist.js      # Playlist schema
│   ├── routes/
│   │   ├── auth.js          # POST /register, /login
│   │   ├── user.js          # GET profile, POST premium, PUT credits
│   │   ├── songs.js         # CRUD songs, play/like actions
│   │   ├── playlists.js     # CRUD playlists
│   │   └── search.js        # GET search + recommend
│   ├── middleware/
│   │   ├── auth.js          # JWT verification
│   │   └── upload.js        # Cloudinary multer config
│   └── server.js
│
├── frontend/
│   └── src/
│       ├── context/
│       │   └── AppContext.js  # Auth, player state, toast
│       ├── components/
│       │   ├── Layout.js        # Sidebar + Outlet
│       │   ├── Player.js        # Fixed bottom player
│       │   ├── SongCard.js      # Grid card
│       │   ├── SongListItem.js  # List row with like/add
│       │   ├── AdOverlay.js     # Ad modal with countdown
│       │   ├── Toast.js         # Notification toast
│       │   └── AddToPlaylistModal.js
│       ├── pages/
│       │   ├── Home.js          # Trending + recommended
│       │   ├── Search.js        # Search + genre browser
│       │   ├── Library.js       # Liked songs + playlists
│       │   ├── PlaylistPage.js  # Single playlist view
│       │   ├── Upload.js        # Upload audio form
│       │   ├── Profile.js       # Credits + premium plans
│       │   ├── Login.js
│       │   └── Register.js
│       ├── services/
│       │   └── api.js           # Axios instance + service functions
│       ├── App.js               # Routes + providers
│       └── index.css            # All global styles + CSS vars
```

---

## 🎯 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user (gets 10 free credits) |
| POST | `/api/auth/login` | Login, returns JWT |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get full profile |
| GET | `/api/user/liked-songs` | Get liked songs |
| GET | `/api/user/recently-played` | Get recently played |
| POST | `/api/user/premium` | Buy premium with credits |
| PUT | `/api/user/credits` | Add credits |

### Songs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/songs/upload` | Upload MP3 (multipart) |
| GET | `/api/songs` | Get all songs |
| GET | `/api/songs/trending` | Get trending (by plays) |
| GET | `/api/songs/:id` | Get single song |
| PUT | `/api/songs/play/:id` | Increment plays + earn credit |
| PUT | `/api/songs/like/:id` | Toggle like |

### Playlists
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/playlists` | Create playlist |
| GET | `/api/playlists` | Get user playlists |
| GET | `/api/playlists/:id` | Get playlist with songs |
| PUT | `/api/playlists/:id` | Add/remove song or rename |
| DELETE | `/api/playlists/:id` | Delete playlist |

### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search?q=&type=` | Search songs |
| GET | `/api/search/recommend?genres=` | Recommended songs |

---

## 💡 Credit & Premium System

```
User plays a song → earns 1 credit
Credits can be spent on premium plans:
  - 1 Day    = 5 credits  (24 hours ad-free)
  - 7 Days   = 15 credits (7 days ad-free)
  - 30 Days  = 30 credits (30 days ad-free)

If premiumUntil > now → isPremium = true → no ads
```

---

## 📢 Ad System

- Free users see an ad popup after each song ends
- Ad has a **5-second countdown** before it can be dismissed
- 3 different ad types rotate randomly
- Premium users skip ads entirely

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Background | `#0a0a0a` |
| Card | `#161616` |
| Accent | `#1db954` (Spotify green) |
| Font Display | Syne (headings) |
| Font Body | DM Sans (text) |

---

## 🔒 Security Notes

- Passwords hashed with **bcrypt** (cost factor 12)
- JWT tokens expire in **7 days**
- File type validation for uploads (audio only)
- Protected routes require valid Bearer token
- Max upload size: 20MB audio, 5MB images

---

## 🚧 Optional Enhancements

- [ ] Real-time play count with Socket.io
- [ ] Follow system between users
- [ ] Comments on songs
- [ ] Recently played history page
- [ ] Admin dashboard for content moderation
- [ ] Email verification on register
- [ ] Social OAuth (Google/GitHub)
- [ ] Waveform visualizer using Web Audio API
