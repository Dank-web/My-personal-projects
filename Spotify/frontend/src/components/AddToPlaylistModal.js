import React, { useState, useEffect } from 'react';
import { playlistService } from '../services/api';
import { useApp } from '../context/AppContext';

export default function AddToPlaylistModal({ song, onClose }) {
  const { showToast } = useApp();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    playlistService.getAll().then(res => {
      setPlaylists(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const addToPlaylist = async (playlistId) => {
    try {
      await playlistService.update(playlistId, { addSong: song._id });
      showToast(`Added "${song.title}" to playlist`, 'success');
      onClose();
    } catch (err) {
      showToast('Failed to add song', 'error');
    }
  };

  const createAndAdd = async () => {
    if (!newName.trim()) return;
    try {
      const res = await playlistService.create({ name: newName });
      await playlistService.update(res.data._id, { addSong: song._id });
      showToast(`Created "${newName}" and added song`, 'success');
      onClose();
    } catch (err) {
      showToast('Failed to create playlist', 'error');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Add to Playlist</div>
        <div className="modal-subtitle">Adding: {song.title}</div>

        {loading ? (
          <div className="loading-overlay"><div className="loading-spinner" /></div>
        ) : (
          <>
            {playlists.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>
                No playlists yet. Create one below.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16, maxHeight: 200, overflowY: 'auto' }}>
                {playlists.map(pl => (
                  <button
                    key={pl._id}
                    className="nav-item"
                    onClick={() => addToPlaylist(pl._id)}
                    style={{ justifyContent: 'space-between' }}
                  >
                    <span>{pl.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pl.songs?.length || 0} songs</span>
                  </button>
                ))}
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <div className="form-group">
                <label className="form-label">New Playlist</label>
                <input
                  className="form-input"
                  placeholder="Playlist name..."
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && createAndAdd()}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                <button className="btn btn-primary" onClick={createAndAdd} disabled={!newName.trim()}>
                  Create & Add
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
