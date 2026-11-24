import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Store, User, ArrowRightLeft } from 'lucide-react';

export const ViewSwitchBanner = () => {
  const { activeView, setActiveView, isAdminAuthenticated } = useStore();

  const isCustomer = activeView.startsWith('customer');

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 90,
        boxShadow: 'var(--shadow-lg)'
      }}
    >
      <button
        onClick={() => {
          if (isCustomer) {
            setActiveView(isAdminAuthenticated ? 'admin-dashboard' : 'admin-login');
          } else {
            setActiveView('customer-home');
          }
        }}
        className="btn"
        style={{
          background: 'var(--bg-dark)',
          color: '#FFFFFF',
          borderRadius: 'var(--radius-full)',
          padding: '0.55rem 1.15rem',
          fontSize: '0.8125rem',
          fontWeight: 700,
          border: '1.5px solid var(--gold-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: '0 4px 14px rgba(100, 27, 37, 0.25)'
        }}
        title="Prototype Switcher: Jump between Customer and Admin portals"
      >
        <ArrowRightLeft size={14} style={{ color: 'var(--gold)' }} />
        <span>Switch to {isCustomer ? 'Shop Admin Portal' : 'Customer Store'}</span>
      </button>
    </div>
  );
};
