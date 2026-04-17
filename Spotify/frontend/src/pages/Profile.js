import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { userService } from '../services/api';

const PLANS = [
  { id: '1day', label: '1 Day', cost: 5, days: 1, desc: 'Perfect for a weekend' },
  { id: '7days', label: '7 Days', cost: 15, days: 7, desc: 'A full week ad-free', popular: true },
  { id: '30days', label: '30 Days', cost: 30, days: 30, desc: 'Best value!' },
];

const CheckIcon = () => (
  <svg width="16" height="16" fill="none" stroke="var(--accent)" strokeWidth="2.5" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export default function Profile() {
  const { user, updateUser, showToast } = useApp();
  const [buying, setBuying] = useState(null);
  const [loading, setLoading] = useState(false);

  const premiumActive = user?.isPremium;
  const premiumUntil = user?.premiumUntil ? new Date(user.premiumUntil) : null;

  const buyPremium = async (planId, cost) => {
    if (user.credits < cost) {
      showToast(`Not enough credits. You need ${cost}, you have ${user.credits}.`, 'error');
      return;
    }
    setBuying(planId);
    setLoading(true);
    try {
      const res = await userService.buyPremium(planId);
      updateUser({ credits: res.data.credits, premiumUntil: res.data.premiumUntil, isPremium: true });
      showToast('Premium activated! Enjoy ad-free music 🎵', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Purchase failed', 'error');
    } finally {
      setLoading(false);
      setBuying(null);
    }
  };

  // Simulate earning credits (demo)
  const earnCredits = async () => {
    try {
      const res = await userService.addCredits(10);
      updateUser({ credits: res.data.credits });
      showToast('Earned 10 credits! 💰', 'success');
    } catch (err) {
      showToast('Failed to earn credits', 'error');
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 700 }}>
      <div className="page-header">
        <div className="page-title">Profile</div>
        <div className="page-subtitle">Manage your account and premium subscription</div>
      </div>

      {/* User Card */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        marginBottom: 32,
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent-dim), var(--accent))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-display)',
          color: '#000', flexShrink: 0,
        }}>
          {user?.username?.[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 2 }}>{user?.username}</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>{user?.email}</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div className="credit-badge">🎵 {user?.credits} credits</div>
            {premiumActive ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'var(--accent-glow)', border: '1px solid var(--accent)', borderRadius: 100, fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
                ✦ Premium · expires {premiumUntil?.toLocaleDateString()}
              </div>
            ) : (
              <div style={{ padding: '6px 14px', background: 'var(--bg-elevated)', borderRadius: 100, fontSize: 13, color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                Free Plan
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Credits Section */}
      <div style={{ marginBottom: 32 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>Credits</div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 36, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>{user?.credits}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Available credits</div>
            </div>
            <button className="btn btn-secondary" onClick={earnCredits}>
              + Earn 10 Credits (Demo)
            </button>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Earn credits by playing songs (1 credit per song). Use credits to unlock premium plans and enjoy ad-free listening.
          </div>
        </div>
      </div>

      {/* Premium Plans */}
      <div>
        <div className="section-title" style={{ marginBottom: 4 }}>
          {premiumActive ? '✦ Extend Premium' : 'Go Premium'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
          Remove ads, unlimited skips, and higher audio quality.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          {PLANS.map(plan => (
            <div
              key={plan.id}
              style={{
                background: plan.popular ? 'var(--accent-glow)' : 'var(--bg-card)',
                border: `1px solid ${plan.popular ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: 20,
                position: 'relative',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              {plan.popular && (
                <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: '#000', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Popular
                </div>
              )}
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{plan.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>{plan.cost}</span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>credits</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>{plan.desc}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                {['Ad-free listening', 'Unlimited skips', 'High quality audio'].map(feat => (
                  <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <CheckIcon />{feat}
                  </div>
                ))}
              </div>
              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}
                onClick={() => buyPremium(plan.id, plan.cost)}
                disabled={loading || user?.credits < plan.cost}
              >
                {buying === plan.id ? <span className="loading-spinner" style={{ width: 14, height: 14, borderWidth: 2, borderColor: '#000', borderTopColor: 'transparent' }} /> : `Get ${plan.label}`}
              </button>
              {user?.credits < plan.cost && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
                  Need {plan.cost - user.credits} more credits
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
