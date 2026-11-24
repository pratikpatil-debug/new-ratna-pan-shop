import React, { useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, MapPin, ArrowRight, ShoppingBag, Sparkles, Banknote, Clock, Store, QrCode } from 'lucide-react';
import confetti from 'canvas-confetti';

export const OrderConfirmation = () => {
  const { trackedOrderId, orders, shopConfig, setActiveView, setCounterPassOrder } = useStore();

  const currentOrder = orders.find((o) => o.id === trackedOrderId) || orders[0];

  useEffect(() => {
    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  }, []);

  if (!currentOrder) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2>No recent order found</h2>
        <button className="btn btn-primary" onClick={() => setActiveView('customer-home')}>
          Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="order-tracking-section">
      <div className="container">
        <div className="confirmation-hero-card">
          <div className="confirm-icon-circle">
            <CheckCircle2 size={40} />
          </div>

          <span className="badge-tag badge-veg" style={{ marginBottom: '0.85rem', display: 'inline-flex', fontSize: '0.9rem', padding: '0.35rem 0.95rem', fontWeight: 800 }}>
            ✓ Order Received
          </span>

          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.4rem', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            Thanks! Your order has been sent to the shop.
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto 1.75rem auto', fontSize: '0.95rem', lineHeight: 1.5 }}>
            Thank you, <strong>{currentOrder.customerName}</strong>! Your order is queued for fresh preparation at the shop counter.
          </p>

          {/* Prominent Order Card */}
          <div style={{ background: 'rgba(8, 41, 30, 0.85)', border: '2px solid var(--gold-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', maxWidth: 540, margin: '0 auto 2rem auto', textAlign: 'left', boxShadow: 'var(--shadow-sm)' }}>
            
            {/* Token & Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800 }}>
                  Pickup Token
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                  #{currentOrder.tokenNumber || currentOrder.token || currentOrder.id}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800 }}>
                  Status
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb', display: 'inline-block' }}></span>
                  {String(currentOrder.status || currentOrder.orderStatus || 'Order Received').toUpperCase()}
                </div>
              </div>
            </div>

            {/* Pickup Location & Payment & Total */}
            <div style={{ borderTop: '1px dashed var(--border-medium)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.88rem' }}>
                <Store size={17} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                    Pickup Only
                  </div>
                  <div style={{ color: 'var(--text-body)' }}>
                    New Ratna Pan Shop — Shop Counter
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-medium)' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800 }}>
                    Payment
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                    Pay at Counter
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800 }}>
                    Total
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                    ₹{currentOrder.total || currentOrder.grandTotal}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary btn-lg btn-gold-shimmer"
              onClick={() => setCounterPassOrder(currentOrder)}
              title="Open full-screen digital pass to show at counter"
            >
              <QrCode size={18} />
              <span>Show Counter Pass</span>
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => setActiveView('customer-tracking')}
            >
              <span>Live Order Tracker</span>
              <ArrowRight size={18} />
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => setActiveView('customer-home')}
            >
              <ShoppingBag size={18} /> Back to Menu
            </button>
          </div>
        </div>

        {/* Ordered Items Breakdown */}
        <div className="checkout-card">
          <div className="card-heading" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <span>Ordered Items</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {new Date(currentOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div style={{ background: 'var(--bg-muted)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
            {currentOrder.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <span>
                  <strong style={{ color: 'var(--primary)' }}>{item.quantity}x</strong> {item.name}{' '}
                  {item.customizableNote ? `(${item.customizableNote})` : ''}
                </span>
                <span style={{ fontWeight: 800 }}>₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px dashed var(--border-medium)', paddingTop: '0.65rem', marginTop: '0.65rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem' }}>
              <span>Total Payable</span>
              <span style={{ color: 'var(--primary)' }}>₹{currentOrder.grandTotal}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
