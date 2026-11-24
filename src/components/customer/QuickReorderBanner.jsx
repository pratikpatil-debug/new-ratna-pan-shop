import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { RotateCcw, Zap, Plus, X, Sparkles } from 'lucide-react';

export const QuickReorderBanner = () => {
  const { lastOrderedItem, setExpressBuyProduct, addToCart, setIsCartOpen, showToast } = useStore();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!lastOrderedItem || !lastOrderedItem.product || isDismissed) return null;

  const { product, quantity = 1 } = lastOrderedItem;
  const unitPrice = Number(product.price || 0);
  const total = unitPrice * quantity;

  const handleInstantReorder = () => {
    setExpressBuyProduct(product);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, lastOrderedItem.customizableNote || '');
    setIsCartOpen(true);
    showToast(`Added ${quantity}x ${product.name} to your order!`, 'success');
  };

  return (
    <div className="quick-reorder-strip" aria-label="Quick Reorder Strip">
      <div className="container">
        <div className="quick-reorder-inner">
          <div className="reorder-left">
            <div className="reorder-icon-badge">
              <RotateCcw size={15} className="reorder-spin-icon" />
            </div>
            <div className="reorder-text">
              <div className="reorder-headline">
                <span className="reorder-tag">FAST REORDER</span>
                <span>Craving your favorite again?</span>
              </div>
              <div className="reorder-item-desc">
                <strong>{quantity}x {product.name}</strong> • ₹{total}
              </div>
            </div>
          </div>

          <div className="reorder-actions">
            <button
              type="button"
              className="btn-reorder-instant"
              onClick={handleInstantReorder}
              title={`Express buy ${quantity}x ${product.name}`}
            >
              <Zap size={14} />
              <span>1-Click Reorder</span>
            </button>

            <button
              type="button"
              className="btn-reorder-cart"
              onClick={handleAddToCart}
              title="Add to current order"
            >
              <Plus size={13} />
              <span>Add to Cart</span>
            </button>

            <button
              type="button"
              className="reorder-close-btn"
              onClick={() => setIsDismissed(true)}
              aria-label="Dismiss reorder banner"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
