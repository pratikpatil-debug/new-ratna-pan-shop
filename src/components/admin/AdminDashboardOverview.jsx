import React, { useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { commissionService, getPeriodId } from '../../services/commissionService';
import {
  ShoppingBag,
  ChefHat,
  BellRing,
  PackageCheck,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Clock,
  Store,
  Sparkles,
  Calendar,
  AlertCircle,
  Coins
} from 'lucide-react';


export const AdminDashboardOverview = ({ onNavigateTab }) => {
  const { orders, products, shopConfig, setSelectedAdminOrder } = useStore();

  // Helper: check if date is today (shop local date)
  const isToday = (dateString) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  };

  // 1. Live Today's Metrics (Real calculation from actual Firestore orders)
  const todayOrders = useMemo(() => {
    return orders.filter((o) => isToday(o.createdAt));
  }, [orders]);

  const todayStats = useMemo(() => {
    const totalOrdersCount = todayOrders.length;
    const newOrdersCount = todayOrders.filter((o) => {
      const s = String(o.status || o.orderStatus || '').toLowerCase();
      return s === 'placed' || s === 'received';
    }).length;
    const preparingCount = todayOrders.filter((o) => {
      const s = String(o.status || o.orderStatus || '').toLowerCase();
      return s === 'preparing' || s === 'accepted';
    }).length;
    const readyCount = todayOrders.filter((o) => {
      const s = String(o.status || o.orderStatus || '').toLowerCase();
      return s === 'ready';
    }).length;
    const completedCount = todayOrders.filter((o) => {
      const s = String(o.status || o.orderStatus || '').toLowerCase();
      return s === 'completed' || s === 'collected';
    }).length;
    const totalSales = todayOrders
      .filter((o) => {
        const s = String(o.status || o.orderStatus || '').toLowerCase();
        return s !== 'cancelled' && s !== 'rejected';
      })
      .reduce((sum, o) => sum + (Number(o.total) || Number(o.grandTotal) || 0), 0);

    return {
      totalOrdersCount,
      newOrdersCount,
      preparingCount,
      readyCount,
      completedCount,
      totalSales
    };
  }, [todayOrders]);

  // Product Inventory Metrics
  const productStats = useMemo(() => {
    const totalProducts = products.length;
    const availableProducts = products.filter((p) => {
      const isAvail = p.isAvailable !== false && p.available !== false;
      const stock = Number(p.stockQuantity !== undefined ? p.stockQuantity : 0);
      return isAvail && stock > 0;
    }).length;
    const soldOutProducts = products.filter((p) => {
      const isAvail = p.isAvailable !== false && p.available !== false;
      const stock = Number(p.stockQuantity !== undefined ? p.stockQuantity : 0);
      return !isAvail || stock === 0;
    }).length;
    const lowStockProducts = products.filter((p) => {
      const isAvail = p.isAvailable !== false && p.available !== false;
      const stock = Number(p.stockQuantity !== undefined ? p.stockQuantity : 0);
      return isAvail && stock > 0 && stock <= 5;
    }).length;

    return {
      totalProducts,
      availableProducts,
      soldOutProducts,
      lowStockProducts
    };
  }, [products]);

  // 2. Top Products Ranked by Quantity Sold
  const topProducts = useMemo(() => {
    const productStatsMap = {};

    orders
      .filter((o) => o.status !== 'rejected')
      .forEach((order) => {
        (order.items || []).forEach((it) => {
          const key = it.productId || it.id || it.name;
          if (!productStatsMap[key]) {
            productStatsMap[key] = {
              id: key,
              name: it.name,
              quantitySold: 0,
              revenue: 0,
              image: it.image || ''
            };
          }
          const qty = Number(it.quantity) || 1;
          const price = Number(it.price) || 0;
          productStatsMap[key].quantitySold += qty;
          productStatsMap[key].revenue += qty * price;
        });
      });

    const list = Object.values(productStatsMap);
    list.sort((a, b) => b.quantitySold - a.quantitySold);
    return list.slice(0, 6);
  }, [orders]);

  const maxSoldQty = topProducts[0]?.quantitySold || 1;

  // Recent Live Orders (Top 4)
  const recentOrders = useMemo(() => {
    return orders.slice(0, 4);
  }, [orders]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* QUICK ACTIONS BAR */}
      <div style={{ background: '#fff', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}>
        <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
          ⚡ Quick Management Actions
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigateTab('products')}
            className="btn btn-primary"
            style={{ fontWeight: 800, padding: '0.65rem 1.25rem' }}
          >
            Manage Products ({productStats.totalProducts})
          </button>
          <button
            onClick={() => onNavigateTab('orders')}
            className="btn btn-secondary"
            style={{ fontWeight: 800, padding: '0.65rem 1.25rem' }}
          >
            View Orders ({orders.length})
          </button>
          <button
            onClick={() => onNavigateTab('offers')}
            className="btn btn-secondary"
            style={{ fontWeight: 800, padding: '0.65rem 1.25rem' }}
          >
            Manage Offers
          </button>
        </div>
      </div>

      {/* PRODUCT INVENTORY OVERVIEW CARDS */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Product Inventory Overview
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
              Real-time menu catalog health & stock availability
            </p>
          </div>
        </div>

        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigateTab('products')}>
            <div>
              <div className="stat-title">Total Products</div>
              <div className="stat-value">{productStats.totalProducts}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>In Menu Catalog</div>
            </div>
          </div>

          <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigateTab('products')}>
            <div>
              <div className="stat-title">Available Products</div>
              <div className="stat-value" style={{ color: '#15803d' }}>{productStats.availableProducts}</div>
              <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 700 }}>Active in Store</div>
            </div>
          </div>

          <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigateTab('products')}>
            <div>
              <div className="stat-title">Low Stock Products</div>
              <div className="stat-value" style={{ color: '#b45309' }}>{productStats.lowStockProducts}</div>
              <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 700 }}>≤ 5 Units Left</div>
            </div>
          </div>

          <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigateTab('products')}>
            <div>
              <div className="stat-title">Sold Out Products</div>
              <div className="stat-value" style={{ color: '#dc2626' }}>{productStats.soldOutProducts}</div>
              <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 700 }}>Unavailable / 0 Stock</div>
            </div>
          </div>
        </div>
      </div>

      {/* 1. TODAY'S SALES & OPERATIONAL STATS */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
              Today's Counter Performance
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
              Real-time Firestore sales & counter queue overview for {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>

          <div style={{ fontSize: '0.8rem', background: '#fff', border: '1px solid var(--border-subtle)', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={14} style={{ color: 'var(--primary)' }} />
            <span>Today ({todayOrders.length} orders logged)</span>
          </div>
        </div>

        <div className="stats-grid">
          {/* Today's Sales */}
          <div className="stat-card" style={{ borderLeft: '5px solid var(--primary)', background: '#fff' }}>
            <div>
              <div className="stat-title">Today's Sales</div>
              <div className="stat-value" style={{ color: 'var(--primary)' }}>
                ₹{todayStats.totalSales}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Valid Counter Revenue
              </div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <DollarSign size={22} />
            </div>
          </div>

          {/* Total Orders */}
          <div className="stat-card">
            <div>
              <div className="stat-title">Total Orders</div>
              <div className="stat-value">{todayStats.totalOrdersCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Placed Today
              </div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
              <ShoppingBag size={22} />
            </div>
          </div>

          {/* New Orders */}
          <div
            className="stat-card"
            style={{
              cursor: 'pointer',
              borderLeft: todayStats.newOrdersCount > 0 ? '5px solid #2563eb' : undefined,
              background: todayStats.newOrdersCount > 0 ? '#f0f7ff' : '#fff'
            }}
            onClick={() => onNavigateTab('orders')}
          >
            <div>
              <div className="stat-title">New Orders</div>
              <div className="stat-value" style={{ color: todayStats.newOrdersCount > 0 ? '#1d4ed8' : 'var(--text-main)' }}>
                {todayStats.newOrdersCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: todayStats.newOrdersCount > 0 ? '#1d4ed8' : 'var(--text-muted)', fontWeight: 700 }}>
                {todayStats.newOrdersCount > 0 ? '● Needs Counter Action' : 'Queue clear'}
              </div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
              <ShoppingBag size={22} />
            </div>
          </div>

          {/* Preparing Orders */}
          <div
            className="stat-card"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigateTab('orders')}
          >
            <div>
              <div className="stat-title">Preparing Orders</div>
              <div className="stat-value" style={{ color: 'var(--gold-hover)' }}>
                {todayStats.preparingCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gold-hover)', fontWeight: 700 }}>
                Fresh Crafting
              </div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: 'var(--gold-light)', color: 'var(--gold-hover)' }}>
              <ChefHat size={22} />
            </div>
          </div>

          {/* Ready for Pickup */}
          <div
            className="stat-card"
            style={{
              cursor: 'pointer',
              borderLeft: todayStats.readyCount > 0 ? '5px solid #16a34a' : undefined,
              background: todayStats.readyCount > 0 ? '#f0fdf4' : '#fff'
            }}
            onClick={() => onNavigateTab('orders')}
          >
            <div>
              <div className="stat-title">Ready for Pickup</div>
              <div className="stat-value" style={{ color: '#15803d' }}>
                {todayStats.readyCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 700 }}>
                Waiting at Counter
              </div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: '#dcfce7', color: '#15803d' }}>
              <BellRing size={22} />
            </div>
          </div>

          {/* Completed Orders */}
          <div className="stat-card">
            <div>
              <div className="stat-title">Completed Orders</div>
              <div className="stat-value">{todayStats.completedCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Collected & Paid
              </div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: '#f1f5f9', color: '#475569' }}>
              <PackageCheck size={22} />
            </div>
          </div>

          {/* Commission Settlement Quick Widget */}
          <div
            className="stat-card"
            style={{ cursor: 'pointer', background: '#fffcf5', border: '1px solid var(--gold-border)' }}
            onClick={() => onNavigateTab('settlements')}
            title="Open Commission Settlement Dashboard"
          >
            <div>
              <div className="stat-title" style={{ color: 'var(--gold-hover)' }}>Commission Settlement</div>
              <div className="stat-value" style={{ color: 'var(--primary)', fontSize: '1.4rem' }}>
                ₹2 <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>/ item</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gold-hover)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                <span>Manage Settlements</span> <ArrowRight size={12} />
              </div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: 'var(--gold-light)', color: 'var(--gold-hover)' }}>
              <Coins size={22} />
            </div>
          </div>
        </div>
      </div>


      {/* 2. TWO COLUMN GRID: TOP PRODUCTS & RECENT ORDERS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* TOP PRODUCTS RANKED BY QUANTITY SOLD */}
        <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Top Selling Products</h4>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              Ranked by Units Sold
            </span>
          </div>

          {topProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              <AlertCircle size={32} style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: 700 }}>No sales data available yet</div>
              <div style={{ fontSize: '0.8rem' }}>Product ranking will appear as orders are processed.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {topProducts.map((item, idx) => {
                const percent = Math.round((item.quantitySold / maxSoldQty) * 100);
                return (
                  <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ width: 22, height: 22, borderRadius: '50%', background: idx === 0 ? 'var(--gold)' : 'var(--bg-muted)', color: idx === 0 ? '#fff' : 'var(--text-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                          {idx + 1}
                        </span>
                        <strong style={{ color: 'var(--text-main)' }}>{item.name}</strong>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{item.quantitySold} sold</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                          (₹{item.revenue})
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ height: 6, width: '100%', background: 'var(--bg-muted)', borderRadius: 3, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${percent}%`,
                          background: idx === 0 ? 'linear-gradient(90deg, var(--gold) 0%, var(--primary) 100%)' : 'var(--primary)',
                          borderRadius: 3,
                          transition: 'width 0.4s ease'
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RECENT LIVE ORDERS QUEUE */}
        <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} style={{ color: 'var(--primary)' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Recent Orders</h4>
            </div>

            <button
              onClick={() => onNavigateTab('orders')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
            >
              <span>View All</span> <ArrowRight size={12} />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              <AlertCircle size={32} style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: 700 }}>No recent orders</div>
              <div style={{ fontSize: '0.8rem' }}>Incoming orders will appear here in real time.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentOrders.map((ord) => {
                const tokenDisplay = `#${ord.token || ord.id}`;
                const isReady = ord.status === 'ready';
                const isReceived = ord.status === 'received';

                return (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedAdminOrder(ord)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      background: 'var(--bg-page)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      borderLeft: isReady ? '4px solid #16a34a' : isReceived ? '4px solid #2563eb' : '1px solid var(--border-subtle)',
                      transition: 'transform var(--transition-fast)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                          TOKEN {tokenDisplay}
                        </span>
                        <span style={{ fontSize: '0.72rem', background: '#fff', padding: '1px 6px', borderRadius: 4, fontWeight: 800, color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                          {ord.status.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {ord.customerName} • {ord.items.length} {ord.items.length === 1 ? 'item' : 'items'}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary)' }}>
                        ₹{ord.grandTotal || ord.total}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
