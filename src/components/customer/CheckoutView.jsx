import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ArrowLeft, MapPin, User, Phone, CheckCircle2, Clock, Banknote, ShieldCheck, AlertCircle, AlertTriangle } from 'lucide-react';

export const CheckoutView = () => {
  const {
    cart,
    products,
    cartSubtotal,
    cartDiscount,
    cartFinalTotal,
    appliedOffer,
    shopConfig,
    placeOrder,
    setActiveView,
    showToast
  } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // If cart is empty, show empty state
  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-main)' }}>Your order is empty</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Pick something delicious from our menu before proceeding to checkout.
        </p>
        <button className="btn btn-primary" onClick={() => setActiveView('customer-home')}>
          Explore Menu
        </button>
      </div>
    );
  }

  // Pre-checkout stock & availability validation
  const stockValidationIssues = [];
  cart.forEach((item) => {
    const liveProd = products.find((p) => String(p.id) === String(item.product.id));
    if (!liveProd) {
      stockValidationIssues.push(`"${item.product.name}" is no longer available in the menu.`);
    } else {
      const isAvailable = liveProd.isAvailable !== false && liveProd.available !== false;
      const stock = Number(liveProd.stockQuantity !== undefined ? liveProd.stockQuantity : 0);
      if (!isAvailable || stock <= 0) {
        stockValidationIssues.push(`"${liveProd.name}" is currently Sold Out.`);
      } else if (item.quantity > stock) {
        stockValidationIssues.push(`"${liveProd.name}" has only ${stock} available in stock (you have ${item.quantity} in cart).`);
      }
    }
  });

  const validateForm = () => {
    const errors = {};

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      errors.phone = 'Please enter your 10-digit mobile number.';
    } else if (cleanPhone.length !== 10) {
      errors.phone = 'Please enter a valid 10-digit mobile number.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // Prevent double submission

    if (stockValidationIssues.length > 0) {
      showToast(stockValidationIssues[0], 'error');
      return;
    }

    if (!validateForm()) {
      const firstError = Object.values(validationErrors)[0] || 'Please enter a valid mobile number.';
      showToast(firstError, 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const trimmedName = customerName.trim() || 'Valued Customer';
      await placeOrder({
        customerName: trimmedName,
        phone: phone.trim()
      });
    } catch (err) {
      console.error('Checkout submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="container">
        {/* Back Link */}
        <button
          onClick={() => setActiveView('customer-home')}
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={16} /> Back to Menu
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)', margin: 0 }}>
            Complete Your Pickup Order
          </h2>
          <span style={{ background: 'var(--primary)', color: '#fff', fontSize: '0.8rem', fontWeight: 800, padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', letterSpacing: '0.04em' }}>
            PICKUP ONLY
          </span>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem', fontSize: '0.95rem' }}>
          Collect fresh from the shop counter • Pay upon collection
        </p>

        {/* Stock Validation Error Warning Banner */}
        {stockValidationIssues.length > 0 && (
          <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 'var(--radius-sm)', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <AlertTriangle size={22} style={{ color: '#dc2626', flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 800, color: '#991b1b', fontSize: '0.95rem' }}>
                Cart items need adjustment:
              </div>
              <ul style={{ margin: '0.35rem 0 0 1.2rem', color: '#7f1d1d', fontSize: '0.85rem' }}>
                {stockValidationIssues.map((msg, idx) => (
                  <li key={idx} style={{ marginBottom: 2 }}>{msg}</li>
                ))}
              </ul>
              <div style={{ marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => setActiveView('customer-home')}
                >
                  Adjust Cart
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} noValidate>
          <div className="checkout-grid">
            {/* Left Column: Form Details & Pickup Section */}
            <div>
              {/* Highlighted Pickup Card */}
              <div className="pickup-spotlight-card">
                <div className="pickup-spotlight-header">
                  <span className="pickup-badge-large">PICKUP ONLY • SHOP COUNTER</span>
                </div>

                <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 700, lineHeight: 1.5, marginBottom: '1rem' }}>
                  Your order will be prepared fresh and collected from the shop counter.
                </p>

                <div className="pickup-details-grid">
                  <div className="pickup-detail-item">
                    <MapPin size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                        📍 New Ratna Pan Shop
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {shopConfig.address}, {shopConfig.city}
                      </div>
                    </div>
                  </div>

                  <div className="pickup-detail-item">
                    <Clock size={18} style={{ color: 'var(--gold-hover)', flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                        ⏱ Estimated Preparation Time
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        ~{shopConfig.avgPrepMinutes} Mins • Prepared on order
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Details: Optional Name & Mandatory Mobile */}
              <div className="checkout-card">
                <div className="card-heading">
                  <User size={18} style={{ color: 'var(--primary)' }} />
                  <span>Customer Details</span>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">
                      Mobile Number <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      className={`form-input ${validationErrors.phone ? 'input-error' : ''}`}
                      placeholder="e.g. 9820198201"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (validationErrors.phone) setValidationErrors((prev) => ({ ...prev, phone: '' }));
                      }}
                      maxLength={10}
                      required
                    />
                    {validationErrors.phone ? (
                      <div style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <AlertCircle size={12} /> {validationErrors.phone}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                        Used for order token tracking & pickup
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Customer Name <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Rahul Sharma"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                      Leave blank for Guest Pickup
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Section: Pay at Counter Only */}
              <div className="checkout-card">
                <div className="card-heading">
                  <Banknote size={18} style={{ color: 'var(--primary)' }} />
                  <span>Payment</span>
                </div>

                <div style={{ border: '2px solid var(--primary)', background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)', padding: '1.15rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Banknote size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary)' }}>
                        Pay at Counter
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-body)', marginTop: '0.15rem' }}>
                        Pay when you collect your order. (Cash / UPI)
                      </div>
                    </div>
                  </div>
                  <CheckCircle2 size={22} style={{ color: 'var(--primary)' }} />
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary with Product Images */}
            <div>
              <div className="checkout-card" style={{ position: 'sticky', top: 90 }}>
                <div className="card-heading" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                  <span>Order Summary</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    ({cart.length} {cart.length === 1 ? 'item' : 'items'})
                  </span>
                </div>

                {/* Items List with Product Image, Name, Qty, Item Price, Item Total */}
                <div style={{ maxHeight: 320, overflowY: 'auto', marginBottom: '1.25rem', paddingRight: '0.25rem' }}>
                  {cart.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        style={{ width: 48, height: 48, borderRadius: 'var(--radius-xs)', objectFit: 'cover', background: 'var(--bg-muted)', flexShrink: 0 }}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: 1.25 }}>
                          {item.product.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          Qty: <strong>{item.quantity}</strong> × ₹{item.product.price}
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, fontFamily: 'var(--font-heading)', fontSize: '0.95rem' }}>
                        ₹{item.product.price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal and Grand Total */}
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{cartSubtotal}</span>
                </div>

                {appliedOffer && cartDiscount > 0 && (
                  <div className="summary-row" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      ✨ {appliedOffer.title}
                    </span>
                    <span>- ₹{cartDiscount}</span>
                  </div>
                )}

                <div className="summary-row total">
                  <span>Grand Total (Pickup)</span>
                  <span style={{ color: 'var(--primary)' }}>₹{cartFinalTotal}</span>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full btn-lg"
                  disabled={isSubmitting || stockValidationIssues.length > 0}
                  style={{ marginTop: '0.5rem' }}
                >
                  {isSubmitting ? 'Placing Order...' : 'Place Pickup Order'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <ShieldCheck size={14} style={{ color: 'var(--primary)' }} />
                  <span>Instant sequential token generation • Pay upon collection</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

