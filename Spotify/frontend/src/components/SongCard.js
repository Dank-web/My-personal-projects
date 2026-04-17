import React from 'react';
import { useApp } from '../context/AppContext';

const PlayIcon = () => (
  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
);

const formatPlays = (n) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n?.toString() || '0';
};

export default function SongCard({ song, queue = [], index = 0 }) {
  const { playSong, currentSong, isPlaying } = useApp();
  const isActive = currentSong?._id === song._id;

  return (
    <div
      className="song-card"
      onClick={() => playSong(song, queue, index)}
      style={isActive ? { borderColor: 'var(--accent)', background: 'var(--accent-glow)' } : {}}
    >
      <img
        className="song-card-cover"
        src={song.coverUrl || `https://picsum.photos/seed/${song._id}/300/300`}
        alt={song.title}
        onError={(e) => { e.target.src = `https://picsum.photos/seed/${song._id}/300/300`; }}
      />
      <div className="song-card-play-btn">
        {isActive && isPlaying ? (
          <svg width="16" height="16" fill="#000" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        ) : (
          <PlayIcon />
        )}
      </div>
      <div className="song-card-title">{song.title}</div>
      <div className="song-card-artist">{song.artist}</div>
      <div className="song-card-plays">{formatPlays(song.plays)} plays</div>
    </div>
  );
}
