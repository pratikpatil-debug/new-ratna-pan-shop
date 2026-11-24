import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { SHOP_LOGO_URL } from '../../data/initialProducts';
import { ShoppingBag, Clock, Store, MapPin, Menu as MenuIcon, X, Sparkles, Crown } from 'lucide-react';
import { FontThemeSwitcher } from './FontThemeSwitcher';

export const Header = () => {
  const {
    activeView,
    setActiveView,
    cartTotalItems,
    setIsCartOpen,
    isAdminAuthenticated,
    shopConfig,
    setIsCustomPaanModalOpen
  } = useStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const [badgeBump, setBadgeBump] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (cartTotalItems > 0) {
      setBadgeBump(true);
      const timer = setTimeout(() => setBadgeBump(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartTotalItems]);

  const isCustomerView = activeView.startsWith('customer');
  const shopName = shopConfig?.name || 'New Ratna Pan Shop';

  const navigateToSection = (sectionId) => {
    setMobileMenuOpen(false);
    if (activeView !== 'customer-home') {
      setActiveView('customer-home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOrderNow = () => {
    setMobileMenuOpen(false);
    if (cartTotalItems > 0) {
      setIsCartOpen(true);
    } else {
      navigateToSection('menu-section');
    }
  };

  return (
    <>
      {/* Top Notice Micro-Bar */}
      <div className="top-notice-bar royal-notice-bar">
        <div className="container top-notice-inner">
          <div className="top-notice-left">
            <span className="pickup-counter-badge">
              <MapPin size={12} />
              <span>SHOP COUNTER PICKUP ONLY</span>
            </span>
            <span className="top-notice-timing">
              <Clock size={12} style={{ color: 'var(--gold)' }} />
              <span>{shopConfig?.timing || '10:00 AM – 11:30 PM'}</span>
            </span>
          </div>

          <div className="top-notice-right">
            <span className="notice-pill">
              <span className="status-live-dot" />
              Counter is {shopConfig?.isOpen !== false ? 'OPEN' : 'CLOSED'}
            </span>
            {isCustomerView ? (
              <button
                type="button"
                onClick={() => setActiveView(isAdminAuthenticated ? 'admin-dashboard' : 'admin-login')}
                className="mode-toggle-link"
                title="Switch to Shop Admin Portal"
              >
                Admin Portal →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveView('customer-home')}
                className="mode-toggle-link"
                title="Return to Customer Storefront"
              >
                ← Customer Menu
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Luxury Sticky Header */}
      <header className={`site-header royal-header-theme ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container header-inner">
          {/* Left: Brand Logo in Royal Serif */}
          <div
            className="brand-logo"
            onClick={() => {
              setActiveView('customer-home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            title={shopName}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setActiveView('customer-home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <div className="brand-crown-icon">
              <Crown size={20} className="gold-crown-glow" />
            </div>
            <div className="brand-text">
              <h1 className="brand-title">{shopName}</h1>
              <span className="brand-tagline">ROYAL HERITAGE PAAN</span>
            </div>
          </div>

          {/* Center: Clean Navigation Links (Menu • Heritage • Custom Roll) */}
          <nav className="header-nav royal-nav-links" aria-label="Main Navigation">
            <button
              type="button"
              onClick={() => navigateToSection('menu-section')}
              className="royal-nav-link"
            >
              Menu
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('heritage-section')}
              className="royal-nav-link"
            >
              Heritage
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCustomPaanModalOpen(true);
              }}
              className="royal-nav-link nav-highlight"
            >
              Custom Roll ✦
            </button>
          </nav>

          {/* Right: Gold Pill "Order Now" Button & Cart Drawer */}
          <div className="header-actions">
            {/* Aesthetic Typography Theme Switcher */}
            <div className="desktop-only-action">
              <FontThemeSwitcher />
            </div>

            {/* Prominent Gold Pill "Order Now" Button */}
            <button
              type="button"
              onClick={handleOrderNow}
              className="btn-gold-order-now"
              aria-label="Order Now"
            >
              <span>Order Now</span>
              <Sparkles size={14} className="order-sparkle" />
            </button>

            {/* Cart Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="cart-button royal-cart-btn"
              aria-label={`View order cart (${cartTotalItems} items)`}
            >
              <ShoppingBag size={17} />
              {cartTotalItems > 0 && (
                <span className={`cart-badge ${badgeBump ? 'bump' : ''}`}>
                  {cartTotalItems}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              className="mobile-nav-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <MenuIcon size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer animate-fade-in">
            <button
              type="button"
              onClick={() => navigateToSection('menu-section')}
              className="mobile-nav-item"
            >
              <span>Menu</span>
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('heritage-section')}
              className="mobile-nav-item"
            >
              <span>Heritage</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setIsCustomPaanModalOpen(true);
              }}
              className="mobile-nav-item highlight"
            >
              <span>Custom Roll ✦</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setActiveView('customer-tracking');
              }}
              className="mobile-nav-item"
            >
              <span>Track Order</span>
            </button>
            <div style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid rgba(230, 199, 123, 0.2)' }}>
              <FontThemeSwitcher />
            </div>
            <button
              type="button"
              onClick={handleOrderNow}
              className="mobile-order-btn"
            >
              <span>Order Now</span>
              <Sparkles size={14} />
            </button>
          </div>
        )}
      </header>
    </>
  );
};
