import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Clock,
  Phone,
  CheckCircle,
  XCircle,
  ChefHat,
  BellRing,
  CheckCheck,
  Search,
  AlertCircle,
  Store,
  Printer,
  Eye,
  ArrowRight,
  Volume2,
  VolumeX,
  ShoppingBag,
  DollarSign,
  Sparkles,
  PackageCheck,
  RotateCcw
} from 'lucide-react';
import { playNewOrderChime, isSoundEnabled, toggleSoundEnabled } from '../../utils/audioAlert';
import { printKOTReceipt } from '../../utils/printReceipt';

export const AdminOrders = () => {
  const { orders, updateOrderStatus, setSelectedAdminOrder, showToast, shopConfig } = useStore();
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [soundActive, setSoundActive] = useState(isSoundEnabled());
  const prevOrderCountRef = useRef(orders.length);
  const knownOrderIdsRef = useRef(new Set(orders.map((o) => String(o.id))));

  // Sound notification detector when new Firestore order arrives
  useEffect(() => {
    const currentIds = new Set(orders.map((o) => String(o.id)));
    const hasNewOrder = orders.some(
      (o) => !knownOrderIdsRef.current.has(String(o.id)) && (String(o.status || o.orderStatus).toLowerCase() === 'placed' || String(o.status || o.orderStatus).toLowerCase() === 'received')
    );

    if (hasNewOrder && prevOrderCountRef.current > 0) {
      playNewOrderChime();
      showToast('🔔 New Counter Order Received!', 'info');
    }

    knownOrderIdsRef.current = currentIds;
    prevOrderCountRef.current = orders.length;
  }, [orders, showToast]);

  const handleToggleSound = () => {
    const next = toggleSoundEnabled();
    setSoundActive(next);
    if (next) {
      playNewOrderChime();
      showToast('Audio alerts enabled 🔔', 'info');
    } else {
      showToast('Audio alerts muted 🔕', 'info');
    }
  };

  // 1. Exact Summary Cards from Firestore Real-time Orders Collection
  const totalOrdersCount = orders.length;
  const newOrdersCount = orders.filter((o) => {
    const s = String(o.status || o.orderStatus || '').toLowerCase();
    return s === 'placed' || s === 'received';
  }).length;
  const acceptedOrdersCount = orders.filter((o) => {
    const s = String(o.status || o.orderStatus || '').toLowerCase();
    return s === 'accepted';
  }).length;
  const preparingOrdersCount = orders.filter((o) => {
    const s = String(o.status || o.orderStatus || '').toLowerCase();
    return s === 'preparing';
  }).length;
  const readyOrdersCount = orders.filter((o) => {
    const s = String(o.status || o.orderStatus || '').toLowerCase();
    return s === 'ready';
  }).length;
  const completedOrdersCount = orders.filter((o) => {
    const s = String(o.status || o.orderStatus || '').toLowerCase();
    return s === 'completed' || s === 'collected';
  }).length;
  const cancelledOrdersCount = orders.filter((o) => {
    const s = String(o.status || o.orderStatus || '').toLowerCase();
    return s === 'cancelled' || s === 'rejected';
  }).length;

  // 2. Real-time Filter & Search
  const filteredOrders = orders.filter((order) => {
    const tokenStr = String(order.token || order.tokenNumber || order.id);
    const cleanSearch = searchQuery.trim().toLowerCase().replace('#', '');
    const ordStatus = String(order.status || order.orderStatus || '').toLowerCase();

    // Filter matching
    let matchesFilter = true;
    if (filterStatus === 'new') {
      matchesFilter = ordStatus === 'placed' || ordStatus === 'received';
    } else if (filterStatus === 'accepted') {
      matchesFilter = ordStatus === 'accepted';
    } else if (filterStatus === 'preparing') {
      matchesFilter = ordStatus === 'preparing';
    } else if (filterStatus === 'ready') {
      matchesFilter = ordStatus === 'ready';
    } else if (filterStatus === 'completed') {
      matchesFilter = ordStatus === 'completed' || ordStatus === 'collected';
    } else if (filterStatus === 'cancelled') {
      matchesFilter = ordStatus === 'cancelled' || ordStatus === 'rejected';
    } else if (filterStatus !== 'all') {
      matchesFilter = ordStatus === filterStatus;
    }

    // Search matching: Token number, Mobile number, Customer name
    const cleanPhone = String(order.mobileNumber || order.mobile || order.phone || '').replace(/[^0-9]/g, '');
    const cleanName = String(order.customerName || '').toLowerCase();

    const matchesSearch =
      !cleanSearch ||
      tokenStr.includes(cleanSearch) ||
      cleanName.includes(cleanSearch) ||
      cleanPhone.includes(cleanSearch);

    return matchesFilter && matchesSearch;
  });

  const getStatusBadgeClass = (status) => {
    const s = String(status || '').toLowerCase();
    switch (s) {
      case 'placed':
      case 'received':
        return 'status-received';
      case 'accepted':
        return 'status-accepted';
      case 'preparing':
        return 'status-prep';
      case 'ready':
        return 'status-ready';
      case 'completed':
      case 'collected':
        return 'status-collected';
      case 'cancelled':
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-received';
    }
  };

  const getStatusLabel = (status) => {
    const s = String(status || '').toLowerCase();
    switch (s) {
      case 'placed':
      case 'received':
        return 'Placed';
      case 'accepted':
        return 'Accepted';
      case 'preparing':
        return 'Preparing';
      case 'ready':
        return 'Ready for Pickup';
      case 'completed':
      case 'collected':
        return 'Completed';
      case 'cancelled':
      case 'rejected':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const handlePrintReceipt = (e, order) => {
    e.stopPropagation();
    const tokenNum = order.token || order.tokenNumber || order.id;
    showToast(`Printing Kitchen / Counter KOT for Token #${tokenNum}...`, 'info');
    printKOTReceipt(order, shopConfig);
  };

  return (
    <div>
      {/* 1. ORDERS DASHBOARD HEADER */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
            Orders
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            Manage and track all pickup orders
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Sound Alert Toggle */}
          <button
            onClick={handleToggleSound}
            className={`btn btn-sm ${soundActive ? 'btn-outline' : 'btn-secondary'}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
            title="Toggle new order audio alert"
          >
            {soundActive ? <Volume2 size={16} style={{ color: 'var(--primary)' }} /> : <VolumeX size={16} />}
            <span>Sound Alerts: <strong>{soundActive ? 'ON' : 'MUTED'}</strong></span>
          </button>
        </div>
      </div>

      {/* 2. SUMMARY CARDS (6 Standard Cards) */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.85rem', marginBottom: '1.75rem' }}>
        {/* Total Orders */}
        <div
          className="stat-card"
          style={{ cursor: 'pointer', borderLeft: filterStatus === 'all' ? '4px solid var(--primary)' : '1px solid var(--border-subtle)' }}
          onClick={() => setFilterStatus('all')}
        >
          <div>
            <div className="stat-title">Total Orders</div>
            <div className="stat-value">{totalOrdersCount}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>All time pickup queue</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <ShoppingBag size={20} />
          </div>
        </div>

        {/* New Orders */}
        <div
          className="stat-card"
          style={{
            cursor: 'pointer',
            borderLeft: newOrdersCount > 0 ? '4px solid #2563eb' : '1px solid var(--border-subtle)',
            background: newOrdersCount > 0 ? '#f0f7ff' : '#fff'
          }}
          onClick={() => setFilterStatus(filterStatus === 'new' ? 'all' : 'new')}
        >
          <div>
            <div className="stat-title">New Orders</div>
            <div className="stat-value" style={{ color: newOrdersCount > 0 ? '#1d4ed8' : 'var(--text-main)' }}>
              {newOrdersCount}
            </div>
            <div style={{ fontSize: '0.72rem', color: newOrdersCount > 0 ? '#1d4ed8' : 'var(--text-muted)', fontWeight: 700 }}>
              {newOrdersCount > 0 ? '● Needs Action' : 'Queue clear'}
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
            <Sparkles size={20} />
          </div>
        </div>

        {/* Preparing */}
        <div
          className="stat-card"
          style={{
            cursor: 'pointer',
            borderLeft: preparingOrdersCount > 0 ? '4px solid var(--gold)' : '1px solid var(--border-subtle)',
            background: preparingOrdersCount > 0 ? '#fffdf7' : '#fff'
          }}
          onClick={() => setFilterStatus(filterStatus === 'preparing' ? 'all' : 'preparing')}
        >
          <div>
            <div className="stat-title">Preparing</div>
            <div className="stat-value" style={{ color: 'var(--gold-hover)' }}>
              {preparingOrdersCount}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--gold-hover)', fontWeight: 700 }}>
              At Crafting Station
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'var(--gold-light)', color: 'var(--gold-hover)' }}>
            <ChefHat size={20} />
          </div>
        </div>

        {/* Ready for Pickup */}
        <div
          className="stat-card"
          style={{
            cursor: 'pointer',
            borderLeft: readyOrdersCount > 0 ? '4px solid #16a34a' : '1px solid var(--border-subtle)',
            background: readyOrdersCount > 0 ? '#f0fdf4' : '#fff'
          }}
          onClick={() => setFilterStatus(filterStatus === 'ready' ? 'all' : 'ready')}
        >
          <div>
            <div className="stat-title">Ready for Pickup</div>
            <div className="stat-value" style={{ color: '#15803d' }}>
              {readyOrdersCount}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 700 }}>
              At Counter
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#dcfce7', color: '#15803d' }}>
            <BellRing size={20} />
          </div>
        </div>

        {/* Completed */}
        <div
          className="stat-card"
          style={{ cursor: 'pointer', borderLeft: filterStatus === 'completed' ? '4px solid #475569' : '1px solid var(--border-subtle)' }}
          onClick={() => setFilterStatus(filterStatus === 'completed' ? 'all' : 'completed')}
        >
          <div>
            <div className="stat-title">Completed</div>
            <div className="stat-value">{completedOrdersCount}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Collected & Paid</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#f1f5f9', color: '#475569' }}>
            <PackageCheck size={20} />
          </div>
        </div>

        {/* Cancelled */}
        <div
          className="stat-card"
          style={{ cursor: 'pointer', borderLeft: filterStatus === 'cancelled' ? '4px solid #dc2626' : '1px solid var(--border-subtle)' }}
          onClick={() => setFilterStatus(filterStatus === 'cancelled' ? 'all' : 'cancelled')}
        >
          <div>
            <div className="stat-title">Cancelled</div>
            <div className="stat-value" style={{ color: '#b91c1c' }}>{cancelledOrdersCount}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Stock Restored</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <XCircle size={20} />
          </div>
        </div>
      </div>

      {/* 3. ORDER FILTERS & SEARCH */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.85rem', marginBottom: '1.35rem' }}>
        {/* Filter Tabs: All, New, Accepted, Preparing, Ready, Completed, Cancelled */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {[
            { id: 'all', label: 'All', count: totalOrdersCount },
            { id: 'new', label: 'New', count: newOrdersCount },
            { id: 'accepted', label: 'Accepted', count: acceptedOrdersCount },
            { id: 'preparing', label: 'Preparing', count: preparingOrdersCount },
            { id: 'ready', label: 'Ready', count: readyOrdersCount },
            { id: 'completed', label: 'Completed', count: completedOrdersCount },
            { id: 'cancelled', label: 'Cancelled', count: cancelledOrdersCount }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`btn btn-sm ${filterStatus === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 'var(--radius-full)', padding: '0.35rem 0.85rem', fontSize: '0.82rem' }}
            >
              <span>{tab.label}</span>
              <span style={{ fontSize: '0.72rem', background: filterStatus === tab.id ? 'rgba(255,255,255,0.25)' : 'var(--bg-muted)', padding: '1px 6px', borderRadius: 8, fontWeight: 800 }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input: Token number, Mobile number, Customer name */}
        <div style={{ position: 'relative', width: '100%', maxWidth: 300 }}>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.2rem', paddingRight: '0.75rem', fontSize: '0.85rem', height: 38 }}
            placeholder="Search Token (#101), Mobile, Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search size={14} style={{ position: 'absolute', left: 10, top: 12, color: 'var(--text-muted)' }} />
        </div>
      </div>

      {/* 4. ORDERS LIST / CARDS */}
      {orders.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: '4rem 1rem', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
          <ShoppingBag size={44} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem auto', display: 'block' }} />
          <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
            No orders yet
          </h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
            New customer pickup orders will appear here automatically in real time.
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: '3.5rem 1rem', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
          <AlertCircle size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem auto', display: 'block' }} />
          <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
            No orders found
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            No pickup orders matched the selected filter or search query.
          </p>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => { setFilterStatus('all'); setSearchQuery(''); }}
            style={{ marginTop: '1rem' }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="order-list-grid">
          {filteredOrders.map((order) => {
            const tokenDisplay = `#${order.token || order.tokenNumber || order.id}`;
            const s = String(order.status || order.orderStatus || '').toLowerCase();
            const isPlaced = s === 'placed' || s === 'received';
            const isAccepted = s === 'accepted';
            const isPreparing = s === 'preparing';
            const isReady = s === 'ready';
            const isCompleted = s === 'completed' || s === 'collected';
            const isCancelled = s === 'cancelled' || s === 'rejected';

            const subtotalVal = Number(order.subtotal) || (order.items || []).reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);
            const discountVal = Number(order.discount) || 0;
            const totalVal = Number(order.total !== undefined ? order.total : (order.grandTotal || subtotalVal - discountVal));

            return (
              <div
                key={order.id}
                className={`admin-order-card ${isPlaced ? 'new-pulse' : ''}`}
                style={{
                  cursor: 'pointer',
                  borderLeft: isReady
                    ? '6px solid #16a34a'
                    : isPlaced
                    ? '6px solid #2563eb'
                    : isPreparing
                    ? '6px solid var(--gold)'
                    : isAccepted
                    ? '6px solid #7e22ce'
                    : '1px solid var(--border-subtle)',
                  background: isReady ? '#fcfdfd' : isPlaced ? '#f8faff' : '#fff'
                }}
                onClick={() => setSelectedAdminOrder(order)}
              >
                {/* PROMINENT HEADER: TOKEN NUMBER + STATUS BADGE + TIME */}
                <div className="order-card-header">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                      {/* NEW ORDER Highlight Badge */}
                      {isPlaced && (
                        <span style={{ background: '#2563eb', color: '#fff', fontSize: '0.75rem', fontWeight: 900, padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-xs)', letterSpacing: '0.06em', textTransform: 'uppercase', boxShadow: '0 2px 6px rgba(37,99,235,0.3)' }}>
                          NEW ORDER
                        </span>
                      )}

                      {/* Prominent Token Number */}
                      <span style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
                        {tokenDisplay}
                      </span>

                      {/* Status Badge */}
                      <span className={`order-badge-status ${getStatusBadgeClass(order.status || order.orderStatus)}`}>
                        {getStatusLabel(order.status || order.orderStatus)}
                      </span>

                      {/* Shop Pickup Only Indicator */}
                      <span style={{ fontSize: '0.75rem', background: 'var(--gold-light)', color: 'var(--gold-hover)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontWeight: 800, border: '1px solid var(--gold-border)' }}>
                        Pickup Only
                      </span>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={13} />
                      <span>
                        Order Time: <strong>{order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}</strong> • {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                  </div>

                  {/* Financials Summary */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                      ₹{totalVal}
                    </div>
                    {discountVal > 0 && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>
                        Discount: -₹{discountVal}
                      </div>
                    )}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Pay at Counter
                    </div>
                  </div>
                </div>

                {/* PROMINENT READY FOR PICKUP SPOTLIGHT ON CARD */}
                {isReady && (
                  <div style={{ background: '#dcfce7', border: '1.5px solid #86efac', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <BellRing size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 900, color: '#15803d', fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
                        {tokenDisplay} READY FOR PICKUP
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600 }}>
                        Customer will show Token {tokenDisplay} at the counter. Hand over fresh order.
                      </div>
                    </div>
                  </div>
                )}

                {/* CUSTOMER DETAILS GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', background: '#fffcf5', border: '1px solid var(--border-subtle)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800, display: 'block' }}>
                      Customer Name:
                    </span>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                      {order.customerName || 'Valued Customer'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800, display: 'block' }}>
                      Mobile Number:
                    </span>
                    <a
                      href={`tel:${order.mobileNumber || order.mobile || order.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      style={{ color: 'var(--primary)', fontWeight: 800, textDecoration: 'underline', fontSize: '0.95rem' }}
                    >
                      +91 {order.mobileNumber || order.mobile || order.phone}
                    </a>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800, display: 'block' }}>
                      Status:
                    </span>
                    <strong style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>
                      {getStatusLabel(order.status || order.orderStatus)}
                    </strong>
                  </div>
                </div>

                {/* ITEMS LIST (Product name × quantity) */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.45rem', letterSpacing: '0.04em' }}>
                    Items to Prepare:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {(order.items || []).map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', background: 'var(--bg-page)', padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-xs)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '0.95rem' }}>
                            {item.quantity} ×
                          </span>
                          <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                            {item.productName || item.name}
                          </span>
                          {item.customizableNote && (
                            <span style={{ marginLeft: '0.4rem', background: 'var(--gold-light)', color: 'var(--gold-hover)', fontSize: '0.72rem', padding: '1px 6px', borderRadius: 4, fontWeight: 800, border: '1px solid var(--gold-border)' }}>
                              Note: {item.customizableNote}
                            </span>
                          )}
                        </div>
                        <span style={{ fontWeight: 800, color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', fontSize: '0.88rem' }}>
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* STATUS TRANSITION CONTROLS (PLACED -> ACCEPTED -> PREPARING -> READY -> COMPLETED / CANCELLED) */}
                <div className="admin-actions-toolbar" onClick={(e) => e.stopPropagation()} style={{ paddingTop: '0.85rem' }}>
                  {/* PLACED -> ACCEPTED or CANCEL */}
                  {isPlaced && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'accepted')}
                        className="btn btn-primary"
                        style={{ minHeight: 42, padding: '0.55rem 1.35rem', fontSize: '0.92rem', fontWeight: 800 }}
                      >
                        <CheckCircle size={16} /> ACCEPT ORDER
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        className="btn btn-danger"
                        style={{ minHeight: 42, padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                      >
                        <XCircle size={15} /> CANCEL
                      </button>
                    </>
                  )}

                  {/* ACCEPTED -> PREPARING */}
                  {isAccepted && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="btn btn-primary"
                        style={{ minHeight: 42, padding: '0.55rem 1.35rem', fontSize: '0.92rem', fontWeight: 800, background: 'var(--gold)' }}
                      >
                        <ChefHat size={16} /> START PREPARING
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        className="btn btn-danger btn-sm"
                        style={{ minHeight: 42, padding: '0.55rem 0.9rem', fontSize: '0.82rem' }}
                      >
                        <XCircle size={14} /> CANCEL
                      </button>
                    </>
                  )}

                  {/* PREPARING -> READY */}
                  {isPreparing && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="btn btn-primary"
                        style={{ minHeight: 42, padding: '0.55rem 1.35rem', fontSize: '0.92rem', fontWeight: 800, background: '#16a34a' }}
                      >
                        <BellRing size={16} /> READY FOR PICKUP
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        className="btn btn-danger btn-sm"
                        style={{ minHeight: 42, padding: '0.55rem 0.9rem', fontSize: '0.82rem' }}
                      >
                        <XCircle size={14} /> CANCEL
                      </button>
                    </>
                  )}

                  {/* READY -> COMPLETED */}
                  {isReady && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="btn btn-primary"
                        style={{ minHeight: 42, padding: '0.55rem 1.35rem', fontSize: '0.92rem', fontWeight: 800, background: '#0284c7' }}
                      >
                        <CheckCheck size={17} /> MARK COMPLETED
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        className="btn btn-danger btn-sm"
                        style={{ minHeight: 42, padding: '0.55rem 0.9rem', fontSize: '0.82rem' }}
                      >
                        <XCircle size={14} /> CANCEL
                      </button>
                    </>
                  )}

                  {/* COMPLETED */}
                  {isCompleted && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#16a34a', fontSize: '0.88rem', fontWeight: 800, background: '#dcfce7', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-full)' }}>
                      <CheckCircle size={15} /> Order Completed & Paid
                    </span>
                  )}

                  {/* CANCELLED */}
                  {isCancelled && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#dc2626', fontSize: '0.88rem', fontWeight: 800, background: '#fee2e2', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-full)' }}>
                      <XCircle size={15} /> Order Cancelled
                    </span>
                  )}

                  {/* Right side tools: Full Details Modal & Print KOT */}
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => setSelectedAdminOrder(order)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                    >
                      <Eye size={14} /> Details
                    </button>
                    <button
                      onClick={(e) => handlePrintReceipt(e, order)}
                      className="btn btn-secondary btn-sm"
                      title="Print Counter Receipt"
                    >
                      <Printer size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

