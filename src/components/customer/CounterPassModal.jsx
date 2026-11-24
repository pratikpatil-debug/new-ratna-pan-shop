import React, { useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, CheckCircle2, Clock, ChefHat, MapPin, Store, Sparkles, ShieldCheck, QrCode } from 'lucide-react';

export const CounterPassModal = () => {
  const { counterPassOrder, setCounterPassOrder, shopConfig } = useStore();

  useEffect(() => {
    if (!counterPassOrder) return;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = orig;
      window.scrollTo({ top: scrollY, behavior: 'instant' });
    };
  }, [counterPassOrder]);

  if (!counterPassOrder) return null;

  const orderToken = counterPassOrder.token || counterPassOrder.id || '1001';
  const status = (counterPassOrder.status || counterPassOrder.orderStatus || 'received').toLowerCase();

  const getStatusBadge = () => {
    switch (status) {
      case 'ready':
        return { label: 'READY FOR COUNTER PICKUP', color: '#16a34a', bg: '#dcfce7', border: '#86efac', pulse: true };
      case 'preparing':
        return { label: 'BEING HANDCRAFTED', color: '#b45309', bg: '#fef3c7', border: '#fde68a', pulse: true };
      case 'accepted':
        return { label: 'ORDER ACCEPTED', color: '#641B25', bg: '#fce7f3', border: '#fbcfe8', pulse: false };
      case 'collected':
        return { label: 'PICKED UP / COMPLETED', color: '#475569', bg: '#f1f5f9', border: '#cbd5e1', pulse: false };
      default:
        return { label: 'ORDER RECEIVED', color: '#1d4ed8', bg: '#dbeafe', border: '#93c5fd', pulse: false };
    }
  };

  const statusStyle = getStatusBadge();

  return (
    <div
      className="modal-backdrop counter-pass-backdrop"
      onClick={() => setCounterPassOrder(null)}
      role="dialog"
      aria-modal="true"
      aria-label="Digital Counter Pickup Pass"
    >
      <div className="modal-card counter-pass-card animate-modal-scale" onClick={(e) => e.stopPropagation()}>
        {/* Pass Top Ribbon */}
        <div className="counter-pass-top">
          <div className="counter-pass-brand">
            <span className="counter-pass-logo">🍃</span>
            <span>NEW RATNA PAN SHOP</span>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={() => setCounterPassOrder(null)}
            aria-label="Close counter pass"
          >
            <X size={20} />
          </button>
        </div>

        {/* Pass Main Content */}
        <div className="counter-pass-body">
          <div className="counter-pass-instruction">
            HOLD UP THIS DIGITAL PASS AT THE SHOP COUNTER
          </div>

          {/* Token Box */}
          <div className="counter-pass-token-box">
            <div className="counter-pass-token-label">PICKUP TOKEN</div>
            <div className="counter-pass-token-number">#{orderToken}</div>
            <div className="counter-pass-customer-name">
              {counterPassOrder.customerName || 'Valued Guest'}
            </div>
          </div>

          {/* Live Status Pill with Pulse */}
          <div
            className="counter-pass-status-pill"
            style={{
              backgroundColor: statusStyle.bg,
              color: statusStyle.color,
              borderColor: statusStyle.border
            }}
          >
            {statusStyle.pulse && <span className="counter-pass-pulse-beacon"></span>}
            <span style={{ fontWeight: 800 }}>{statusStyle.label}</span>
          </div>

          {/* Barcode Graphic Simulation */}
          <div className="counter-pass-barcode-box">
            <div className="counter-pass-barcode-lines">
              {Array.from({ length: 38 }).map((_, i) => (
                <span
                  key={i}
                  className="barcode-bar"
                  style={{
                    width: i % 4 === 0 ? 3 : i % 3 === 0 ? 2 : 1,
                    height: 38,
                    backgroundColor: '#1e293b',
                    marginRight: (i % 2) + 1
                  }}
                ></span>
              ))}
            </div>
            <div className="counter-pass-barcode-text">TOKEN-{orderToken}-{status.toUpperCase()}</div>
          </div>

          {/* Items Preview */}
          <div className="counter-pass-items-list">
            <div className="counter-pass-items-title">Items in Token:</div>
            {(counterPassOrder.items || []).map((item, idx) => (
              <div key={idx} className="counter-pass-item-row">
                <span className="counter-pass-item-qty">{item.quantity}x</span>
                <span className="counter-pass-item-name">{item.name}</span>
                <span className="counter-pass-item-price">₹{(item.price || 0) * item.quantity}</span>
              </div>
            ))}
          </div>

          {/* Counter Details Footer */}
          <div className="counter-pass-footer-box">
            <div className="counter-pass-location">
              <MapPin size={13} style={{ color: 'var(--primary)' }} />
              <span>{shopConfig.address || 'Shop Counter, New Ratna Pan Shop'}</span>
            </div>
            <div className="counter-pass-timing">
              <Clock size={13} style={{ color: '#16a34a' }} />
              <span>Timing: {shopConfig.timing || '10:00 AM - 11:30 PM'}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="modal-footer counter-pass-actions">
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={() => setCounterPassOrder(null)}
          >
            <span>Done / Return</span>
          </button>
        </div>
      </div>
    </div>
  );
};
