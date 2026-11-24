import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { ShoppingBag, ArrowDown, Search, X, Sparkles, Wand2, Compass } from 'lucide-react';
import { HeroGoldenParticles } from './HeroGoldenParticles';

export const HeroBanner = () => {
  const {
    searchQuery,
    setSearchQuery,
    setIsCartOpen,
    cartTotalItems,
    setIsCustomPaanModalOpen,
    setIsFlavorQuizOpen,
    setQuickViewProduct,
    products
  } = useStore();

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (window.innerWidth > 992) {
        const x = (e.clientX / window.innerWidth - 0.5) * 10;
        const y = (e.clientY / window.innerHeight - 0.5) * 10;
        setMousePos({ x, y });
      }
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleScrollToMenu = () => {
    const el = document.getElementById('menu-preview') || document.getElementById('menu-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const ingredientCards = [
    {
      id: 'gulkand',
      image: '/images/ingredient-gulkand.jpg',
      label: 'Rose Gulkand',
      sub: 'Slow-Cured Petals',
      className: 'ingredient-card-1',
      style: { '--float-duration': '4.8s', '--float-delay': '0s' }
    },
    {
      id: 'silver-foil',
      image: '/images/ingredient-silver-foil.jpg',
      label: 'Silver Foil',
      sub: '99.9% Edible Vark',
      className: 'ingredient-card-2',
      style: { '--float-duration': '5.8s', '--float-delay': '0.9s' }
    },
    {
      id: 'sweet-saffron',
      image: '/images/ingredient-saffron.jpg',
      label: 'Sweet Saffron',
      sub: 'Kashmiri Mongra',
      className: 'ingredient-card-3',
      style: { '--float-duration': '4.2s', '--float-delay': '1.8s' }
    }
  ];

  return (
    <section className="hero-section royal-hero-theme" id="hero-banner">
      {/* 1. Deep Multi-Layered Emerald & Ambient Golden Lighting Effects */}
      <div className="hero-radial-glow hero-glow-primary" aria-hidden="true" />
      <div className="hero-radial-glow hero-glow-gold" aria-hidden="true" />
      <div className="hero-ambient-spotlight" aria-hidden="true" />

      {/* 2. Golden Particle System: Glowing Gold Specks, Shimmering Stars, Drifting Damask Rose Petals */}
      <HeroGoldenParticles />

      <div className="container">
        <div className="hero-content">
          {/* Left Content Column */}
          <div className="hero-text-col">
            {/* Heritage Badge */}
            <div className="hero-royal-tag animate-fade-in">
              <span className="royal-tag-icon">✦</span>
              <span>ROYAL HERITAGE • HANDCRAFTED FRESH</span>
              <span className="royal-tag-pickup">COUNTER PICKUP</span>
            </div>

            {/* Headline with Staggered Line Reveals */}
            <h1 className="hero-title" aria-label="Crafted Tradition. Contemporary Taste.">
              <span className="hero-title-line hero-line-1">CRAFTED TRADITION.</span>
              <span className="hero-title-line hero-line-2 hero-title-gold">CONTEMPORARY</span>
              <span className="hero-title-line hero-line-3">TASTE.</span>
            </h1>

            {/* Supporting Text smoothly fades in after headline */}
            <p className="hero-desc animate-desc-reveal">
              Experience bespoke Banarasi, Meetha, and Royal Silver Leaf paan, rolled fresh on order with slow-cured rose gulkand and pure edible vark.
            </p>

            {/* CTA Buttons: Shimmering Order Now, Glowing Explore Menu, Custom Roll */}
            <div className="hero-cta-group animate-cta-reveal">
              {/* Order Now - Moving gold shimmer */}
              <button
                type="button"
                className="btn-royal-order-now btn-gold-shimmer"
                onClick={handleScrollToMenu}
                aria-label="Order Now for Counter Pickup"
              >
                <span className="btn-shimmer-sweep" aria-hidden="true" />
                <ShoppingBag size={18} />
                <span>Order Now</span>
              </button>

              {/* Explore The Menu - Subtle gold outline glow */}
              <button
                type="button"
                className="btn-royal-explore btn-subtle-glow"
                onClick={handleScrollToMenu}
                aria-label="Explore The Menu"
              >
                <span>Explore The Menu</span>
                <ArrowDown size={17} className="btn-icon-bounce" />
              </button>

              {/* Custom Roll ✦ Studio */}
              <button
                type="button"
                className="btn-royal-custom"
                onClick={() => setIsCustomPaanModalOpen(true)}
                aria-label="Custom Roll Paan Studio"
              >
                <Sparkles size={16} />
                <span>Custom Roll ✦</span>
              </button>
            </div>

            {/* Interactive Taste Quiz Pill & Trust Row */}
            <div className="hero-sub-actions animate-trust-reveal">
              <button
                type="button"
                className="hero-quiz-chip"
                onClick={() => setIsFlavorQuizOpen(true)}
                title="Find your taste match in 3 questions"
              >
                <Sparkles size={14} style={{ color: 'var(--gold-bright)' }} />
                <span>Paan Flavor Matcher Quiz →</span>
              </button>

              <div className="hero-trust-chips">
                <span className="trust-chip">🌿 100% Tobacco-Free</span>
                <span className="trust-chip">⚡ 2-Min Live Prep</span>
                <span className="trust-chip">🏪 Shop Counter Pickup</span>
              </div>
            </div>

            {/* Quick Menu Search */}
            <div className="hero-search-wrapper animate-search-reveal">
              <Search size={16} style={{ color: 'var(--gold)' }} />
              <input
                type="text"
                placeholder="Search Banarasi, Silver Kesar, Chocolate, Gulkand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="hero-search-input"
                aria-label="Search paan flavors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hero-search-clear"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Right Product Visual Column */}
          <div className="hero-visual-col animate-visual-reveal">
            {/* Center Royal Paan Plate Showcase with entrance scaling and subtle parallax */}
            <div
              className="hero-product-stage"
              style={{
                transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`
              }}
            >
              {/* Soft Golden Glow Around the Brass Plate */}
              <div className="stage-gold-halo brass-plate-halo" aria-hidden="true" />
              <div className="brass-rim-glow" aria-hidden="true" />

              {/* Floating Paan Product Container: Slow 4-6s vertical float without excessive rotation */}
              <div className="hero-paan-floating-wrap">
                {/* Main Paan Image Pod */}
                <div className="hero-image-pod">
                  <img
                    src="/images/hero-royal-paan.jpg"
                    alt="Royal Banarasi Silver Leaf Paan on Ornate Brass Thali"
                    className="hero-paan-main-img"
                    loading="eager"
                    onClick={() => {
                      const prod = products?.find((p) => p.id === 'prod-09' || p.category === 'royal');
                      if (prod) setQuickViewProduct(prod);
                    }}
                    title="Royal Silver Leaf Paan - Click to view ingredients"
                  />

                  {/* Gentle Highlight Moving Across the Silver Foil (Chaandi Ka Vark Shimmer) */}
                  <div className="silver-foil-shimmer-sweep" aria-hidden="true" />
                </div>

                {/* Floating Product Badge Tag */}
                <div className="hero-signature-badge">
                  <div className="signature-badge-icon">👑</div>
                  <div className="signature-badge-text">
                    <div className="sig-badge-title">Royal Silver Leaf Paan</div>
                    <div className="sig-badge-sub">Kashmiri Saffron & Pure Vark</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Three Floating Glassmorphism Ingredient Cards */}
            <div className="floating-ingredients-container" aria-label="Key Ingredients">
              {ingredientCards.map((card) => (
                <div
                  key={card.id}
                  className={`floating-ingredient-card ${card.className}`}
                  style={card.style}
                >
                  <div className="ingredient-img-thumb">
                    <img
                      src={card.image}
                      alt={card.label}
                      className="ingredient-img"
                      loading="lazy"
                    />
                  </div>
                  <div className="ingredient-card-info">
                    <div className="ingredient-card-label">{card.label}</div>
                    <div className="ingredient-card-sub">{card.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cinematic Scroll Prompt to Assemble Signature Paan Leaf Experience */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            className="hero-scroll-assembly-prompt animate-fade-in"
            onClick={handleScrollToMenu}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleScrollToMenu();
            }}
            title="Scroll down to witness product cards assemble from sparkling paan leaf particles"
          >
            <span className="prompt-leaf-icon" aria-hidden="true">🍃</span>
            <span className="prompt-text">Scroll to Assemble Handcrafted Paans</span>
            <span className="prompt-chevron" aria-hidden="true">↓</span>
          </div>
        </div>
      </div>
    </section>
  );
};
