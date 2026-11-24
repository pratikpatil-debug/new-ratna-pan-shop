import React from 'react';
import { useStore } from '../../context/StoreContext';
import { SHOP_LOGO_URL } from '../../data/initialProducts';
import { Phone, MapPin, Clock, ShieldCheck, Heart, Store } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

export const Footer = () => {
  const { shopConfig, setActiveView, setShowAgeDisclaimer } = useStore();
  const logoSrc = shopConfig?.logoUrl || SHOP_LOGO_URL;

  return (
    <footer style={{ backgroundColor: 'var(--bg-dark)', color: '#E8DFC9', paddingTop: '3.5rem', paddingBottom: '2rem', marginTop: 'auto', borderTop: '1px solid rgba(230, 199, 123, 0.25)' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
          
          {/* Brand Col */}
          <ScrollReveal animation="fade-up" delay={0}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px', flexShrink: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.35)', border: '1.5px solid var(--gold-border)' }}>
                <img
                  src={logoSrc}
                  alt="New Ratna Pan Shop"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em', fontFamily: 'var(--font-heading)' }}>
                New Ratna Pan Shop
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#BDB1A3', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Handcrafting traditional Banarasi, Maghai and flavored paan, royal mukhwas, and chilled refreshments with the highest hygiene and freshest betel leaves.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(27, 115, 67, 0.2)', color: '#4ADE80', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-xs)', fontSize: '0.8rem', fontWeight: 700, border: '1px solid rgba(74, 222, 128, 0.25)' }}>
              <ShieldCheck size={14} /> 100% Quality & Hygiene Assured
            </div>
          </ScrollReveal>

          {/* Quick Info */}
          <ScrollReveal animation="fade-up" delay={100}>
            <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Shop Highlights</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem', color: '#BDB1A3' }}>
              <li>🌿 Fresh Betel Leaves Daily Sourced</li>
              <li>🍫 Special Chocolate & Silver Kesar Paan</li>
              <li>✨ 100% Supari-Free & Tobacco-Free Varieties</li>
              <li>⚡ Quick 2-3 Min Counter Pickup Preparation</li>
              <li>💵 Easy Pay at Counter (Cash / UPI)</li>
            </ul>
          </ScrollReveal>

          {/* Store Info */}
          <ScrollReveal animation="fade-up" delay={200}>
            <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Shop Counter Location</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem', color: '#BDB1A3' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <MapPin size={16} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: 3 }} />
                <span>{shopConfig.address}, {shopConfig.city}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Clock size={16} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                <span>{shopConfig.timing}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Phone size={16} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                <span>{shopConfig.phone}</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Compliance & Admin Col */}
          <ScrollReveal animation="fade-up" delay={300}>
            <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Safety & Portal</h4>
            <p style={{ fontSize: '0.8125rem', color: '#BDB1A3', lineHeight: 1.5, marginBottom: '1rem' }}>
              Committed to responsible retail. Tobacco-free and family-friendly options available.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <button
                onClick={() => setShowAgeDisclaimer(true)}
                style={{ textAlign: 'left', color: '#E8DFC9', fontSize: '0.8125rem', textDecoration: 'underline' }}
              >
                Statutory Advisory & Compliance
              </button>
              <button
                onClick={() => setActiveView('admin-login')}
                style={{ textAlign: 'left', color: 'var(--gold)', fontSize: '0.8125rem', fontWeight: 700 }}
              >
                Shop Admin Portal Access →
              </button>
            </div>
          </ScrollReveal>
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', fontSize: '0.8125rem', color: '#9C9186' }}>
          <div>
            © {new Date().getFullYear()} New Ratna Pan Shop. All rights reserved. Handcrafted fresh at shop counter.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('play-royal-opening'));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                background: 'rgba(230, 199, 123, 0.1)',
                border: '1px solid rgba(230, 199, 123, 0.35)',
                color: 'var(--gold)',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.3rem 0.75rem',
                borderRadius: '999px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.2s ease'
              }}
              title="Replay the cinematic royal opening animation"
            >
              ✦ Replay Royal Intro
            </button>
            <div style={{ color: 'var(--gold)', fontWeight: 700 }}>
              Shop Counter Pickup Model • Pay at Counter
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
