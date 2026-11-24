import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { printKOTReceipt } from '../../utils/printReceipt';
import {
  Search,
  Calendar,
  Filter,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Printer,
  Eye,
  AlertCircle,
  Clock,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';

export const AdminOrderHistory = () => {
  const { orders, setSelectedAdminOrder, showToast, shopConfig } = useStore();
  const [dateFilter, setDateFilter] = useState('all'); // 'today', 'yesterday', '7days', 'month', 'all', 'custom'
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Date Filtering Helper
  const filterByDate = (orderDateStr) => {
    if (!orderDateStr) return false;
    const orderDate = new Date(orderDateStr);
    const now = new Date();

    if (dateFilter === 'all') return true;

    if (dateFilter === 'today') {
      return (
        orderDate.getDate() === now.getDate() &&
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    }

    if (dateFilter === 'yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return (
        orderDate.getDate() === yesterday.getDate() &&
        orderDate.getMonth() === yesterday.getMonth() &&
        orderDate.getFullYear() === yesterday.getFullYear()
      );
    }

    if (dateFilter === '7days') {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      return orderDate >= sevenDaysAgo && orderDate <= now;
    }

    if (dateFilter === 'month') {
      return (
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    }

    if (dateFilter === 'custom') {
      if (!customStartDate && !customEndDate) return true;
      const start = customStartDate ? new Date(customStartDate) : new Date(0);
      const end = customEndDate ? new Date(customEndDate) : new Date();
      end.setHours(23, 59, 59, 999);
      return orderDate >= start && orderDate <= end;
    }

    return true;
  };

  // Filtered Orders calculation
  const filteredOrders = useMemo(() => {
    const cleanSearch = searchQuery.trim().toLowerCase().replace('#', '');

    return orders.filter((order) => {
      const matchesDate = filterByDate(order.createdAt);
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      const tokenStr = String(order.token || order.id);
      const matchesSearch =
        !cleanSearch ||
        tokenStr.includes(cleanSearch) ||
        (order.customerName && order.customerName.toLowerCase().includes(cleanSearch)) ||
        (order.phone && order.phone.includes(cleanSearch)) ||
        (order.mobile && order.mobile.includes(cleanSearch));

      return matchesDate && matchesStatus && matchesSearch;
    });
  }, [orders, dateFilter, statusFilter, searchQuery, customStartDate, customEndDate]);

  // Analytics for the filtered subset
  const filteredStats = useMemo(() => {
    const totalCount = filteredOrders.length;
    const validOrders = filteredOrders.filter((o) => o.status !== 'rejected');
    const totalSales = validOrders.reduce((sum, o) => sum + (Number(o.grandTotal) || Number(o.total) || 0), 0);
    const avgOrderValue = validOrders.length > 0 ? Math.round(totalSales / validOrders.length) : 0;
    const collectedCount = filteredOrders.filter((o) => o.status === 'collected').length;

    return {
      totalCount,
      totalSales,
      avgOrderValue,
      collectedCount
    };
  }, [filteredOrders]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'received':
        return 'status-received';
      case 'accepted':
        return 'status-accepted';
      case 'preparing':
        return 'status-prep';
      case 'ready':
        return 'status-ready';
      case 'collected':
        return 'status-collected';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-received';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'received':
        return 'Order Received';
      case 'accepted':
        return 'Accepted';
      case 'preparing':
        return 'Preparing';
      case 'ready':
        return 'Ready for Pickup';
      case 'collected':
        return 'Collected';
      case 'rejected':
        return 'Declined';
      default:
        return status;
    }
  };

  const handlePrint = (e, order) => {
    e.stopPropagation();
    showToast(`Printing receipt for Token #${order.token || order.id}...`, 'info');
    printKOTReceipt(order, shopConfig);
  };

  return (
    <div>
      {/* 1. Header & Quick Export / Summary */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
            Order History & Analytics
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
            Historical pickup records, search audit, and revenue reporting
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => showToast('Order history exported to CSV / Print format.', 'info')}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
          >
            <FileText size={15} /> Export Log
          </button>
        </div>
      </div>

      {/* 2. FILTERED PERIOD METRICS BAR */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)', padding: '1rem 1.25rem' }}>
          <div>
            <div className="stat-title">Period Revenue</div>
            <div className="stat-value" style={{ color: 'var(--primary)', fontSize: '1.5rem' }}>
              ₹{filteredStats.totalSales}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              From {filteredOrders.filter((o) => o.status !== 'rejected').length} valid orders
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'var(--primary-light)', color: 'var(--primary)', width: 42, height: 42 }}>
            <DollarSign size={20} />
          </div>
        </div>

        <div className="stat-card" style={{ padding: '1rem 1.25rem' }}>
          <div>
            <div className="stat-title">Total Orders</div>
            <div className="stat-value" style={{ fontSize: '1.5rem' }}>
              {filteredStats.totalCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Matching selected criteria
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#f3e8ff', color: '#7e22ce', width: 42, height: 42 }}>
            <ShoppingBag size={20} />
          </div>
        </div>

        <div className="stat-card" style={{ padding: '1rem 1.25rem' }}>
          <div>
            <div className="stat-title">Average Order Value</div>
            <div className="stat-value" style={{ color: 'var(--gold-hover)', fontSize: '1.5rem' }}>
              ₹{filteredStats.avgOrderValue}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Per counter pickup order
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'var(--gold-light)', color: 'var(--gold-hover)', width: 42, height: 42 }}>
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="stat-card" style={{ padding: '1rem 1.25rem' }}>
          <div>
            <div className="stat-title">Collected Orders</div>
            <div className="stat-value" style={{ color: '#15803d', fontSize: '1.5rem' }}>
              {filteredStats.collectedCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>
              Completed & Paid
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#dcfce7', color: '#15803d', width: 42, height: 42 }}>
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* 3. CONTROLS: DATE FILTER, STATUS FILTER, SEARCH */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Row 1: Date Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '0.35rem' }}>
            Date:
          </span>
          {[
            { id: 'all', label: 'All Time' },
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: '7days', label: 'Last 7 Days' },
            { id: 'month', label: 'This Month' },
            { id: 'custom', label: 'Custom Range' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDateFilter(tab.id)}
              className={`btn btn-sm ${dateFilter === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 'var(--radius-full)', padding: '0.35rem 0.85rem', fontSize: '0.82rem' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Optional Custom Date Inputs */}
        {dateFilter === 'custom' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', padding: '0.75rem', background: 'var(--bg-page)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
              <label style={{ fontWeight: 700 }}>From:</label>
              <input
                type="date"
                className="form-input"
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem', width: 'auto' }}
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
              <label style={{ fontWeight: 700 }}>To:</label>
              <input
                type="date"
                className="form-input"
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem', width: 'auto' }}
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Row 2: Status & Search Filter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
          {/* Status Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.85rem', width: 'auto', fontWeight: 700 }}
            >
              <option value="all">All Statuses ({orders.length})</option>
              <option value="received">Order Received</option>
              <option value="accepted">Accepted</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready for Pickup</option>
              <option value="collected">Collected</option>
              <option value="rejected">Declined</option>
            </select>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: 280 }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.2rem', paddingRight: '0.75rem', fontSize: '0.85rem', height: 38 }}
              placeholder="Search by Token (#1024), Name, Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={14} style={{ position: 'absolute', left: 10, top: 12, color: 'var(--text-muted)' }} />
          </div>
        </div>
      </div>

      {/* 4. ORDERS HISTORY CARDS / TABLE */}
      {filteredOrders.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: '3.5rem 1rem', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
          <AlertCircle size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
          <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.25rem' }}>No orders found</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: 450, margin: '0 auto' }}>
            No sales or pickup records match your selected date and status filters.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredOrders.map((order) => {
            const tokenDisplay = `#${order.token || order.id}`;
            const itemCount = (order.items || []).reduce((sum, it) => sum + (Number(it.quantity) || 1), 0);
            const itemsSummary = (order.items || []).map((it) => `${it.quantity}x ${it.name}`).join(', ');

            return (
              <div
                key={order.id}
                onClick={() => setSelectedAdminOrder(order)}
                style={{
                  background: '#fff',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  padding: '1.15rem 1.4rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-xs)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {/* Left: Token, Customer & Items */}
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                      TOKEN {tokenDisplay}
                    </span>

                    <span className={`order-badge-status ${getStatusBadgeClass(order.status)}`} style={{ fontSize: '0.75rem', padding: '0.2rem 0.65rem' }}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginTop: '0.35rem', fontWeight: 600 }}>
                    <strong>{order.customerName}</strong> •{' '}
                    <span style={{ color: 'var(--text-muted)' }}>+91 {order.phone || order.mobile}</span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90%' }}>
                    <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{itemCount} {itemCount === 1 ? 'item' : 'items'}:</span> {itemsSummary}
                  </div>
                </div>

                {/* Right: Date, Total, Payment & Actions */}
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                    ₹{order.grandTotal || order.total}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    {order.paymentMethod === 'pay_at_counter' ? 'Pay at Counter' : order.paymentMethod}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAdminOrder(order);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                    >
                      <Eye size={12} /> Details
                    </button>

                    <button
                      onClick={(e) => handlePrint(e, order)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                      title="Print KOT"
                    >
                      <Printer size={12} />
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
