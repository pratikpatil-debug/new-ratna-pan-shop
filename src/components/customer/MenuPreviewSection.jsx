import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Sparkles, ShoppingBag, Plus, ArrowRight, Check } from 'lucide-react';
import { ScrollReveal } from '../common/ScrollReveal';
import { ProductParticleAssembler } from './ProductParticleAssembler';

export const MenuPreviewSection = () => {
  const { products, addToCart, cart = [], showToast, setSelectedCategory } = useStore();

  // Find the 3 highlighted royal signature paans
  const banarasiProd = products.find((p) => p.id === 'prod-03' || p.name.includes('Banaras')) || {
    id: 'prod-03',
    name: 'Banarasi Paan',
    price: 40,
    description: 'Classic Banarasi leaf hand-crafted with traditional aromatic spices and authentic roasted kattha.',
    image: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/e16b1286-bac1-4f83-a772-5f7feaaefd72_e04171a8-c0f4-4df7-b05c-c8aaf5deef8a.jpg',
    category: 'traditional'
  };

  const meethaProd = products.find((p) => p.id === 'prod-21' || p.name.includes('Rampyari') || p.category === 'meetha') || {
    id: 'prod-21',
    name: 'Shahi Meetha Paan',
    price: 60,
    description: 'Heritage sweet recipe prepared with rich royal chutney, aromatic dry dates, and sweet fennel pearls.',
    image: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/14a25a25-80fc-4d44-a42e-62004d697657_e5aab33e-4d64-40fa-bb8c-fc5b8b49e006.jpg_compressed',
    category: 'meetha'
  };

  const royalProd = products.find((p) => p.id === 'prod-09' || p.name.includes('Kesar') || p.category === 'royal') || {
    id: 'prod-09',
    name: 'Royal Silver Leaf Paan',
    price: 90,
    description: 'Supreme Kashmiri saffron strands blended with royal dry fruits and pure edible silver vark delicacy.',
    image: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/ee04ba6c-a0b0-4249-8364-c61de1067c26_47835704-1c0a-4f7f-97d4-91a8037f9015.jpg',
    category: 'royal'
  };

  const previewItems = [
    {
      ...banarasiProd,
      badge: 'Heritage Classic',
      displayTitle: 'Banarasi Paan',
      image: banarasiProd.image || 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/e16b1286-bac1-4f83-a772-5f7feaaefd72_e04171a8-c0f4-4df7-b05c-c8aaf5deef8a.jpg'
    },
    {
      ...meethaProd,
      badge: 'Bestseller',
      displayTitle: 'Meetha Paan',
      image: meethaProd.image || 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/14a25a25-80fc-4d44-a42e-62004d697657_e5aab33e-4d64-40fa-bb8c-fc5b8b49e006.jpg_compressed'
    },
    {
      ...royalProd,
      badge: 'Royal Signature',
      displayTitle: 'Royal Silver Leaf Paan',
      image: '/images/hero-royal-paan.jpg' // Using our magnificent generated royal paan for the silver leaf card!
    }
  ];

  const handleAddToCart = (e, prod) => {
    e.stopPropagation();
    addToCart(prod, 1);
    if (showToast) {
      showToast(`Added ${prod.displayTitle || prod.name} to order`, 'success');
    }
  };

  const getItemQty = (prodId) => {
    const item = cart.find((i) => i.id === prodId);
    return item ? item.quantity : 0;
  };

  const handleScrollToFullMenu = () => {
    const el = document.getElementById('menu-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="menu-preview-section" id="menu-preview" aria-label="Royal Signature Menu Preview">
      <div className="container">
        {/* Luxury Gold Divider Header */}
        <div className="royal-section-divider">
          <span className="divider-line" />
          <span className="divider-emblem">✦ 👑 ✦</span>
          <span className="divider-line" />
        </div>

        <ScrollReveal animation="fade-up" className="menu-preview-header">
          <div className="menu-preview-eyebrow">
            <Sparkles size={14} className="gold-sparkle-spin" />
            <span>SIGNATURE DELICACIES</span>
          </div>
          <h2 className="menu-preview-title">
            The Royal Selection
          </h2>
          <p className="menu-preview-subtitle">
            Handcrafted Banarasi, fragrant Meetha, and gold-garnished Silver Leaf delicacies, rolled fresh when you order.
          </p>
        </ScrollReveal>

        {/* 3 Horizontal Cards */}
        <div className="menu-preview-grid">
          {previewItems.map((item, idx) => {
            const qty = getItemQty(item.id);

            return (
              <ProductParticleAssembler key={item.id} index={idx}>
                <div className="royal-preview-card">
                  {/* Badge */}
                  <div className="preview-card-badge">
                    <span>{item.badge}</span>
                  </div>

                  {/* Image Frame */}
                  <div className="preview-image-wrapper">
                    <img
                      src={item.image}
                      alt={item.displayTitle}
                      className="preview-card-image"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/ee04ba6c-a0b0-4249-8364-c61de1067c26_47835704-1c0a-4f7f-97d4-91a8037f9015.jpg';
                      }}
                    />
                    <div className="preview-image-overlay" />
                    <div className="preview-card-price-chip">
                      <span className="currency-symbol">₹</span>
                      <span className="price-num">{item.price}</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="preview-card-body">
                    <h3 className="preview-card-name">{item.displayTitle}</h3>
                    <p className="preview-card-desc">{item.description}</p>

                    <div className="preview-card-footer">
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, item)}
                        className={`btn-royal-order btn-gold-shimmer ${qty > 0 ? 'in-cart' : ''}`}
                        aria-label={`Add ${item.displayTitle} to order`}
                      >
                        <span className="btn-shimmer-sweep" aria-hidden="true" />
                        {qty > 0 ? (
                          <>
                            <Check size={15} />
                            <span>Added ({qty})</span>
                          </>
                        ) : (
                          <>
                            <Plus size={15} />
                            <span>Order Now</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </ProductParticleAssembler>
            );
          })}
        </div>

        {/* View All CTA */}
        <div className="menu-preview-cta-row">
          <button
            type="button"
            onClick={handleScrollToFullMenu}
            className="btn-royal-view-all"
          >
            <span>Explore All 29+ Paan Delicacies</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
};
