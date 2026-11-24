import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { SHOP_LOGO_URL } from '../../data/initialProducts';
import { Lock, Mail, ArrowRight, Store, KeyRound, ArrowLeft, ShieldCheck } from 'lucide-react';

export const AdminLogin = () => {
  const { adminLogin, setActiveView, shopConfig } = useStore();
  const logoSrc = shopConfig?.logoUrl || SHOP_LOGO_URL;
  const [emailOrPhone, setEmailOrPhone] = useState('admin@newratna.com');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await adminLogin(emailOrPhone, password);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmailOrPhone('admin@newratna.com');
    setPassword('admin123');
    setIsLoading(true);
    try {
      await adminLogin('admin@newratna.com', 'admin123');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 440, width: '100%', background: '#fff', borderRadius: 'var(--radius-lg)', padding: '2.5rem 2rem', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-subtle)' }}>
        
        {/* Shop Logo & Name */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem', boxShadow: '0 4px 14px rgba(142, 20, 28, 0.15)', border: '2px solid var(--gold-border)', padding: 3, overflow: 'hidden' }}>
            <img
              src={logoSrc}
              alt="New Ratna Pan Shop"
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            New Ratna Pan Shop
          </h2>
          <div style={{ fontSize: '0.82rem', color: 'var(--gold-hover)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.08em', marginTop: '0.2rem' }}>
            Shop Admin Portal
          </div>
        </div>

        {/* 1-Click Quick Demo Login helper */}
        <div style={{ background: '#fffcf5', border: '1.5px solid var(--gold-border)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
            <strong style={{ color: 'var(--primary)' }}>Demo Credentials:</strong><br />
            <code>admin@newratna.com</code> / <code>admin123</code>
          </div>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="btn btn-gold btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
          >
            <KeyRound size={12} /> Auto-Fill & Sign In
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Mobile Number or Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="admin@newratna.com or 9876543210"
                required
              />
              <Mail size={16} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <Lock size={16} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Sign In to Portal'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
          <button
            onClick={() => setActiveView('customer-home')}
            style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}
          >
            <ArrowLeft size={14} /> Back to Customer Storefront
          </button>
        </div>
      </div>
    </div>
  );
};
