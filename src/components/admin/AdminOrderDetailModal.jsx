import React from 'react';
import { useStore } from '../../context/StoreContext';
import { printKOTReceipt } from '../../utils/printReceipt';
import {
  X,
  User,
  Phone,
  Clock,
  MapPin,
  CheckCircle2,
  ChefHat,
  BellRing,
  CheckCheck,
  XCircle,
  Banknote,
  Store,
  Sparkles,
  Printer
} from 'lucide-react';

export const AdminOrderDetailModal = () => {
  const { selectedAdminOrder, setSelectedAdminOrder, updateOrderStatus, shopConfig, showToast } = useStore();

  if (!selectedAdminOrder) return null;

  const order = selectedAdminOrder;
  const tokenDisplay = `#${order.token || order.tokenNumber || order.id}`;
  const statusStr = String(order.status || order.orderStatus || '').toLowerCase();

  const STEPS = [
    { id: 'placed', title: 'Placed', stepNum: 1 },
    { id: 'accepted', title: 'Accepted', stepNum: 2 },
    { id: 'preparing', title: 'Preparing', stepNum: 3 },
    { id: 'ready', title: 'Ready for Pickup', stepNum: 4 },
    { id: 'completed', title: 'Completed', stepNum: 5 }
  ];

  const getStepIndex = (status) => {
    const s = String(status || '').toLowerCase();
    switch (s) {
      case 'placed':
      case 'received':
        return 1;
      case 'accepted':
        return 2;
      case 'preparing':
        return 3;
      case 'ready':
        return 4;
      case 'completed':
      case 'collected':
        return 5;
      case 'cancelled':
      case 'rejected':
        return 0;
      default:
        return 1;
    }
  };

  const currentStepNum = getStepIndex(statusStr);
  const isReady = statusStr === 'ready';

  const handlePrint = () => {
    showToast(`Printing Kitchen / Counter KOT for Token ${tokenDisplay}...`, 'info');
    printKOTReceipt(order, shopConfig);
  };

  return (
    <div className="modal-backdrop" onClick={() => setSelectedAdminOrder(null)}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                TOKEN {tokenDisplay}
              </span>
              <span className={`order-badge-status status-${statusStr === 'received' ? 'placed' : statusStr}`}>
                {isReady ? 'READY FOR PICKUP' : statusStr.toUpperCase()}
              </span>
              <span style={{ fontSize: '0.75rem', background: 'var(--gold-light)', color: 'var(--gold-hover)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontWeight: 800, border: '1px solid var(--gold-border)' }}>
                Shop Counter Pickup
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={13} />
              <span>
                Order Time: <strong>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong> • {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <button className="drawer-close-btn" onClick={() => setSelectedAdminOrder(null)} aria-label="Close order details">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '1.5rem' }}>
          {/* Prominent Banner when Ready for Pickup */}
          {isReady && (
            <div style={{ background: '#dcfce7', border: '1.5px solid #86efac', borderRadius: 'var(--radius-sm)', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <BellRing size={24} style={{ color: '#15803d', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 800, color: '#15803d', fontSize: '1rem' }}>
                  Token {tokenDisplay} is READY FOR PICKUP
                </div>
                <div style={{ fontSize: '0.82rem', color: '#166534', marginTop: '0.15rem', fontWeight: 600 }}>
                  Order is packed at shop counter. Hand over when customer arrives.
                </div>
              </div>
            </div>
          )}

          {/* Customer & Pickup Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#fffcf5', border: '1px solid var(--gold-border)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800 }}>
                Customer Name
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {order.customerName || 'Valued Customer'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800 }}>
                Mobile Number
              </div>
              <div style={{ marginTop: '0.2rem' }}>
                <a href={`tel:${order.mobileNumber || order.mobile || order.phone}`} style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.05rem', textDecoration: 'underline' }}>
                  +91 {order.mobileNumber || order.mobile || order.phone}
                </a>
              </div>
            </div>

            <div style={{ gridColumn: 'span 2', borderTop: '1px dashed var(--border-medium)', paddingTop: '0.65rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
              <span>Pickup: <strong>Shop Counter (New Ratna)</strong></span>
              <span>Payment: <strong>Pay at Counter</strong></span>
            </div>
          </div>

          {/* 5-Step Status Timeline Bullets */}
          <div style={{ marginBottom: '1.5rem', background: 'var(--bg-page)', padding: '1.15rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.85rem', letterSpacing: '0.04em' }}>
              Status Timeline:
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {STEPS.map((step) => {
                const isPassed = currentStepNum > step.stepNum;
                const isCurrent = currentStepNum === step.stepNum;

                let symbol = '○';
                let styleColor = 'var(--text-muted)';
                let fontWeight = 500;

                if (isPassed) {
                  symbol = '✓';
                  styleColor = 'var(--primary)';
                  fontWeight = 700;
                } else if (isCurrent) {
                  symbol = '●';
                  styleColor = isReady ? '#16a34a' : 'var(--gold-hover)';
                  fontWeight = 800;
                }

                return (
                  <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: styleColor, fontWeight }}>
                    <span style={{ fontSize: '1.1rem', lineHeight: 1, minWidth: 16 }}>{symbol}</span>
                    <span>{step.title}</span>
                    {isCurrent && (
                      <span style={{ fontSize: '0.75rem', background: isReady ? '#dcfce7' : 'var(--gold-light)', color: isReady ? '#15803d' : 'var(--gold-hover)', padding: '1px 8px', borderRadius: 'var(--radius-full)', fontWeight: 800 }}>
                        Current Status
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Items Breakdown Table */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.6rem', letterSpacing: '0.04em' }}>
              Items Breakdown:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-muted)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              {(order.items || []).map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.92rem', paddingBottom: '0.45rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.productName || item.name}</span>{' '}
                    <span style={{ fontWeight: 900, color: 'var(--primary)' }}>× {item.quantity}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
                      (₹{item.price} each)
                    </span>
                    {item.customizableNote && (
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold-hover)', fontWeight: 700, marginTop: 2 }}>
                        Note: {item.customizableNote}
                      </span>
                    )}
                  </div>
                  <div style={{ fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '1.25rem', paddingTop: '0.5rem', color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                <span>Grand Total</span>
                <span>₹{order.grandTotal || order.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="modal-footer" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'space-between', background: 'var(--bg-page)' }}>
          <button onClick={handlePrint} className="btn btn-secondary btn-sm" style={{ padding: '0.45rem 0.85rem' }}>
            <Printer size={14} /> Print KOT Receipt
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(statusStr === 'placed' || statusStr === 'received') && (
              <>
                <button
                  onClick={() => updateOrderStatus(order.id, 'accepted')}
                  className="btn btn-primary btn-sm"
                  style={{ minHeight: 40, padding: '0.45rem 1.15rem', fontWeight: 800 }}
                >
                  <CheckCircle2 size={16} /> ACCEPT ORDER
                </button>
                <button
                  onClick={() => updateOrderStatus(order.id, 'cancelled')}
                  className="btn btn-danger btn-sm"
                  style={{ minHeight: 40, padding: '0.45rem 0.95rem' }}
                >
                  <XCircle size={15} /> CANCEL
                </button>
              </>
            )}

            {statusStr === 'accepted' && (
              <button
                onClick={() => updateOrderStatus(order.id, 'preparing')}
                className="btn btn-primary btn-sm"
                style={{ minHeight: 40, padding: '0.45rem 1.15rem', fontWeight: 800, background: 'var(--gold)' }}
              >
                <ChefHat size={16} /> START PREPARING
              </button>
            )}

            {statusStr === 'preparing' && (
              <button
                onClick={() => updateOrderStatus(order.id, 'ready')}
                className="btn btn-primary btn-sm"
                style={{ minHeight: 40, padding: '0.45rem 1.15rem', fontWeight: 800, background: '#16a34a' }}
              >
                <BellRing size={16} /> READY FOR PICKUP
              </button>
            )}

            {statusStr === 'ready' && (
              <button
                onClick={() => updateOrderStatus(order.id, 'completed')}
                className="btn btn-primary btn-sm"
                style={{ minHeight: 40, padding: '0.45rem 1.15rem', fontWeight: 800, background: '#0284c7' }}
              >
                <CheckCheck size={16} /> MARK COMPLETED
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
