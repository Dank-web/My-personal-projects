import React from 'react';
import { useApp } from '../context/AppContext';
import { songService } from '../services/api';

const PlayIcon = () => (
  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
);
const HeartIcon = ({ filled }) => (
  <svg width="14" height="14" fill={filled ? 'var(--accent)' : 'none'} stroke={filled ? 'var(--accent)' : 'currentColor'} strokeWidth="2" viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const formatPlays = (n) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n?.toString() || '0';
};

export default function SongListItem({ song, index, queue = [], onAddToPlaylist }) {
  const { playSong, currentSong, isPlaying, user, updateUser, showToast } = useApp();
  const isActive = currentSong?._id === song._id;
  const isLiked = user?.likedSongs?.includes(song._id);

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      const res = await songService.toggleLike(song._id);
      updateUser({ likedSongs: res.data.likedSongs });
      showToast(res.data.liked ? 'Added to liked songs' : 'Removed from liked songs', 'success');
    } catch (err) {
      showToast('Failed to update like', 'error');
    }
  };

  return (
    <div
      className={`song-list-item ${isActive ? 'playing' : ''}`}
      onClick={() => playSong(song, queue, index)}
    >
      <div className="song-list-num">
        {isActive && isPlaying ? (
          <div className="eq-bars">
            <div className="eq-bar" />
            <div className="eq-bar" />
            <div className="eq-bar" />
          </div>
        ) : (
          index + 1
        )}
      </div>
      <img
        className="song-list-cover"
        src={song.coverUrl || `https://picsum.photos/seed/${song._id}/100/100`}
        alt={song.title}
        onError={(e) => { e.target.src = `https://picsum.photos/seed/${song._id}/100/100`; }}
      />
      <div className="song-list-info">
        <div className="song-list-title">{song.title}</div>
        <div className="song-list-artist">{song.artist} · <span style={{ color: 'var(--text-muted)' }}>{song.genre}</span></div>
      </div>
      <div className="song-list-plays">{formatPlays(song.plays)}</div>
      <div className="song-list-actions">
        <button
          className={`btn-icon ${isLiked ? 'active' : ''}`}
          onClick={handleLike}
          title={isLiked ? 'Unlike' : 'Like'}
        >
          <HeartIcon filled={isLiked} />
        </button>
        {onAddToPlaylist && (
          <button className="btn-icon" onClick={(e) => { e.stopPropagation(); onAddToPlaylist(song); }} title="Add to playlist">
            <PlusIcon />
          </button>
        )}
      </div>
    </div>
  );
}
