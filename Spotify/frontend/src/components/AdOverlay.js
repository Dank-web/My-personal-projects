import React from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const ADS = [
  {
    title: 'Upgrade to Premium',
    body: 'Enjoy ad-free music, unlimited skips, and better audio quality. Just 5 credits for 1 day!',
    cta: 'Go Premium',
    color: 'var(--accent)',
  },
  {
    title: 'Share the Music',
    body: 'Invite friends to SoundSphere and earn bonus credits together. Music is better shared.',
    cta: 'Invite Friends',
    color: '#1e90ff',
  },
  {
    title: 'Upload Your Track',
    body: 'Are you an artist? Upload your music and reach thousands of listeners on SoundSphere.',
    cta: 'Start Uploading',
    color: '#ff6b6b',
  },
];

export default function AdOverlay() {
  const { adCountdown, dismissAd } = useApp();
  const navigate = useNavigate();
  const ad = ADS[Math.floor(Math.random() * ADS.length)];

  const handleCta = () => {
    if (adCountdown === 0) {
      dismissAd();
      navigate('/profile');
    }
  };

  return (
    <div className="ad-overlay" onClick={adCountdown === 0 ? dismissAd : undefined}>
      <div className="ad-card" onClick={(e) => e.stopPropagation()}>
        <div className="ad-tag">Advertisement</div>

        {/* Decorative circle */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: `${ad.color}22`,
          border: `2px solid ${ad.color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <svg width="36" height="36" fill={ad.color} viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>

        <div className="ad-title" style={{ color: ad.color }}>{ad.title}</div>
        <div className="ad-body">{ad.body}</div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', background: ad.color, justifyContent: 'center' }}
          onClick={handleCta}
          disabled={adCountdown > 0}
        >
          {adCountdown > 0 ? `Skip in ${adCountdown}s` : ad.cta}
        </button>

        {adCountdown === 0 && (
          <button
            className="btn btn-ghost"
            style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}
            onClick={dismissAd}
          >
            Continue Listening
          </button>
        )}

        <div className="ad-timer">
          {adCountdown > 0
            ? `Ad ends in ${adCountdown} second${adCountdown !== 1 ? 's' : ''}`
            : 'Ad finished — you can skip now'}
        </div>
      </div>
    </div>
  );
}
