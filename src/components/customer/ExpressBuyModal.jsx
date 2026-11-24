import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Zap, X, ShieldCheck, MapPin, Clock, Plus, Minus, Sparkles, CheckCircle2 } from 'lucide-react';

export const ExpressBuyModal = () => {
  const { expressBuyProduct, setExpressBuyProduct, expressPlaceOrder, shopConfig } = useStore();

  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState(() => {
    try {
      return localStorage.getItem('nr_customer_name_v2') || '';
    } catch {
      return '';
    }
  });
  const [phone, setPhone] = useState(() => {
    try {
      return localStorage.getItem('nr_customer_phone_v2') || '';
    } catch {
      return '';
    }
  });
  const [customNote, setCustomNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Lock body scroll and set default quantity on open
  useEffect(() => {
    if (!expressBuyProduct) return;
    setQuantity(1);
    setErrorMsg('');

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setExpressBuyProduct(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [expressBuyProduct, setExpressBuyProduct]);

  if (!expressBuyProduct) return null;

  const stock = expressBuyProduct.stockQuantity !== undefined ? Number(expressBuyProduct.stockQuantity) : 10;
  const unitPrice = Number(expressBuyProduct.price || 0);
  const totalPrice = unitPrice * quantity;

  const quickQuantities = [1, 2, 4, 6].filter((q) => q <= stock);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number for pickup notification.');
      return;
    }

    if (!customerName.trim()) {
      setErrorMsg('Please enter your name so the counter can call your token.');
      return;
    }

    try {
      setIsSubmitting(true);
      await expressPlaceOrder({
        product: expressBuyProduct,
        quantity,
        customizableNote: customNote,
        customerName: customerName.trim(),
        phone: cleanPhone,
        specialInstructions: customNote ? `⚡ Express: ${customNote}` : '⚡ 1-Tap Counter Order'
      });
    } catch (err) {
      setErrorMsg(err.message || 'Could not place express order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal-backdrop express-buy-backdrop"
      onClick={() => setExpressBuyProduct(null)}
      role="dialog"
      aria-modal="true"
      aria-label="Express Counter Checkout"
    >
      <div
        className="modal-card express-buy-card animate-modal-scale"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header express-buy-header">
          <div className="express-header-title">
            <span className="express-badge">
              <Zap size={14} className="zap-pulse" />
              <span>1-TAP EXPRESS BUY</span>
            </span>
            <h3 className="express-heading">Fast Counter Pickup Order</h3>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={() => setExpressBuyProduct(null)}
            aria-label="Close express order dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body express-buy-body">
          {/* Selected Product Snapshot Card */}
          <div className="express-product-summary">
            <div className="express-prod-img-box">
              <img
                src={expressBuyProduct.image}
                alt={expressBuyProduct.name}
                className="express-prod-img"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80';
                }}
              />
            </div>
            <div className="express-prod-details">
              <div className="express-prod-category">{expressBuyProduct.category}</div>
              <h4 className="express-prod-name">{expressBuyProduct.name}</h4>
              <div className="express-prod-price-row">
                <span className="express-unit-price">₹{unitPrice} per item</span>
                <span className="express-prep-speed">⚡ Ready in ~2 mins</span>
              </div>
            </div>
          </div>

          {/* Quick Quantity Select */}
          <div className="express-section-row">
            <label className="express-label">
              <span>Select Quantity</span>
              <span className="express-sub-label">Max {stock} available</span>
            </label>

            <div className="express-qty-picker">
              <div className="express-stepper">
                <button
                  type="button"
                  className="express-stepper-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="express-stepper-val">{quantity}</span>
                <button
                  type="button"
                  className="express-stepper-btn"
                  onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                  disabled={quantity >= stock}
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="express-quick-chips">
                {quickQuantities.map((q) => (
                  <button
                    key={q}
                    type="button"
                    className={`express-chip-btn ${quantity === q ? 'active' : ''}`}
                    onClick={() => setQuantity(q)}
                  >
                    {q} {q === 1 ? 'Paan' : 'Paans'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Pickup Details (Auto-remembered) */}
          <div className="express-form-card">
            <div className="express-form-title">
              <Sparkles size={13} style={{ color: 'var(--gold-hover)' }} />
              <span>Counter Pickup Details (Saved for Next Time)</span>
            </div>

            <div className="express-form-grid">
              <div className="form-field-group">
                <label className="express-input-label" htmlFor="express-customer-name">
                  Your Name *
                </label>
                <input
                  id="express-customer-name"
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="express-input"
                  required
                />
              </div>

              <div className="form-field-group">
                <label className="express-input-label" htmlFor="express-customer-phone">
                  Mobile Number (for pickup token) *
                </label>
                <div className="express-phone-wrapper">
                  <span className="phone-prefix">+91</span>
                  <input
                    id="express-customer-phone"
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    className="express-input phone-input"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-field-group" style={{ marginTop: '0.65rem' }}>
              <label className="express-input-label" htmlFor="express-special-note">
                Special Note / Customization (Optional)
              </label>
              <input
                id="express-special-note"
                type="text"
                placeholder="e.g. Extra sweet, Less chuna, Gift wrap..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="express-input"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="express-error-alert" role="alert">
              <span>⚠️ {errorMsg}</span>
            </div>
          )}

          {/* Payment Note */}
          <div className="express-payment-note">
            <div className="payment-note-icon">💵</div>
            <div className="payment-note-text">
              <strong>Pay ₹{totalPrice} at Counter:</strong> Cash or instant UPI QR code available at the pickup counter. Zero online gateway hassle.
            </div>
          </div>
        </div>

        {/* Footer with Instant Checkout CTA */}
        <div className="modal-footer express-buy-footer">
          <div className="express-footer-price">
            <span className="price-label">Total to Pay:</span>
            <span className="price-val">₹{totalPrice}</span>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-gold-shimmer express-submit-btn"
            onClick={handleSubmit}
            disabled={isSubmitting || !phone || !customerName}
          >
            {isSubmitting ? (
              <>
                <div className="cart-spin" style={{ width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} />
                <span>Generating Token...</span>
              </>
            ) : (
              <>
                <Zap size={16} className="zap-pulse" />
                <span>Place Counter Order • ₹{totalPrice}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
