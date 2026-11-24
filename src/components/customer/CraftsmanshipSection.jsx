import React from 'react';
import { ScrollReveal } from '../common/ScrollReveal';
import { Sparkles, Leaf, ShieldCheck, Clock, Award, CheckCircle2 } from 'lucide-react';

export const CraftsmanshipSection = () => {
  const pillars = [
    {
      id: 'leaves',
      icon: '🌿',
      tag: 'FRESHNESS FIRST',
      title: 'Handpicked Betel Leaves',
      description: 'Sourced directly from Banaras and Magadh plantations. Washed in purified RO water and curated leaf by leaf every morning.',
      highlight: 'Zero Compromise'
    },
    {
      id: 'gulkand',
      icon: '🍯',
      tag: 'ROYAL HERITAGE',
      title: 'Slow-Cured Rose Gulkand',
      description: 'Crafted with premium Damask rose petals, mishri (crystallized rock sugar), and natural spices aged under gentle sunlight.',
      highlight: 'Pure Aroma'
    },
    {
      id: 'counter',
      icon: '⚡',
      tag: 'SHOP PICKUP',
      title: '2-Minute Live Counter Prep',
      description: 'Prepared live right after you order. Handcrafted and folded fresh by experienced paan karigars for maximum crispness.',
      highlight: 'Always Fresh'
    },
    {
      id: 'hygiene',
      icon: '🛡️',
      tag: 'FAMILY ASSURANCE',
      title: '100% Tobacco-Free Options',
      description: 'Clean, celebratory recipes made with silver foil (vark), premium dry fruits, candied saunf, and refreshing extracts.',
      highlight: 'Certified Safe'
    }
  ];

  return (
    <section className="craftsmanship-section" id="heritage-section" aria-label="Our Craftsmanship & Heritage">
      <div className="container">
        {/* Section Header with Scroll Reveal */}
        <ScrollReveal animation="fade-up" className="craftsmanship-header">
          <div className="craftsmanship-badge">
            <Sparkles size={13} style={{ color: 'var(--gold)' }} />
            <span>THE NEW RATNA PROMISE</span>
          </div>
          <h2 className="craftsmanship-title">
            The Art of Authentic <span className="craftsmanship-title-accent">Indian Paan</span>
          </h2>
          <p className="craftsmanship-desc">
            We preserve centuries-old royal paan traditions with modern hygiene and express counter service.
          </p>
        </ScrollReveal>

        {/* 4 Pillars Grid with Staggered Scroll Reveal */}
        <div className="craftsmanship-grid">
          {pillars.map((pillar, index) => (
            <ScrollReveal
              key={pillar.id}
              animation="fade-up"
              delay={index * 120}
              className="craftsmanship-card"
            >
              <div className="craftsmanship-card-glow" />
              
              <div className="craftsmanship-card-top">
                <span className="craftsmanship-card-icon">{pillar.icon}</span>
                <span className="craftsmanship-card-tag">{pillar.tag}</span>
              </div>

              <h3 className="craftsmanship-card-title">{pillar.title}</h3>
              <p className="craftsmanship-card-text">{pillar.description}</p>

              <div className="craftsmanship-card-footer">
                <CheckCircle2 size={14} style={{ color: 'var(--accent-green)' }} />
                <span>{pillar.highlight}</span>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Counter Pickup Spotlight Banner with Scroll Reveal */}
        <ScrollReveal animation="zoom-in" delay={150} className="craftsmanship-banner">
          <div className="craftsmanship-banner-content">
            <div className="craftsmanship-banner-icon-ring">
              <span>🏪</span>
            </div>
            <div>
              <h4 className="craftsmanship-banner-title">
                Skip the Crowd — Order Online, Pick Up at Counter!
              </h4>
              <p className="craftsmanship-banner-sub">
                Select your favorite paan, customize ingredients in the studio, and collect fresh in just 2-3 minutes.
              </p>
            </div>
          </div>
          <div className="craftsmanship-banner-stats">
            <div className="stat-pill">
              <span className="stat-num">~2 min</span>
              <span className="stat-label">Average Prep Time</span>
            </div>
            <div className="stat-pill">
              <span className="stat-num">100%</span>
              <span className="stat-label">Fresh Guaranteed</span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
