import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { playlistService } from '../services/api';
import { useApp } from '../context/AppContext';
import SongListItem from '../components/SongListItem';

const BackIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

export default function PlaylistPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playSong, showToast } = useApp();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    playlistService.getById(id).then(res => {
      setPlaylist(res.data);
      setLoading(false);
    }).catch(() => {
      showToast('Playlist not found', 'error');
      navigate('/library');
    });
  }, [id]);

  const removeSong = async (songId) => {
    try {
      const res = await playlistService.update(id, { removeSong: songId });
      setPlaylist(res.data);
      showToast('Song removed from playlist', 'success');
    } catch (err) {
      showToast('Failed to remove song', 'error');
    }
  };

  if (loading) return (
    <div className="page-container">
      <div className="loading-overlay"><div className="loading-spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
    </div>
  );

  return (
    <div className="page-container">
      <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: 20, paddingLeft: 0 }}>
        <BackIcon /> Back
      </button>

      {/* Playlist Header */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 32, alignItems: 'flex-end' }}>
        <div style={{
          width: 160, height: 160, borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, var(--accent-glow), var(--bg-elevated))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="64" height="64" fill="var(--accent)" viewBox="0 0 24 24" style={{ opacity: 0.7 }}>
            <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 5h-3v5.5a2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1 2.5-2.5c.57 0 1.08.19 1.5.51V5h4v2z"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Playlist</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, letterSpacing: -1, marginBottom: 6 }}>{playlist.name}</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{playlist.songs?.length || 0} songs</div>
          {playlist.songs?.length > 0 && (
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn btn-primary" onClick={() => playSong(playlist.songs[0], playlist.songs, 0)}>
                ▶ Play All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Songs */}
      {!playlist.songs?.length ? (
        <div className="empty-state">
          <div className="empty-state-title">This playlist is empty</div>
          <div className="empty-state-text">Add songs from the Home or Search page.</div>
        </div>
      ) : (
        <div className="song-list">
          {playlist.songs.map((song, i) => (
            <div key={song._id} style={{ position: 'relative' }}>
              <SongListItem
                song={song}
                index={i}
                queue={playlist.songs}
                onAddToPlaylist={null}
              />
              <button
                className="btn-icon"
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
                onClick={() => removeSong(song._id)}
                title="Remove from playlist"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
