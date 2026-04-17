import React, { useState, useCallback } from 'react';
import { searchService } from '../services/api';
import SongListItem from '../components/SongListItem';
import AddToPlaylistModal from '../components/AddToPlaylistModal';

const GENRES = ['Pop', 'Rock', 'Hip Hop', 'Jazz', 'Electronic', 'Classical', 'R&B', 'Country', 'Indie', 'Metal', 'Lo-fi', 'Blues'];
const TYPES = [
  { value: 'all', label: 'All' },
  { value: 'song', label: 'Songs' },
  { value: 'artist', label: 'Artists' },
  { value: 'genre', label: 'Genre' },
];

let debounceTimer;

export default function Search() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [addToPlaylistSong, setAddToPlaylistSong] = useState(null);

  const doSearch = useCallback(async (q, t) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    try {
      const res = await searchService.search(q, t);
      setResults(res.data.songs);
      setSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => doSearch(val, type), 400);
  };

  const handleTypeChange = (t) => {
    setType(t);
    if (query.trim()) doSearch(query, t);
  };

  const searchGenre = (g) => {
    setQuery(g);
    setType('genre');
    doSearch(g, 'genre');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">Search</div>
        <div className="page-subtitle">Find songs, artists, and genres</div>
      </div>

      {/* Search input */}
      <div className="search-input-wrapper">
        <div className="search-icon">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <input
          className="search-input"
          placeholder="Search for songs, artists, genres..."
          value={query}
          onChange={handleInput}
          autoFocus
        />
      </div>

      {/* Type filter */}
      <div className="chips" style={{ marginBottom: 24 }}>
        {TYPES.map(t => (
          <button
            key={t.value}
            className={`tag ${type === t.value ? 'active' : ''}`}
            onClick={() => handleTypeChange(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="loading-overlay"><div className="loading-spinner" /></div>
      ) : searched ? (
        results.length > 0 ? (
          <div>
            <div className="section-header" style={{ marginBottom: 12 }}>
              <div className="section-title">{results.length} result{results.length !== 1 ? 's' : ''}</div>
            </div>
            <div className="song-list">
              {results.map((song, i) => (
                <SongListItem
                  key={song._id}
                  song={song}
                  index={i}
                  queue={results}
                  onAddToPlaylist={setAddToPlaylistSong}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-title">No results for "{query}"</div>
            <div className="empty-state-text">Try a different search term or browse genres below.</div>
          </div>
        )
      ) : (
        /* Browse genres */
        <div>
          <div className="section-title" style={{ marginBottom: 16 }}>Browse Genres</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
            {GENRES.map((genre, i) => {
              const colors = ['#1db954', '#1e90ff', '#ff6b6b', '#f5a623', '#9b59b6', '#1abc9c', '#e67e22', '#3498db', '#e74c3c', '#2ecc71', '#95a5a6', '#34495e'];
              const color = colors[i % colors.length];
              return (
                <div
                  key={genre}
                  onClick={() => searchGenre(genre)}
                  style={{
                    padding: '20px 16px',
                    background: `${color}22`,
                    border: `1px solid ${color}44`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    fontWeight: 700,
                    fontSize: 14,
                    color,
                    fontFamily: 'var(--font-display)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${color}33`; e.currentTarget.style.transform = 'scale(1.02)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${color}22`; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  {genre}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {addToPlaylistSong && (
        <AddToPlaylistModal song={addToPlaylistSong} onClose={() => setAddToPlaylistSong(null)} />
      )}
    </div>
  );
}
