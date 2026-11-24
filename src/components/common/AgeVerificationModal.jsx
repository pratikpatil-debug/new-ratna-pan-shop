import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ShieldAlert, X, CheckCircle } from 'lucide-react';

export const AgeVerificationModal = () => {
  const { showAgeDisclaimer, setShowAgeDisclaimer } = useStore();

  if (!showAgeDisclaimer) return null;

  return (
    <div className="modal-backdrop" onClick={() => setShowAgeDisclaimer(false)}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fee2e2', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Statutory Advisory & Compliance</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Responsible Retail & Local Regulations</p>
            </div>
          </div>
          <button className="drawer-close-btn" onClick={() => setShowAgeDisclaimer(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
          <p style={{ marginBottom: '1rem' }}>
            <strong>New Ratna Pan Shop</strong> adheres strictly to all regional regulations, Food Safety and Standards (FSSAI) guidelines, and applicable age restriction mandates.
          </p>
          
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.9rem', marginBottom: '1rem' }}>
            <h5 style={{ color: '#991b1b', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>Age Restrictions</h5>
            <p style={{ fontSize: '0.8rem', color: '#7f1d1d' }}>
              Sale of any tobacco-based or restricted products to minors below 18 years of age is strictly prohibited by law. In production deployment, physical ID verification is mandatory upon delivery or store pickup.
            </p>
          </div>

          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.9rem', marginBottom: '1rem' }}>
            <h5 style={{ color: '#166534', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>100% Tobacco-Free & Family Specials</h5>
            <p style={{ fontSize: '0.8rem', color: '#14532d' }}>
              We proudly specialize in herbal, chocolate, silver, dry fruit, and 100% tobacco-free and supari-free Meetha Paan varieties suitable for everyone.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary btn-full" onClick={() => setShowAgeDisclaimer(false)}>
            <CheckCircle size={16} /> I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
