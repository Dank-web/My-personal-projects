import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService, playlistService } from '../services/api';
import { useApp } from '../context/AppContext';
import SongListItem from '../components/SongListItem';
import AddToPlaylistModal from '../components/AddToPlaylistModal';

const HeartIcon = () => (
  <svg width="24" height="24" fill="var(--accent)" viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const PlaylistIcon = () => (
  <svg width="24" height="24" fill="var(--accent)" viewBox="0 0 24 24">
    <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 5h-3v5.5a2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1 2.5-2.5c.57 0 1.08.19 1.5.51V5h4v2z"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

export default function Library() {
  const { user, playSong, showToast } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState('liked');
  const [likedSongs, setLikedSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewPlaylist, setShowNewPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [addToPlaylistSong, setAddToPlaylistSong] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [likedRes, playlistRes] = await Promise.all([
          userService.getLikedSongs(),
          playlistService.getAll(),
        ]);
        setLikedSongs(likedRes.data);
        setPlaylists(playlistRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    try {
      const res = await playlistService.create({ name: newPlaylistName });
      setPlaylists([...playlists, res.data]);
      setNewPlaylistName('');
      setShowNewPlaylist(false);
      showToast('Playlist created!', 'success');
    } catch (err) {
      showToast('Failed to create playlist', 'error');
    }
  };

  const deletePlaylist = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this playlist?')) return;
    try {
      await playlistService.delete(id);
      setPlaylists(playlists.filter(p => p._id !== id));
      showToast('Playlist deleted', 'success');
    } catch (err) {
      showToast('Failed to delete playlist', 'error');
    }
  };

  if (loading) return (
    <div className="page-container">
      <div className="loading-overlay"><div className="loading-spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">Your Library</div>
        <div className="page-subtitle">Liked songs and your playlists</div>
      </div>

      {/* Tabs */}
      <div className="chips" style={{ marginBottom: 24 }}>
        <button className={`tag ${tab === 'liked' ? 'active' : ''}`} onClick={() => setTab('liked')}>
          ♥ Liked Songs ({likedSongs.length})
        </button>
        <button className={`tag ${tab === 'playlists' ? 'active' : ''}`} onClick={() => setTab('playlists')}>
          ♫ Playlists ({playlists.length})
        </button>
      </div>

      {/* Liked Songs Tab */}
      {tab === 'liked' && (
        <>
          {likedSongs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><HeartIcon /></div>
              <div className="empty-state-title">No liked songs yet</div>
              <div className="empty-state-text">Songs you like will appear here. Start exploring!</div>
              <a href="/search" className="btn btn-primary" style={{ marginTop: 16, textDecoration: 'none' }}>Discover Music</a>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <button className="btn btn-primary" onClick={() => playSong(likedSongs[0], likedSongs, 0)}>
                  ▶ Play All
                </button>
              </div>
              <div className="song-list">
                {likedSongs.map((song, i) => (
                  <SongListItem
                    key={song._id}
                    song={song}
                    index={i}
                    queue={likedSongs}
                    onAddToPlaylist={setAddToPlaylistSong}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Playlists Tab */}
      {tab === 'playlists' && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <button className="btn btn-secondary" onClick={() => setShowNewPlaylist(true)}>
              <PlusIcon /> New Playlist
            </button>
          </div>

          {/* New Playlist Form */}
          {showNewPlaylist && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 16, display: 'flex', gap: 10 }}>
              <input
                className="form-input"
                placeholder="Playlist name..."
                value={newPlaylistName}
                onChange={e => setNewPlaylistName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createPlaylist()}
                autoFocus
              />
              <button className="btn btn-primary" onClick={createPlaylist}>Create</button>
              <button className="btn btn-secondary" onClick={() => { setShowNewPlaylist(false); setNewPlaylistName(''); }}>Cancel</button>
            </div>
          )}

          {playlists.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><PlaylistIcon /></div>
              <div className="empty-state-title">No playlists yet</div>
              <div className="empty-state-text">Create a playlist to organize your favorite tracks.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {playlists.map(pl => (
                <div key={pl._id} className="playlist-card" onClick={() => navigate(`/playlist/${pl._id}`)}>
                  <div className="playlist-cover">
                    <PlaylistIcon />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="playlist-name">{pl.name}</div>
                    <div className="playlist-count">{pl.songs?.length || 0} songs</div>
                  </div>
                  <button className="btn-icon" onClick={(e) => deletePlaylist(pl._id, e)} title="Delete playlist">
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {addToPlaylistSong && (
        <AddToPlaylistModal song={addToPlaylistSong} onClose={() => setAddToPlaylistSong(null)} />
      )}
    </div>
  );
}
