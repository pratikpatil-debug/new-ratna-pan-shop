import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  CheckCircle2,
  Clock,
  MapPin,
  ChefHat,
  ArrowLeft,
  Store,
  BellRing,
  Phone,
  Sparkles,
  AlertCircle,
  Search,
  CheckCheck,
  XCircle,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Receipt,
  RotateCcw,
  ShieldCheck,
  Eye,
  X,
  QrCode
} from 'lucide-react';
import { orderService } from '../../services/orderService';

export const OrderTrackingView = () => {
  const { trackedOrderId, setTrackedOrderId, shopConfig, setActiveView, setCounterPassOrder } = useStore();

  const [phoneSearch, setPhoneSearch] = useState(() => {
    try {
      return localStorage.getItem('nr_customer_phone_v2') || '';
    } catch {
      return '';
    }
  });

  const [submittedPhone, setSubmittedPhone] = useState(() => {
    try {
      return localStorage.getItem('nr_customer_phone_v2') || '';
    } catch {
      return '';
    }
  });

  const [ordersList, setOrdersList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [selectedActiveId, setSelectedActiveId] = useState(trackedOrderId || null);
  const [inspectModalOrder, setInspectModalOrder] = useState(null);

  // Subscribe to real-time orders for the submitted mobile number
  useEffect(() => {
    const cleanPhone = String(submittedPhone || '').replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setOrdersList([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      localStorage.setItem('nr_customer_phone_v2', cleanPhone);
    } catch (e) {
      // ignore
    }

    const unsub = orderService.subscribeToOrdersByPhone(
      cleanPhone,
      (matchedOrders) => {
        setOrdersList(matchedOrders);
        setIsLoading(false);
        setLoadError(null);

        // If an active order exists and nothing is selected, select the first active order
        if (matchedOrders.length > 0) {
          const actives = matchedOrders.filter((o) => {
            const st = String(o.status || o.orderStatus || '').toLowerCase();
            return ['placed', 'received', 'accepted', 'preparing', 'ready'].includes(st);
          });
          if (actives.length > 0 && !selectedActiveId) {
            setSelectedActiveId(actives[0].id || actives[0].token);
          }
        }
      },
      (err) => {
        console.error('Error subscribing to orders by phone:', err);
        setIsLoading(false);
        setLoadError('Unable to load orders. Please try again.');
      }
    );

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [submittedPhone]);

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    const clean = phoneSearch.replace(/[^0-9]/g, '');
    if (clean.length !== 10) {
      setLoadError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoadError(null);
    setSubmittedPhone(clean);
  };

  const handleClearPhone = () => {
    setPhoneSearch('');
    setSubmittedPhone('');
    setOrdersList([]);
    setLoadError(null);
    try {
      localStorage.removeItem('nr_customer_phone_v2');
    } catch (e) {}
  };

  // Helper to mask phone for privacy
  const maskPhone = (phoneStr) => {
    const clean = String(phoneStr || '').replace(/[^0-9]/g, '');
    if (clean.length >= 10) {
      return `+91 ••••• ••${clean.slice(-3)}`;
    }
    return phoneStr;
  };

  // 5-step status progression
  const STEPS = [
    {
      id: 'placed',
      stepNum: 1,
      title: 'PLACED',
      displayTitle: 'Order Placed',
      desc: 'Order received at shop counter.'
    },
    {
      id: 'accepted',
      stepNum: 2,
      title: 'ACCEPTED',
      displayTitle: 'Accepted',
      desc: 'Acknowledged by shopkeeper.'
    },
    {
      id: 'preparing',
      stepNum: 3,
      title: 'PREPARING',
      displayTitle: 'Preparing Fresh',
      desc: 'Artisanal paan crafted fresh.'
    },
    {
      id: 'ready',
      stepNum: 4,
      title: 'READY FOR PICKUP',
      displayTitle: 'Ready for Pickup',
      desc: 'Ready at shop counter.'
    },
    {
      id: 'completed',
      stepNum: 5,
      title: 'COMPLETED',
      displayTitle: 'Completed',
      desc: 'Order collected & payment settled.'
    }
  ];

  const getStepIndex = (rawStatus) => {
    const s = String(rawStatus || '').toLowerCase();
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
        return -1; // Cancelled
      default:
        return 1;
    }
  };

  const formatToken = (ord) => {
    const t = ord?.tokenNumber || ord?.token || ord?.id || '101';
    return `#${t}`;
  };

  const formatOrderDateTime = (isoString) => {
    if (!isoString) return 'Just now';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return isoString;
    }
  };

  // Separate active orders vs history
  const activeOrders = ordersList.filter((o) => {
    const st = String(o.status || o.orderStatus || '').toLowerCase();
    return ['placed', 'received', 'accepted', 'preparing', 'ready'].includes(st);
  });

  const historyOrders = ordersList.filter((o) => {
    const st = String(o.status || o.orderStatus || '').toLowerCase();
    return ['completed', 'collected', 'cancelled', 'rejected'].includes(st);
  });

  // Current active order in focus
  const currentActiveOrder = activeOrders.find(
    (o) => String(o.id) === String(selectedActiveId) || String(o.token) === String(selectedActiveId)
  ) || activeOrders[0] || null;

  const currentStatusRaw = currentActiveOrder ? (currentActiveOrder.status || currentActiveOrder.orderStatus || 'placed') : 'placed';
  const currentStepNum = getStepIndex(currentStatusRaw);
  const isReady = String(currentStatusRaw).toLowerCase() === 'ready';

  return (
    <div className="order-tracking-section" style={{ minHeight: '80vh', padding: '2rem 0 4rem 0' }}>
      <div className="container">
        {/* Top Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button
            onClick={() => setActiveView('customer-home')}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
          >
            <ArrowLeft size={16} /> Back to Menu
          </button>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary-light)', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', animation: 'pulse 2s infinite' }}></span>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)' }}>
              LIVE PICKUP TRACKING
            </span>
          </div>
        </div>

        {/* Header Title Section */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
            Track Your Orders
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 540, margin: '0 auto' }}>
            Enter your mobile number to view live preparation status, pickup token, and order history.
          </p>
        </div>

        {/* 1. Mobile Lookup Form Card */}
        <div
          className="checkout-card"
          style={{
            padding: '1.75rem',
            marginBottom: '2rem',
            background: 'rgba(8, 41, 30, 0.85)',
            border: '1.5px solid var(--gold-border)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Mobile Number Verification
              </h3>
            </div>

            {submittedPhone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '0.82rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                  Active: {maskPhone(submittedPhone)}
                </span>
                <button
                  onClick={handleClearPhone}
                  style={{ fontSize: '0.8rem', color: 'var(--gold-hover)', textDecoration: 'underline', fontWeight: 700 }}
                >
                  Change Number
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handlePhoneSubmit} style={{ display: 'flex', gap: '0.75rem', maxWidth: 520, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
              <input
                type="tel"
                className="form-input"
                placeholder="Enter 10-digit Mobile (e.g. 9876543210)"
                value={phoneSearch}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  if (val.length <= 10) setPhoneSearch(val);
                }}
                maxLength={10}
                style={{ paddingLeft: '2.5rem', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.04em' }}
              />
              <Phone size={16} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-muted)' }} />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{ padding: '0.7rem 1.4rem', fontWeight: 800, minWidth: 140 }}
            >
              <Search size={16} />
              {isLoading ? 'Searching...' : 'Track Orders'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={14} style={{ color: '#16a34a' }} />
            <span>Your mobile number is kept strictly confidential and only used to retrieve your orders.</span>
          </div>

          {loadError && (
            <div style={{ marginTop: '0.75rem', background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} />
              <span>{loadError}</span>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="checkout-card" style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
            <div className="cart-spin" style={{ width: 36, height: 36, border: '3px solid var(--border-medium)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto 1rem auto' }}></div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
              Finding your orders...
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Connecting with New Ratna live counter for +91 {submittedPhone}
            </p>
          </div>
        )}

        {/* Empty State: No mobile number entered yet */}
        {!isLoading && !submittedPhone && (
          <div className="checkout-card" style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
            <ShoppingBag size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto', display: 'block' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              Enter your Mobile Number to Track
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: 440, margin: '0 auto 1.5rem auto' }}>
              Track live preparation stage, pickup token number, or look up previous order receipts.
            </p>
            <button className="btn btn-primary" onClick={() => setActiveView('customer-home')}>
              Explore Menu
            </button>
          </div>
        )}

        {/* Empty State: Mobile entered but 0 orders exist */}
        {!isLoading && submittedPhone && ordersList.length === 0 && (
          <div className="checkout-card" style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
            <ShoppingBag size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto', display: 'block' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              No orders found for this mobile number.
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: 460, margin: '0 auto 1.5rem auto' }}>
              We could not find any active or past orders placed with +91 {submittedPhone}.
            </p>
            <button className="btn btn-primary" onClick={() => setActiveView('customer-home')}>
              Order Fresh Paan Now
            </button>
          </div>
        )}

        {/* Content when orders exist */}
        {!isLoading && submittedPhone && ordersList.length > 0 && (
          <>
            {/* ========================================================
                ACTIVE ORDERS SECTION
               ======================================================== */}
            <div style={{ marginBottom: '2.5rem' }}>
              {activeOrders.length === 0 ? (
                <div
                  className="checkout-card"
                  style={{
                    padding: '2rem 1.5rem',
                    marginBottom: '2rem',
                    background: '#fafaf9',
                    border: '1.5px dashed var(--border-medium)',
                    textAlign: 'center'
                  }}
                >
                  <CheckCircle2 size={36} style={{ color: '#16a34a', margin: '0 auto 0.5rem auto', display: 'block' }} />
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                    No active orders
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0 auto 1rem auto', maxWidth: 420 }}>
                    You currently have no orders in preparation. View your previous completed orders below.
                  </p>
                  <button className="btn btn-primary btn-sm" onClick={() => setActiveView('customer-home')}>
                    Place New Order
                  </button>
                </div>
              ) : (
                <>
                  {/* Multi-Active Order Switcher (if > 1 active order) */}
                  {activeOrders.length > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        Active Orders ({activeOrders.length}):
                      </span>
                      {activeOrders.map((ord) => {
                        const tokenStr = formatToken(ord);
                        const isSelected = String(ord.id) === String(currentActiveOrder?.id);
                        return (
                          <button
                            key={ord.id}
                            onClick={() => setSelectedActiveId(ord.id)}
                            className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ borderRadius: 'var(--radius-full)', fontWeight: 800, whiteSpace: 'nowrap', fontSize: '0.82rem' }}
                          >
                            Token {tokenStr} • ₹{ord.total || ord.grandTotal}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Ready for Pickup Spotlight Banner */}
                  {isReady && currentActiveOrder && (
                    <div className="ready-pickup-banner" style={{ marginBottom: '1.5rem' }}>
                      <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <BellRing size={30} style={{ color: '#fff', animation: 'ring 1.5s infinite' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 900, color: '#bbf7d0' }}>
                          New Ratna Pan Shop • Counter Pickup Ready
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0.2rem 0', color: '#fff' }}>
                          Token {formatToken(currentActiveOrder)} is READY FOR PICKUP!
                        </h3>
                        <p style={{ fontSize: '0.95rem', color: '#f0fdf4', margin: 0, fontWeight: 600 }}>
                          Please collect your fresh order from the shop counter. Show Token {formatToken(currentActiveOrder)} to the shopkeeper.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Main Active Order Card */}
                  {currentActiveOrder && (
                    <div
                      className="checkout-card"
                      style={{
                        padding: '2rem 1.75rem',
                        marginBottom: '2rem',
                        border: isReady ? '2px solid #16a34a' : '1.5px solid var(--gold-border)',
                        boxShadow: isReady ? 'var(--shadow-ready)' : 'var(--shadow-md)'
                      }}
                    >
                      {/* Token Number & Current Status Header */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.5rem', marginBottom: '1.75rem' }}>
                        <div>
                          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
                            Pickup Token
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
                              {formatToken(currentActiveOrder)}
                            </div>

                            <span className={`order-badge-status status-${String(currentStatusRaw).toLowerCase()}`} style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem', fontWeight: 900 }}>
                              {isReady ? 'READY FOR PICKUP' : String(currentStatusRaw).toUpperCase()}
                            </span>

                            <span style={{ fontSize: '0.78rem', background: 'var(--gold-light)', color: 'var(--gold-hover)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontWeight: 800, border: '1px solid var(--gold-border)' }}>
                              Pickup Only
                            </span>

                            <button
                              type="button"
                              className="btn btn-primary btn-sm btn-gold-shimmer"
                              onClick={() => setCounterPassOrder(currentActiveOrder)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, padding: '0.3rem 0.85rem', fontSize: '0.8rem' }}
                              title="Open digital pass to show at counter"
                            >
                              <QrCode size={14} />
                              <span>Show Counter Pass</span>
                            </button>
                          </div>

                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            Customer: <strong style={{ color: 'var(--text-main)' }}>{currentActiveOrder.customerName || 'Valued Customer'}</strong> • Placed: {formatOrderDateTime(currentActiveOrder.createdAt)}
                          </div>
                        </div>

                        {/* Pickup Location Box */}
                        <div style={{ background: 'rgba(8, 41, 30, 0.75)', border: '1px solid var(--gold-border)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1.15rem', textAlign: 'right', minWidth: 200 }}>
                          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800 }}>
                            Pickup Counter
                          </div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)' }}>
                            {shopConfig.shopName}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {shopConfig.address}, {shopConfig.city}
                          </div>
                        </div>
                      </div>

                      {/* 5-Step Live Tracking Progress Bar */}
                      <div style={{ margin: '1.75rem 0 2.25rem 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Order Status Progression
                          </span>
                          <span style={{ fontSize: '0.8rem', color: isReady ? '#15803d' : 'var(--gold-hover)', fontWeight: 800 }}>
                            ● Real-Time Firestore Sync
                          </span>
                        </div>

                        {/* Stepper Bar */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', marginBottom: '2rem', padding: '0 0.5rem' }}>
                          {/* Background Track */}
                          <div style={{ position: 'absolute', top: 18, left: '6%', right: '6%', height: 4, background: 'var(--border-subtle)', zIndex: 1 }} />
                          {/* Active Progress Fill */}
                          <div
                            style={{
                              position: 'absolute',
                              top: 18,
                              left: '6%',
                              width: `${Math.min(100, Math.max(0, ((currentStepNum - 1) / (STEPS.length - 1)) * 88))}%`,
                              height: 4,
                              background: isReady ? '#16a34a' : 'var(--primary)',
                              transition: 'width 0.4s ease',
                              zIndex: 2
                            }}
                          />

                          {STEPS.map((step) => {
                            const isCompleted = currentStepNum > step.stepNum;
                            const isCurrent = currentStepNum === step.stepNum;
                            const isStepReady = isCurrent && step.id === 'ready';

                            return (
                              <div
                                key={step.id}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 3, textAlign: 'center', width: 70 }}
                              >
                                <div
                                  style={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 800,
                                    fontSize: '0.85rem',
                                    transition: 'all 0.3s ease',
                                    background: isCompleted
                                      ? 'var(--primary)'
                                      : isStepReady
                                      ? '#16a34a'
                                      : isCurrent
                                      ? 'var(--gold)'
                                      : 'var(--bg-surface)',
                                    color: isCompleted || isCurrent ? '#fff' : 'var(--text-muted)',
                                    border: isCompleted || isCurrent ? 'none' : '2px solid var(--border-medium)',
                                    boxShadow: isCurrent ? '0 0 0 4px rgba(212, 155, 53, 0.25)' : 'none'
                                  }}
                                >
                                  {isCompleted ? (
                                    <CheckCheck size={18} />
                                  ) : isStepReady ? (
                                    <BellRing size={18} />
                                  ) : (
                                    <span>{step.stepNum}</span>
                                  )}
                                </div>
                                <span
                                  style={{
                                    fontSize: '0.75rem',
                                    marginTop: '0.5rem',
                                    fontWeight: isCurrent ? 800 : isCompleted ? 700 : 500,
                                    color: isStepReady ? '#15803d' : isCurrent ? 'var(--gold-hover)' : isCompleted ? 'var(--text-main)' : 'var(--text-muted)'
                                  }}
                                >
                                  {step.title}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Step Description Cards */}
                        <div className="timeline-vertical-container">
                          {STEPS.map((st, idx) => {
                            const isCompleted = currentStepNum > st.stepNum;
                            const isCurrent = currentStepNum === st.stepNum;
                            const isStepReady = isCurrent && st.id === 'ready';

                            return (
                              <div
                                key={st.id}
                                className={`timeline-step-row ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isStepReady ? 'is-ready' : ''}`}
                              >
                                {idx < STEPS.length - 1 && <div className="timeline-connector"></div>}

                                <div className="timeline-icon-box">
                                  {isCompleted ? (
                                    <CheckCircle2 size={18} />
                                  ) : isStepReady ? (
                                    <BellRing size={18} />
                                  ) : (
                                    <span>{st.stepNum}</span>
                                  )}
                                </div>

                                <div className="timeline-content">
                                  <div className="timeline-title">
                                    {st.displayTitle}{' '}
                                    {isCurrent && (
                                      <span style={{ fontSize: '0.75rem', color: isStepReady ? '#15803d' : 'var(--gold-hover)', fontWeight: 800, marginLeft: '0.4rem' }}>
                                        ● Current Status
                                      </span>
                                    )}
                                  </div>
                                  <div className="timeline-desc">{st.desc}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Items Snapshot & Financial Details */}
                      <div style={{ background: '#faf9f5', borderRadius: 'var(--radius-sm)', padding: '1.25rem', border: '1px solid var(--border-subtle)' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.85rem', color: 'var(--text-main)' }}>
                          Ordered Items
                        </h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                          {(currentActiveOrder.items || []).map((it, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.9rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                {it.imageUrl || it.image ? (
                                  <img
                                    src={it.imageUrl || it.image}
                                    alt={it.productName || it.name}
                                    style={{ width: 44, height: 44, borderRadius: 'var(--radius-xs)', objectFit: 'cover', background: 'var(--bg-muted)' }}
                                    onError={(e) => {
                                      e.target.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80';
                                    }}
                                  />
                                ) : null}
                                <div>
                                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                                    {it.productName || it.name}
                                  </div>
                                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                    {it.quantity} × ₹{it.price} {it.customizableNote ? `• Note: ${it.customizableNote}` : ''}
                                  </div>
                                </div>
                              </div>
                              <div style={{ fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                                ₹{(it.price || 0) * (it.quantity || 1)}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Bill Breakdown */}
                        <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px dashed var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                            <span>Subtotal</span>
                            <span>₹{currentActiveOrder.subtotal || currentActiveOrder.total}</span>
                          </div>

                          {(currentActiveOrder.discount > 0) && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: 700 }}>
                              <span>Special Offer Discount</span>
                              <span>-₹{currentActiveOrder.discount}</span>
                            </div>
                          )}

                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-medium)' }}>
                            <span>Total (Pay at Counter)</span>
                            <span style={{ fontFamily: 'var(--font-heading)' }}>
                              ₹{currentActiveOrder.total || currentActiveOrder.grandTotal}
                            </span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Payment Status:</span>
                            <span style={{ fontWeight: 800, color: currentActiveOrder.paymentStatus === 'Paid & Collected' ? '#16a34a' : '#b45309' }}>
                              {currentActiveOrder.paymentStatus || 'Pending Payment at Counter'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Contact Shop Keeper CTA */}
                      <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          Need assistance with this order?
                        </div>
                        <a
                          href={`tel:${shopConfig.phone.replace(/[^0-9+]/g, '')}`}
                          className="btn btn-secondary btn-sm"
                          style={{ background: '#fff', border: '1px solid var(--border-medium)', fontWeight: 700 }}
                        >
                          <Phone size={14} style={{ color: 'var(--primary)' }} /> Call Shop: {shopConfig.phone}
                        </a>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ========================================================
                ORDER HISTORY SECTION
               ======================================================== */}
            {historyOrders.length > 0 && (
              <div style={{ marginTop: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Receipt size={20} style={{ color: 'var(--primary)' }} />
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                      Order History
                    </h3>
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', background: 'var(--bg-muted)', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)' }}>
                    {historyOrders.length} {historyOrders.length === 1 ? 'Past Order' : 'Past Orders'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                  {historyOrders.map((ord) => {
                    const stRaw = String(ord.status || ord.orderStatus || '').toLowerCase();
                    const isOrdCancelled = stRaw === 'cancelled' || stRaw === 'rejected';
                    const tokenStr = formatToken(ord);

                    return (
                      <div
                        key={ord.id}
                        className="checkout-card"
                        style={{
                          padding: '1.25rem',
                          background: '#fff',
                          border: isOrdCancelled ? '1px solid #fca5a5' : '1px solid var(--border-subtle)',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          {/* Card Header: Token & Status */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                            <div>
                              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800 }}>
                                Token
                              </div>
                              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: isOrdCancelled ? '#dc2626' : 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                                {tokenStr}
                              </div>
                            </div>

                            <span className={`order-badge-status status-${isOrdCancelled ? 'rejected' : 'completed'}`} style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem', fontWeight: 800 }}>
                              {isOrdCancelled ? 'Order Cancelled' : 'COMPLETED'}
                            </span>
                          </div>

                          {/* Date & Time */}
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                            <Clock size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                            {formatOrderDateTime(ord.createdAt)}
                          </div>

                          {/* Items summary */}
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-body)', marginBottom: '0.85rem', lineHeight: 1.4 }}>
                            {(ord.items || []).map((it, i) => (
                              <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>{it.quantity}x {it.productName || it.name}</span>
                                <span style={{ fontWeight: 600 }}>₹{(it.price || 0) * (it.quantity || 1)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Card Footer: Amount & View Details */}
                        <div style={{ paddingTop: '0.75rem', borderTop: '1px dashed var(--border-medium)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>
                              Total Amount
                            </div>
                            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                              ₹{ord.total || ord.grandTotal}
                            </div>
                          </div>

                          <button
                            onClick={() => setInspectModalOrder(ord)}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.82rem', fontWeight: 700, padding: '0.4rem 0.85rem' }}
                          >
                            <Eye size={14} /> View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ========================================================
          INSPECT ORDER DETAILS MODAL
         ======================================================== */}
      {inspectModalOrder && (
        <div className="product-modal-backdrop" onClick={() => setInspectModalOrder(null)}>
          <div
            className="product-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 560, padding: '1.75rem' }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800 }}>
                  Order Details
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                  Token {formatToken(inspectModalOrder)}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Customer: <strong>{inspectModalOrder.customerName || 'Valued Customer'}</strong> • {formatOrderDateTime(inspectModalOrder.createdAt)}
                </div>
              </div>

              <button
                onClick={() => setInspectModalOrder(null)}
                style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Status & Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <span className={`order-badge-status status-${String(inspectModalOrder.status || inspectModalOrder.orderStatus || '').toLowerCase() === 'cancelled' ? 'rejected' : String(inspectModalOrder.status || inspectModalOrder.orderStatus || '').toLowerCase()}`}>
                {String(inspectModalOrder.status || inspectModalOrder.orderStatus || '').toLowerCase() === 'cancelled' ? 'Order Cancelled' : String(inspectModalOrder.status || inspectModalOrder.orderStatus || '').toUpperCase()}
              </span>

              <span style={{ fontSize: '0.75rem', background: 'var(--gold-light)', color: 'var(--gold-hover)', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)', fontWeight: 800, border: '1px solid var(--gold-border)' }}>
                Pickup Only
              </span>

              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Payment: <strong>{inspectModalOrder.paymentStatus || 'Pay at Counter'}</strong>
              </span>
            </div>

            {/* Full Item List */}
            <div style={{ background: 'var(--bg-muted)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.65rem', color: 'var(--text-main)' }}>
                Items Breakdown
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(inspectModalOrder.items || []).map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' }}>
                    <div>
                      <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{it.quantity}x</span>{' '}
                      <span style={{ fontWeight: 600 }}>{it.productName || it.name}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 6 }}>
                        (@ ₹{it.price})
                      </span>
                    </div>
                    <div style={{ fontWeight: 800 }}>
                      ₹{(it.price || 0) * (it.quantity || 1)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div style={{ borderTop: '1px dashed var(--border-medium)', marginTop: '0.75rem', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Subtotal</span>
                  <span>₹{inspectModalOrder.subtotal || inspectModalOrder.total}</span>
                </div>
                {inspectModalOrder.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: 700 }}>
                    <span>Offer Discount</span>
                    <span>-₹{inspectModalOrder.discount}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 900, color: 'var(--primary)', paddingTop: '0.4rem', borderTop: '1px dashed var(--border-medium)' }}>
                  <span>Final Total</span>
                  <span style={{ fontFamily: 'var(--font-heading)' }}>₹{inspectModalOrder.total || inspectModalOrder.grandTotal}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setInspectModalOrder(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
