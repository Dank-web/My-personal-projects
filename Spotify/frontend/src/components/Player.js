import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const PlayIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
);
const PauseIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
);
const NextIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
);
const PrevIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
);
const ShuffleIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>
);
const RepeatIcon = ({ mode }) => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    {mode === 'one'
      ? <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/>
      : <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>}
  </svg>
);
const VolumeIcon = ({ level }) => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    {level === 0
      ? <path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
      : level < 0.5
      ? <path d="M18.5 12A4.5 4.5 0 0 0 16 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
      : <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
    }
  </svg>
);
const HeartIcon = ({ filled }) => (
  <svg width="16" height="16" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const formatTime = (secs) => {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default function Player() {
  const {
    currentSong, isPlaying, progress, duration, volume,
    shuffle, repeat, togglePlay, playNext, playPrev,
    seek, setVolumeLevel, setShuffle, setRepeat,
    user,
  } = useApp();
  const [isDragging, setIsDragging] = useState(false);

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    seek(Math.max(0, Math.min(1, pct)));
  };

  const handleVolumeClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    setVolumeLevel(Math.max(0, Math.min(1, pct)));
  };

  const cycleRepeat = () => {
    setRepeat(repeat === 'none' ? 'all' : repeat === 'all' ? 'one' : 'none');
  };

  const currentTime = progress * (duration || 0);

  if (!currentSong) {
    return (
      <div className="player">
        <div className="player-left">
          <div className="player-cover" style={{ background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" fill="var(--text-muted)" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          </div>
          <div className="player-song-info">
            <div className="player-title" style={{ color: 'var(--text-muted)' }}>No song playing</div>
            <div className="player-artist">Select a song to play</div>
          </div>
        </div>
        <div className="player-center">
          <div className="player-controls">
            <button className="btn-icon" disabled style={{ opacity: 0.3 }}><ShuffleIcon /></button>
            <button className="btn-icon" disabled style={{ opacity: 0.3 }}><PrevIcon /></button>
            <button className="player-play-btn" disabled style={{ opacity: 0.3 }}><PlayIcon /></button>
            <button className="btn-icon" disabled style={{ opacity: 0.3 }}><NextIcon /></button>
            <button className="btn-icon" disabled style={{ opacity: 0.3 }}><RepeatIcon mode="none" /></button>
          </div>
          <div className="progress-container">
            <span className="progress-time">0:00</span>
            <div className="progress-bar"><div className="progress-fill" style={{ width: '0%' }} /></div>
            <span className="progress-time">0:00</span>
          </div>
        </div>
        <div className="player-right">
          <div className="volume-container">
            <VolumeIcon level={volume} />
            <div className="volume-bar" onClick={handleVolumeClick}>
              <div className="volume-fill" style={{ width: `${volume * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="player">
      {/* Left: Song info */}
      <div className="player-left">
        <img
          className="player-cover"
          src={currentSong.coverUrl || `https://picsum.photos/seed/${currentSong._id}/100/100`}
          alt={currentSong.title}
          onError={(e) => { e.target.src = `https://picsum.photos/seed/${currentSong._id}/100/100`; }}
        />
        <div className="player-song-info">
          <div className="player-title">{currentSong.title}</div>
          <div className="player-artist">{currentSong.artist}</div>
        </div>
        {isPlaying && (
          <div className="eq-bars" style={{ marginLeft: 4 }}>
            <div className="eq-bar" />
            <div className="eq-bar" />
            <div className="eq-bar" />
          </div>
        )}
      </div>

      {/* Center: Controls + Progress */}
      <div className="player-center">
        <div className="player-controls">
          <button
            className={`btn-icon ${shuffle ? 'active' : ''}`}
            onClick={() => setShuffle(!shuffle)}
            title="Shuffle"
          >
            <ShuffleIcon />
          </button>
          <button className="btn-icon" onClick={playPrev} title="Previous"><PrevIcon /></button>
          <button className="player-play-btn" onClick={togglePlay}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button className="btn-icon" onClick={playNext} title="Next"><NextIcon /></button>
          <button
            className={`btn-icon ${repeat !== 'none' ? 'active' : ''}`}
            onClick={cycleRepeat}
            title={`Repeat: ${repeat}`}
          >
            <RepeatIcon mode={repeat} />
          </button>
        </div>

        <div className="progress-container">
          <span className="progress-time">{formatTime(currentTime)}</span>
          <div className="progress-bar" onClick={handleProgressClick}>
            <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
          </div>
          <span className="progress-time">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Volume */}
      <div className="player-right">
        <div className="volume-container">
          <button className="btn-icon" onClick={() => setVolumeLevel(volume > 0 ? 0 : 0.8)}>
            <VolumeIcon level={volume} />
          </button>
          <div className="volume-bar" onClick={handleVolumeClick}>
            <div className="volume-fill" style={{ width: `${volume * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
