import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Plus, Minus, Check, Clock, Sparkles, ShieldCheck, AlertTriangle, Heart, Zap } from 'lucide-react';

export const ProductModal = () => {
  const { quickViewProduct, setQuickViewProduct, addToCart, setIsCartOpen, isFavorite, toggleFavorite, setExpressBuyProduct } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [customNote, setCustomNote] = useState('');

  // Lock body scroll and preserve scroll position
  useEffect(() => {
    if (!quickViewProduct) return;

    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setQuickViewProduct(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      window.scrollTo({ top: scrollY, behavior: 'instant' });
    };
  }, [quickViewProduct, setQuickViewProduct]);

  if (!quickViewProduct) return null;

  const stock = quickViewProduct.stockQuantity !== undefined ? Number(quickViewProduct.stockQuantity) : 0;
  const isAvailable = quickViewProduct.available !== false && quickViewProduct.isAvailable !== false;
  const isSoldOut = isAvailable && stock <= 0;
  const isUnavailable = !isAvailable;
  const isOrderable = isAvailable && stock > 0;
  const isLowStock = isOrderable && stock <= 5;
  const isMaxReached = quantity >= stock;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!isOrderable) return;
    const added = addToCart(quickViewProduct, quantity, customNote);
    if (added) {
      setQuickViewProduct(null);
      setIsCartOpen(true);
    }
  };


  const handleClose = (e) => {
    if (e) e.preventDefault();
    setQuickViewProduct(null);
  };

  return (
    <div 
      className="modal-backdrop" 
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Details for ${quickViewProduct.name}`}
    >
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        {/* Header */}
        <div className="modal-header">
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em' }}>
            Product Details
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              className={`product-card-fav-btn ${isFavorite(quickViewProduct.id) ? 'active' : ''}`}
              style={{ position: 'static' }}
              onClick={() => toggleFavorite(quickViewProduct.id)}
              aria-label="Toggle favorite"
              title={isFavorite(quickViewProduct.id) ? 'Saved in favorites' : 'Save to favorites'}
            >
              <Heart size={16} fill={isFavorite(quickViewProduct.id) ? '#ef4444' : 'none'} color={isFavorite(quickViewProduct.id) ? '#ef4444' : '#64748b'} />
            </button>
            <button 
              type="button" 
              className="drawer-close-btn" 
              onClick={handleClose}
              aria-label="Close product modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ width: '100%', height: 220, borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1.25rem', background: '#f1f5f9' }}>
            <img
              src={quickViewProduct.image}
              alt={quickViewProduct.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80';
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {quickViewProduct.name}
            </h3>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
              ₹{quickViewProduct.price}
            </div>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
            {quickViewProduct.description}
          </p>

          {/* Availability and Low Stock Notice */}
          <div style={{ marginBottom: '1.25rem' }}>
            {isSoldOut ? (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.84rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}></span>
                This product is currently Sold Out.
              </div>
            ) : isUnavailable ? (
              <div style={{ background: '#f1f5f9', color: '#64748b', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.84rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#94a3b8' }}></span>
                This product is currently unavailable.
              </div>
            ) : isLowStock ? (
              <div style={{ background: '#fef3c7', color: '#b45309', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.84rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #fde68a' }}>
                <AlertTriangle size={15} />
                Low Stock: Only {stock} units left in stock!
              </div>
            ) : (
              <div style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }}></span>
                In Stock & Available ({stock} available)
              </div>
            )}
          </div>

          {/* Tags */}
          {quickViewProduct.tags && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {quickViewProduct.tags.map((tag, idx) => (
                <span key={idx} className="badge-tag badge-bestseller">
                  <Sparkles size={11} /> {tag}
                </span>
              ))}
              <span className="badge-tag badge-veg">
                <ShieldCheck size={11} /> 100% Quality
              </span>
            </div>
          )}

          {/* Ingredients & Prep Info */}
          {quickViewProduct.ingredients && (
            <div style={{ background: 'var(--bg-muted)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginBottom: '1.25rem', fontSize: '0.84rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-body)', marginBottom: '0.25rem' }}>
                Key Ingredients & Preparation:
              </div>
              <div style={{ color: 'var(--text-muted)' }}>
                {quickViewProduct.ingredients}
              </div>
            </div>
          )}

          {/* Customization notes */}
          {quickViewProduct.customizable && isOrderable && (
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">
                Customization Request (Optional):
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Extra Gulkand, Mild sweet, No supari, Less ice..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
              />
            </div>
          )}

          {/* Quantity Controls */}
          {isOrderable && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Select Quantity:</span>
              <div className="quantity-stepper">
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    setQuantity((q) => Math.max(1, q - 1));
                  }}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="stepper-value" style={{ minWidth: 32 }}>{quantity}</span>
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    setQuantity((q) => Math.min(stock, q + 1));
                  }}
                  disabled={isMaxReached}
                  style={{ opacity: isMaxReached ? 0.45 : 1, cursor: isMaxReached ? 'not-allowed' : 'pointer' }}
                  title={isMaxReached ? `Only ${stock} available.` : 'Increase quantity'}
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ flex: 1, minWidth: 140 }}
            disabled={!isOrderable}
            onClick={handleAdd}
          >
            {!isOrderable ? (isSoldOut ? 'Sold Out' : 'Unavailable') : `Add to Cart (₹${quickViewProduct.price * quantity})`}
          </button>
          {isOrderable && (
            <button
              type="button"
              className="btn btn-gold-shimmer"
              style={{
                background: 'var(--gold-gradient)',
                color: '#3E1018',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.65rem 1rem'
              }}
              onClick={() => {
                const prod = quickViewProduct;
                setQuickViewProduct(null);
                setExpressBuyProduct(prod);
              }}
              title="1-Click Express Counter Pickup"
              aria-label="Express 1-click buy"
            >
              <Zap size={14} fill="currentColor" />
              <span>Express Buy</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

