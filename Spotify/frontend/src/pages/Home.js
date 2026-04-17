import React, { useState, useEffect } from 'react';
import { songService, searchService } from '../services/api';
import { useApp } from '../context/AppContext';
import SongCard from '../components/SongCard';
import SongListItem from '../components/SongListItem';
import AddToPlaylistModal from '../components/AddToPlaylistModal';

const GENRES = ['Pop', 'Rock', 'Hip Hop', 'Jazz', 'Electronic', 'Classical', 'R&B', 'Country', 'Indie', 'Metal'];

export default function Home() {
  const { user, playSong } = useApp();
  const [trending, setTrending] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addToPlaylistSong, setAddToPlaylistSong] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [trendRes, recRes] = await Promise.all([
          songService.getTrending(),
          searchService.recommend(null),
        ]);
        setTrending(trendRes.data);
        setRecommended(recRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) return (
    <div className="page-container">
      <div className="loading-overlay"><div className="loading-spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
    </div>
  );

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title">{greeting()}, {user?.username} 👋</div>
        <div className="page-subtitle">
          {user?.isPremium
            ? `✦ Premium active — enjoy ad-free listening`
            : `${user?.credits} credits available · Go premium for ad-free music`}
        </div>
      </div>

      {/* Premium Banner (for free users) */}
      {!user?.isPremium && (
        <div className="premium-banner">
          <div>
            <div className="premium-title">✦ Unlock Premium</div>
            <div className="premium-desc">Remove ads, unlimited skips, and better audio quality — starting at just 5 credits.</div>
          </div>
          <a href="/profile" className="btn btn-primary" style={{ flexShrink: 0, textDecoration: 'none' }}>
            Get Premium
          </a>
        </div>
      )}

      {/* Trending */}
      {trending.length > 0 && (
        <div className="section">
          <div className="section-header">
            <div className="section-title">🔥 Trending Now</div>
            <span className="section-link" onClick={() => playSong(trending[0], trending, 0)}>
              Play all
            </span>
          </div>
          <div className="songs-grid">
            {trending.slice(0, 8).map((song, i) => (
              <SongCard key={song._id} song={song} queue={trending} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* All Songs List */}
      {recommended.length > 0 && (
        <div className="section">
          <div className="section-header">
            <div className="section-title">🎵 Discover Music</div>
          </div>
          <div className="song-list">
            {recommended.map((song, i) => (
              <SongListItem
                key={song._id}
                song={song}
                index={i}
                queue={recommended}
                onAddToPlaylist={setAddToPlaylistSong}
              />
            ))}
          </div>
        </div>
      )}

      {trending.length === 0 && recommended.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="64" height="64" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
          <div className="empty-state-title">No songs yet</div>
          <div className="empty-state-text">Be the first to upload music to SoundSphere!</div>
          <a href="/upload" className="btn btn-primary" style={{ marginTop: 16, textDecoration: 'none' }}>Upload a Song</a>
        </div>
      )}

      {addToPlaylistSong && (
        <AddToPlaylistModal song={addToPlaylistSong} onClose={() => setAddToPlaylistSong(null)} />
      )}
    </div>
  );
}
