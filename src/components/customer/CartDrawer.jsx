import React, { useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, MapPin, Sparkles, Tag, CheckCircle2 } from 'lucide-react';

export const CartDrawer = () => {
  const {
    cart,
    products,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartDiscount,
    cartFinalTotal,
    appliedOffer,
    offerProgressMessage,
    offerProgressOffer,
    cartTotalItems,
    setActiveView
  } = useStore();

  // Handle body scroll lock & position preservation
  useEffect(() => {
    if (!isCartOpen) return;

    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsCartOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      window.scrollTo({ top: scrollY, behavior: 'instant' });
    };
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  const handleProceedToCheckout = (e) => {
    e.preventDefault();
    setIsCartOpen(false);
    setActiveView('customer-checkout');
  };

  const handleClose = (e) => {
    e.preventDefault();
    setIsCartOpen(false);
  };

  return (
    <div 
      className="drawer-backdrop" 
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Your Order Cart"
    >
      <div className="cart-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-title">
            <ShoppingBag size={22} style={{ color: 'var(--primary)' }} />
            <span>Your Order</span>
            {cartTotalItems > 0 && (
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold-hover)', background: 'var(--gold-light)', padding: '2px 8px', borderRadius: 'var(--radius-full)', border: '1px solid var(--gold-border)' }}>
                {cartTotalItems} {cartTotalItems === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <button 
            type="button" 
            className="drawer-close-btn" 
            onClick={handleClose} 
            aria-label="Close order drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Pickup Notice Banner inside drawer */}
        <div style={{ background: 'rgba(8, 41, 30, 0.75)', borderBottom: '1px solid var(--border-subtle)', padding: '0.65rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-body)' }}>
          <MapPin size={15} style={{ color: 'var(--gold-hover)', flexShrink: 0 }} />
          <span><strong style={{ color: 'var(--gold-bright)' }}>Shop Pickup:</strong> Collect fresh from shop counter</span>
        </div>

        {/* Offers Progress / Applied Banner */}
        {cart.length > 0 && appliedOffer && (
          <div className="cart-offer-applied-banner">
            <div className="cart-offer-applied-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
                <span className="cart-offer-tag">OFFER APPLIED</span>
              </div>
              <span className="cart-offer-saving">- ₹{cartDiscount}</span>
            </div>
            <div className="cart-offer-title">{appliedOffer.title}</div>
            <div className="cart-offer-desc">{appliedOffer.description}</div>
          </div>
        )}

        {cart.length > 0 && !appliedOffer && offerProgressMessage && (
          <div className="cart-offer-progress-banner">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <Sparkles size={16} style={{ color: 'var(--gold-hover)', flexShrink: 0, marginTop: 2 }} />
              <div>
                {offerProgressOffer && (
                  <div style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--primary)', marginBottom: 2 }}>
                    "{offerProgressOffer.title}"
                  </div>
                )}
                <div style={{ fontSize: '0.8rem', color: 'var(--text-body)', fontWeight: 600 }}>
                  {offerProgressMessage}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="drawer-body">
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-muted)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                <ShoppingBag size={30} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Your cart is empty</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Pick something fresh and handcrafted from our paan menu.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={(e) => {
                  e.preventDefault();
                  setIsCartOpen(false);
                  setActiveView('customer-home');
                }}
              >
                Browse Paan
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                  Selected Items
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    clearCart();
                  }}
                  style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}
                >
                  <Trash2 size={12} /> Clear All
                </button>
              </div>

              {cart.map((item, index) => {
                const liveProduct = (products || []).find((p) => p.id === item.product.id) || item.product;
                const isAvailable = liveProduct.isAvailable !== false && liveProduct.available !== false;
                const availableStock = liveProduct.stockQuantity !== undefined ? Number(liveProduct.stockQuantity) : 0;
                const totalOfThisInCart = cart
                  .filter((it) => it.product.id === item.product.id)
                  .reduce((sum, it) => sum + it.quantity, 0);
                const isMaxReached = totalOfThisInCart >= availableStock || !isAvailable;

                return (
                  <div key={`${item.product.id}-${index}`} className="cart-item-card" style={{ opacity: !isAvailable || availableStock === 0 ? 0.8 : 1 }}>
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="cart-item-img"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.product.name}</div>
                      {item.customizableNote && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontStyle: 'italic', marginBottom: '0.2rem' }}>
                          Note: {item.customizableNote}
                        </div>
                      )}
                      <div className="cart-item-unit-price">
                        ₹{item.product.price} each
                        {!isAvailable || availableStock === 0 ? (
                          <span style={{ marginLeft: 6, fontSize: '0.72rem', color: '#dc2626', fontWeight: 800 }}>
                            Currently unavailable
                          </span>
                        ) : availableStock <= 5 ? (
                          <span style={{ marginLeft: 6, fontSize: '0.72rem', color: '#b45309', fontWeight: 600 }}>
                            (Only {availableStock} left)
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="cart-item-actions">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span className="cart-item-total">
                          ₹{item.product.price * item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            removeFromCart(item.product.id, item.customizableNote);
                          }}
                          style={{ color: '#94a3b8', padding: '2px', display: 'flex', alignItems: 'center', transition: 'color 0.15s', cursor: 'pointer' }}
                          title="Remove item"
                          aria-label="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="quantity-stepper" style={{ transform: 'scale(0.88)' }}>
                        <button
                          type="button"
                          className="stepper-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            updateCartQuantity(item.product.id, item.quantity - 1, item.customizableNote);
                          }}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="stepper-value">{item.quantity}</span>
                        <button
                          type="button"
                          className="stepper-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            updateCartQuantity(item.product.id, item.quantity + 1, item.customizableNote);
                          }}
                          disabled={isMaxReached}
                          style={{ opacity: isMaxReached ? 0.45 : 1, cursor: isMaxReached ? 'not-allowed' : 'pointer' }}
                          title={isMaxReached ? `Only ${availableStock} available.` : 'Increase quantity'}
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="drawer-footer">
            <div className="summary-row">
              <span>Subtotal</span>
              <span style={{ fontWeight: 700 }}>₹{cartSubtotal}</span>
            </div>

            {appliedOffer && cartDiscount > 0 && (
              <div className="summary-row" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Tag size={13} /> Offer ({appliedOffer.title})
                </span>
                <span>- ₹{cartDiscount}</span>
              </div>
            )}

            <div className="summary-row total">
              <span>Total Payable</span>
              <span>₹{cartFinalTotal}</span>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-full btn-lg"
              onClick={handleProceedToCheckout}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


