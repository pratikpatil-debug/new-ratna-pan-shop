import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Sparkles, Leaf, Compass, ArrowUp, X, ShoppingBag } from 'lucide-react';

export const QuickFloatingMenu = () => {
  const {
    activeView,
    setActiveView,
    setIsCustomPaanModalOpen,
    setIsFlavorQuizOpen,
    cartTotalItems,
    setIsCartOpen
  } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowScrollTop(scrollY > 280);
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (docHeight > 0) {
        setScrollPercent(Math.min(100, Math.round((scrollY / docHeight) * 100)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Only show on customer views
  if (!activeView.startsWith('customer')) return null;

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsOpen(false);
  };

  return (
    <aside className="quick-floating-container" aria-label="Quick Actions Floating Menu">
      {/* Expanded Quick Options */}
      {isOpen && (
        <div className="quick-floating-popover animate-floating-pop">
          <div className="quick-popover-title">
            <Sparkles size={13} style={{ color: 'var(--gold-hover)' }} />
            <span>Quick Experiences</span>
          </div>

          <button
            type="button"
            className="quick-popover-item"
            onClick={() => {
              setIsCustomPaanModalOpen(true);
              setIsOpen(false);
            }}
          >
            <div className="quick-item-icon-box" style={{ background: 'var(--accent-green-light)', color: 'var(--accent-green)' }}>
              🍃
            </div>
            <div className="quick-item-text">
              <div className="quick-item-name">Craft Custom Paan</div>
              <div className="quick-item-sub">Pick leaf, mukhwas & sweets</div>
            </div>
          </button>

          <button
            type="button"
            className="quick-popover-item"
            onClick={() => {
              setIsFlavorQuizOpen(true);
              setIsOpen(false);
            }}
          >
            <div className="quick-item-icon-box" style={{ background: 'var(--gold-surface)', color: 'var(--gold-hover)' }}>
              ✨
            </div>
            <div className="quick-item-text">
              <div className="quick-item-name">Flavor Matcher Quiz</div>
              <div className="quick-item-sub">Find your perfect taste in 3 steps</div>
            </div>
          </button>

          <button
            type="button"
            className="quick-popover-item"
            onClick={() => {
              setActiveView('customer-tracking');
              setIsOpen(false);
            }}
          >
            <div className="quick-item-icon-box" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              📋
            </div>
            <div className="quick-item-text">
              <div className="quick-item-name">Track Pickup Token</div>
              <div className="quick-item-sub">Check live prep status</div>
            </div>
          </button>

          {showScrollTop && (
            <button
              type="button"
              className="quick-popover-item"
              onClick={handleScrollTop}
            >
              <div className="quick-item-icon-box" style={{ background: '#f1f5f9', color: '#475569' }}>
                <ArrowUp size={15} />
              </div>
              <div className="quick-item-text">
                <div className="quick-item-name">Back to Top</div>
                <div className="quick-item-sub">Scroll to page top</div>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Main Trigger Button */}
      <div className="quick-floating-buttons-row">
        {showScrollTop && !isOpen && (
          <button
            type="button"
            className="quick-scroll-top-btn"
            onClick={handleScrollTop}
            aria-label={`Scroll to top (${scrollPercent}%)`}
            title={`Scroll to top (${scrollPercent}%)`}
          >
            <svg className="scroll-progress-ring" viewBox="0 0 40 40" aria-hidden="true">
              <circle className="progress-ring-track" cx="20" cy="20" r="17" />
              <circle
                className="progress-ring-indicator"
                cx="20"
                cy="20"
                r="17"
                style={{
                  strokeDasharray: '106.8',
                  strokeDashoffset: `${106.8 - (106.8 * scrollPercent) / 100}`
                }}
              />
            </svg>
            <ArrowUp size={15} className="scroll-top-icon" />
          </button>
        )}

        <button
          type="button"
          className={`quick-floating-main-btn ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Toggle Quick Experiences Menu"
          title="Explore Custom Paan & Experiences"
        >
          {isOpen ? (
            <X size={20} />
          ) : (
            <>
              <Sparkles size={18} className="btn-sparkle-spin" />
              <span className="quick-btn-label">Studio & Quiz</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
