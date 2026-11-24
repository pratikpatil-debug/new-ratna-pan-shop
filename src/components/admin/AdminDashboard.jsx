import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { SHOP_LOGO_URL } from '../../data/initialProducts';
import { AdminDashboardOverview } from './AdminDashboardOverview';
import { AdminOrders } from './AdminOrders';
import { AdminOrderHistory } from './AdminOrderHistory';
import { AdminProducts } from './AdminProducts';
import { AdminOffers } from './AdminOffers';
import { AdminSettings } from './AdminSettings';
import { AdminCommissionSettlements } from './AdminCommissionSettlements';
import { AdminOrderDetailModal } from './AdminOrderDetailModal';
import {
  LayoutDashboard,
  ShoppingBag,
  History,
  Package,
  Tag,
  Settings,
  LogOut,
  Eye,
  Menu,
  X,
  Sparkles,
  Coins
} from 'lucide-react';

export const AdminDashboard = () => {
  const {
    activeView,
    setActiveView,
    orders,
    products,
    offers,
    shopConfig,
    adminLogout,
    selectedAdminOrder
  } = useStore();

  const logoSrc = shopConfig?.logoUrl || SHOP_LOGO_URL;

  // Internal admin tab: 'dashboard', 'orders', 'history', 'products', 'offers', 'settlements', 'settings'
  const [adminTab, setAdminTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Time-based greeting helper
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning 👋';
    if (hour < 17) return 'Good Afternoon 👋';
    return 'Good Evening 👋';
  };

  // Compute live statistics for sidebar badge
  const newOrdersCount = orders.filter((o) => o.status === 'received' || o.status === 'placed').length;

  return (
    <div className="admin-layout">
      {/* Sidebar (Desktop & Tablet) */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Header */}
        <div className="admin-sidebar-header">
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px', flexShrink: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.35)', border: '1.5px solid var(--gold-border)' }}>
            <img
              src={logoSrc}
              alt="New Ratna Pan Shop"
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', lineHeight: 1.2 }}>
              New Ratna Pan Shop
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>
              Shop Admin Portal
            </div>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            style={{ marginLeft: 'auto', display: mobileMenuOpen ? 'flex' : 'none', color: '#fff' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="admin-nav" aria-label="Admin Navigation">
          <div
            onClick={() => {
              setAdminTab('dashboard');
              setMobileMenuOpen(false);
            }}
            className={`admin-nav-item ${adminTab === 'dashboard' ? 'active' : ''}`}
            role="button"
            tabIndex={0}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </div>

          <div
            onClick={() => {
              setAdminTab('orders');
              setMobileMenuOpen(false);
            }}
            className={`admin-nav-item ${adminTab === 'orders' ? 'active' : ''}`}
            role="button"
            tabIndex={0}
          >
            <ShoppingBag size={18} />
            <span>Live Orders</span>
            {newOrdersCount > 0 && (
              <span className="admin-badge-count">{newOrdersCount}</span>
            )}
          </div>

          <div
            onClick={() => {
              setAdminTab('history');
              setMobileMenuOpen(false);
            }}
            className={`admin-nav-item ${adminTab === 'history' ? 'active' : ''}`}
            role="button"
            tabIndex={0}
          >
            <History size={18} />
            <span>Order History</span>
          </div>

          <div
            onClick={() => {
              setAdminTab('products');
              setMobileMenuOpen(false);
            }}
            className={`admin-nav-item ${adminTab === 'products' ? 'active' : ''}`}
            role="button"
            tabIndex={0}
          >
            <Package size={18} />
            <span>Products</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', opacity: 0.7 }}>
              {products.length}
            </span>
          </div>

          <div
            onClick={() => {
              setAdminTab('offers');
              setMobileMenuOpen(false);
            }}
            className={`admin-nav-item ${adminTab === 'offers' ? 'active' : ''}`}
            role="button"
            tabIndex={0}
          >
            <Tag size={18} />
            <span>Offers & Deals</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', opacity: 0.7 }}>
              {offers.length}
            </span>
          </div>

          <div
            onClick={() => {
              setAdminTab('settlements');
              setMobileMenuOpen(false);
            }}
            className={`admin-nav-item ${adminTab === 'settlements' ? 'active' : ''}`}
            role="button"
            tabIndex={0}
          >
            <Coins size={18} />
            <span>Commission Settlement</span>
          </div>

          <div
            onClick={() => {
              setAdminTab('settings');
              setMobileMenuOpen(false);
            }}
            className={`admin-nav-item ${adminTab === 'settings' ? 'active' : ''}`}
            role="button"
            tabIndex={0}
          >
            <Settings size={18} />
            <span>Settings</span>
          </div>
        </nav>

        {/* Bottom Actions */}
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            type="button"
            onClick={() => setActiveView('customer-home')}
            className="btn btn-secondary btn-full btn-sm"
            style={{ marginBottom: '0.6rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none' }}
          >
            <Eye size={14} /> View Customer Store
          </button>

          <button
            type="button"
            onClick={adminLogout}
            className="btn btn-full btn-sm"
            style={{ color: '#f87171', background: 'transparent', fontWeight: 700 }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main-content">
        {/* Top bar */}
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'none' }}
              id="admin-mobile-menu-btn"
              aria-label="Open sidebar menu"
            >
              <Menu size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px', flexShrink: 0, boxShadow: 'var(--shadow-xs)', border: '1.5px solid var(--gold-border)' }}>
                <img
                  src={logoSrc}
                  alt="New Ratna Pan Shop"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', color: 'var(--gold-hover)', fontWeight: 800 }}>
                  {getGreeting()}
                </div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
                  New Ratna Pan Shop
                </h2>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: shopConfig.isOpen ? '#dcfce7' : '#fee2e2', color: shopConfig.isOpen ? '#166534' : '#991b1b', padding: '0.3rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 800 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: shopConfig.isOpen ? '#16a34a' : '#dc2626' }}></span>
              Counter {shopConfig.isOpen ? 'OPEN' : 'PAUSED'}
            </span>

            <button
              type="button"
              onClick={() => setActiveView('customer-home')}
              className="btn btn-outline btn-sm"
            >
              Customer Menu →
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="admin-content-area">
          {adminTab === 'dashboard' && (
            <AdminDashboardOverview onNavigateTab={(tab) => setAdminTab(tab)} />
          )}
          {adminTab === 'orders' && <AdminOrders />}
          {adminTab === 'history' && <AdminOrderHistory />}
          {adminTab === 'products' && <AdminProducts />}
          {adminTab === 'offers' && <AdminOffers />}
          {adminTab === 'settlements' && <AdminCommissionSettlements />}
          {adminTab === 'settings' && <AdminSettings />}
        </div>
      </main>

      {/* Detailed Order View Modal */}
      {selectedAdminOrder && <AdminOrderDetailModal />}
    </div>
  );
};

