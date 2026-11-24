import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Sparkles, Tag, Gift, Check, ArrowRight, Clock } from 'lucide-react';
import { isOfferDateValid } from '../../services/offerService';
import { ScrollReveal } from '../common/ScrollReveal';

export const OffersSection = () => {
  const { offers, setSelectedCategory, appliedOffer } = useStore();

  // Filter only enabled and currently active offers from Firestore
  const activeOffers = (offers || []).filter((offer) => {
    if (offer.enabled === false) return false;
    return isOfferDateValid(offer.startDate, offer.endDate);
  });

  if (activeOffers.length === 0) return null;

  const handleDealClick = (e, offer) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (offer.applicableCategory && offer.applicableCategory !== 'all') {
      setSelectedCategory(offer.applicableCategory);
    } else {
      setSelectedCategory('all');
    }

    // Scroll to products section smoothly if needed
    const el = document.querySelector('.products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const formatCategoryLabel = (category) => {
    switch (category) {
      case 'meetha':
        return 'Meetha Paan items';
      case 'royal':
        return 'Royal Special items';
      case 'flavored':
        return 'Flavored Paan items';
      case 'traditional':
        return 'Traditional Paan items';
      case 'all':
      default:
        return 'All eligible paan products';
    }
  };

  return (
    <section className="offers-section" aria-label="Today's Offers & Deals">
      <div className="container">
        <ScrollReveal animation="fade-up" className="offers-section-header">
          <div className="offers-title-wrapper">
            <div className="offers-sparkle-icon">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="offers-title">Today's Offers & Deals</h3>
              <p className="offers-subtitle">
                Automatic combo savings applied at checkout • Handcrafted fresh
              </p>
            </div>
          </div>
          <div className="offers-auto-badge">
            <Tag size={13} />
            <span>Auto-Applied in Cart</span>
          </div>
        </ScrollReveal>

        <div className="offers-grid">
          {activeOffers.map((offer, index) => {
            const isApplied = appliedOffer && appliedOffer.id === offer.id;

            return (
              <ScrollReveal
                key={offer.id}
                animation="fade-up"
                delay={index * 120}
                className={`offer-card ${isApplied ? 'offer-card-active' : ''}`}
              >
                {/* Top Badge & Discount */}
                <div className="offer-card-top">
                  <span className="offer-discount-badge">
                    <Gift size={13} style={{ marginRight: 4 }} />
                    ₹{offer.discountValue} OFF
                  </span>
                  <span className="offer-validity-tag">
                    <Clock size={11} style={{ marginRight: 3 }} />
                    Active Deal
                  </span>
                </div>

                {/* Offer Content */}
                <div className="offer-card-body">
                  <h4 className="offer-card-title">{offer.title}</h4>
                  <p className="offer-card-desc">{offer.description}</p>

                  <div className="offer-meta-row">
                    <span className="offer-meta-label">Min Qty:</span>
                    <span className="offer-meta-val">{offer.minimumQuantity} Items</span>
                  </div>

                  <div className="offer-meta-row">
                    <span className="offer-meta-label">Applies to:</span>
                    <span className="offer-meta-val">
                      {formatCategoryLabel(offer.applicableCategory)}
                    </span>
                  </div>
                </div>

                {/* Footer / CTA */}
                <div className="offer-card-footer">
                  {isApplied ? (
                    <div className="offer-status-applied">
                      <Check size={14} />
                      <span>Applied to Cart!</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn-offer-action"
                      onClick={(e) => handleDealClick(e, offer)}
                      aria-label={`View deal items for ${offer.title}`}
                    >
                      <span>View Deal Items</span>
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

