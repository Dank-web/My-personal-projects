import React, { useState, useRef } from 'react';
import { songService } from '../services/api';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const GENRES = ['Pop', 'Rock', 'Hip Hop', 'Jazz', 'Electronic', 'Classical', 'R&B', 'Country', 'Indie', 'Metal', 'Lo-fi', 'Blues', 'Soul', 'Funk', 'Reggae', 'Other'];

export default function Upload() {
  const { showToast, playSong } = useApp();
  const navigate = useNavigate();
  const audioInputRef = useRef();
  const [form, setForm] = useState({ title: '', artist: '', genre: 'Pop', lyrics: '' });
  const [audioFile, setAudioFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [uploadedSong, setUploadedSong] = useState(null);

  const handleAudioSelect = (file) => {
    if (!file || !file.type.startsWith('audio/')) {
      showToast('Please select a valid audio file', 'error');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      showToast('File too large (max 20MB)', 'error');
      return;
    }
    setAudioFile(file);
    // Auto-fill title from filename
    if (!form.title) {
      setForm(f => ({ ...f, title: file.name.replace(/\.[^/.]+$/, '') }));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleAudioSelect(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!audioFile) return showToast('Please select an audio file', 'error');
    if (!form.title.trim() || !form.artist.trim()) return showToast('Title and artist are required', 'error');

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('audio', audioFile);
      fd.append('title', form.title);
      fd.append('artist', form.artist);
      fd.append('genre', form.genre);
      fd.append('lyrics', form.lyrics);

      const res = await songService.upload(fd);
      setUploadedSong(res.data);
      showToast('Song uploaded successfully! 🎵', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Upload failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (uploadedSong) {
    return (
      <div className="page-container" style={{ maxWidth: 500 }}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <div className="page-title" style={{ fontSize: 28, marginBottom: 8 }}>Upload Successful!</div>
          <div style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
            "{uploadedSong.title}" by {uploadedSong.artist} is now live.
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => playSong(uploadedSong)}>
              ▶ Play Now
            </button>
            <button className="btn btn-secondary" onClick={() => { setUploadedSong(null); setAudioFile(null); setForm({ title: '', artist: '', genre: 'Pop', lyrics: '' }); }}>
              Upload Another
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/')}>
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 600 }}>
      <div className="page-header">
        <div className="page-title">Upload Music</div>
        <div className="page-subtitle">Share your music with the SoundSphere community</div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Audio drop zone */}
        <div
          className={`upload-zone ${dragging ? 'dragging' : ''}`}
          style={{ marginBottom: 24 }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => audioInputRef.current?.click()}
        >
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*"
            style={{ display: 'none' }}
            onChange={e => handleAudioSelect(e.target.files[0])}
          />
          {audioFile ? (
            <>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎵</div>
              <div className="upload-text" style={{ color: 'var(--accent)', fontWeight: 600 }}>{audioFile.name}</div>
              <div className="upload-hint">{(audioFile.size / 1024 / 1024).toFixed(2)} MB · Click to change</div>
            </>
          ) : (
            <>
              <div className="upload-icon">
                <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div className="upload-text">Drop your audio file here, or click to browse</div>
              <div className="upload-hint">MP3, WAV, OGG, M4A up to 20MB</div>
            </>
          )}
        </div>

        {/* Metadata */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Song Title *</label>
            <input
              className="form-input"
              placeholder="My Awesome Track"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Artist *</label>
            <input
              className="form-input"
              placeholder="Artist name"
              value={form.artist}
              onChange={e => setForm({ ...form, artist: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Genre</label>
          <select
            className="form-select"
            value={form.genre}
            onChange={e => setForm({ ...form, genre: e.target.value })}
          >
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Lyrics (optional)</label>
          <textarea
            className="form-input"
            placeholder="Add lyrics here..."
            rows={5}
            value={form.lyrics}
            onChange={e => setForm({ ...form, lyrics: e.target.value })}
            style={{ resize: 'vertical', lineHeight: 1.6 }}
          />
        </div>

        <button
          className="btn btn-primary"
          type="submit"
          disabled={loading || !audioFile}
          style={{ width: '100%', justifyContent: 'center', padding: '14px 24px', fontSize: 15 }}
        >
          {loading ? (
            <>
              <span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2, borderColor: '#000', borderTopColor: 'transparent' }} />
              Uploading...
            </>
          ) : (
            'Upload Song'
          )}
        </button>

        <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>
          By uploading, you confirm you own or have rights to this content.
        </div>
      </form>
    </div>
  );
}
