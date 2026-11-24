import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Plus, Minus, Check, Sparkles, Clock, AlertTriangle, Heart } from 'lucide-react';
import { ProductParticleAssembler } from './ProductParticleAssembler';

export const ProductCard = ({ product, index = 0 }) => {
  const { cart, addToCart, updateCartQuantity, setIsCartOpen, setQuickViewProduct, isFavorite, toggleFavorite } = useStore();
  const [justAdded, setJustAdded] = useState(false);

  const stock = product.stockQuantity !== undefined ? Number(product.stockQuantity) : 0;
  const isAvailable = product.available !== false && product.isAvailable !== false;
  const isSoldOut = isAvailable && stock === 0;
  const isUnavailable = !isAvailable;
  const isLowStock = isAvailable && stock >= 1 && stock <= 5;
  const isOrderable = isAvailable && stock > 0;

  const cartItem = cart.find((item) => item.product.id === product.id);
  const currentQty = cartItem ? cartItem.quantity : 0;
  const isMaxReached = currentQty >= stock;

  const handleAddClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOrderable) return;
    const added = addToCart(product, 1);
    if (added) {
      setIsCartOpen(true);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 900);
    }
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isMaxReached) {
      return;
    }
    updateCartQuantity(product.id, currentQty + 1, cartItem?.customizableNote || '');
  };

  const handleDecrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    updateCartQuantity(product.id, currentQty - 1, cartItem?.customizableNote || '');
  };

  return (
    <ProductParticleAssembler index={index} isSoldOut={isSoldOut}>
      <div className={`product-card ${!isOrderable ? 'product-card-sold-out' : ''}`}>
        {/* Product Image */}
        <div 
          className="product-card-img-wrapper" 
          onClick={() => setQuickViewProduct(product)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') setQuickViewProduct(product); }}
          aria-label={`View details for ${product.name}`}
        >
          <img
            src={product.image}
            alt={product.name}
            className="product-card-img"
            loading="lazy"
            style={{ opacity: !isOrderable ? 0.88 : 1 }}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80';
            }}
          />

          {/* Badges */}
          <div className="product-badge-corner">
            {isSoldOut ? (
              <span className="badge-tag" style={{ background: '#ef4444', color: '#ffffff', fontWeight: 800, letterSpacing: '0.04em' }}>
                SOLD OUT
              </span>
            ) : isUnavailable ? (
              <span className="badge-tag" style={{ background: '#64748b', color: '#ffffff', fontWeight: 800, letterSpacing: '0.04em' }}>
                UNAVAILABLE
              </span>
            ) : isLowStock ? (
              <span className="badge-tag" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontWeight: 800, letterSpacing: '0.03em' }}>
                <AlertTriangle size={11} /> LOW STOCK • {stock} LEFT
              </span>
            ) : product.tags && product.tags[0] ? (
              <span className="badge-tag badge-bestseller">
                <Sparkles size={11} /> {product.tags[0]}
              </span>
            ) : null}
          </div>

          {/* Wishlist Favorite Button */}
          <button
            type="button"
            className={`product-card-fav-btn ${isFavorite(product.id) ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(product.id);
            }}
            aria-label={isFavorite(product.id) ? `Remove ${product.name} from favorites` : `Save ${product.name} to favorites`}
            title={isFavorite(product.id) ? 'Saved in favorites' : 'Save to favorites'}
          >
            <Heart size={15} fill={isFavorite(product.id) ? '#ef4444' : 'none'} color={isFavorite(product.id) ? '#ef4444' : '#64748b'} />
          </button>
        </div>

        {/* Body */}
        <div className="product-card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
            <div className="product-category-tag">
              {product.category}
            </div>
            {isOrderable && (
              <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }}></span> Available
              </span>
            )}
          </div>

          <h3 
            className="product-card-title" 
            onClick={() => setQuickViewProduct(product)}
          >
            {product.name}
          </h3>

          <p className="product-card-desc">
            {product.description}
          </p>

          {/* Footer */}
          <div className="product-card-footer">
            <div className="product-price">
              ₹{product.price}
            </div>

            <div>
              {isSoldOut ? (
                <span style={{ fontSize: '0.8125rem', color: '#ef4444', fontWeight: 800, background: '#fee2e2', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', border: '1px solid #fecaca', display: 'inline-block' }}>
                  SOLD OUT
                </span>
              ) : isUnavailable ? (
                <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 800, background: '#f1f5f9', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', border: '1px solid #e2e8f0', display: 'inline-block' }}>
                  UNAVAILABLE
                </span>
              ) : currentQty > 0 ? (
                <div className="quantity-stepper" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={handleDecrement}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="stepper-value">{currentQty}</span>
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={handleIncrement}
                    disabled={isMaxReached}
                    style={{ opacity: isMaxReached ? 0.45 : 1, cursor: isMaxReached ? 'not-allowed' : 'pointer' }}
                    title={isMaxReached ? `Only ${stock} available.` : 'Increase quantity'}
                    aria-label="Increase quantity"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={`add-btn-pill ${justAdded ? 'added-feedback' : ''}`}
                  onClick={handleAddClick}
                  aria-label={`Add ${product.name} to order`}
                >
                  {justAdded ? (
                    <>
                      <Check size={14} /> Added
                    </>
                  ) : (
                    <>
                      <span>Add</span> <Plus size={14} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProductParticleAssembler>
  );
};



