import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Store, Phone, MapPin, Clock, QrCode, Database, Check, Save } from 'lucide-react';

export const AdminSettings = () => {
  const { shopConfig, setShopConfig, showToast } = useStore();
  const [formData, setFormData] = useState({ ...shopConfig });

  const handleSave = (e) => {
    e.preventDefault();
    setShopConfig(formData);
    showToast('Shop operational settings updated successfully!');
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Shop & Counter Settings</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Configure shop counter pickup timings, contact numbers, and UPI counter payment QR code.
        </p>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          
          {/* Section 1: Business Profile */}
          <div className="checkout-card" style={{ marginBottom: 0 }}>
            <div className="card-heading">
              <Store size={18} style={{ color: 'var(--primary)' }} />
              <span>Shop Counter Information</span>
            </div>

            <div className="form-group">
              <label className="form-label">Shop Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tagline</label>
              <input
                type="text"
                className="form-input"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Shop Phone / WhatsApp</label>
              <input
                type="text"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Shop Operating Hours</label>
              <input
                type="text"
                className="form-input"
                value={formData.timing}
                onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Shop Counter Address</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            {/* Online Order Toggle */}
            <div style={{ background: '#fffcf5', border: '1px solid var(--gold-border)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Accepting Counter Orders</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Toggle to pause incoming online pickup orders during rush hours.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isOpen: !formData.isOpen })}
                style={{ background: formData.isOpen ? 'var(--primary)' : '#cbd5e1', color: '#fff', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-full)', fontWeight: 800, fontSize: '0.8rem' }}
              >
                {formData.isOpen ? 'COUNTER OPEN' : 'COUNTER PAUSED'}
              </button>
            </div>
          </div>

          {/* Section 2: Preparation & Counter UPI QR */}
          <div className="checkout-card" style={{ marginBottom: 0 }}>
            <div className="card-heading">
              <QrCode size={18} style={{ color: 'var(--primary)' }} />
              <span>Counter Payment & Prep Time</span>
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Preparation Time (Minutes)</label>
              <input
                type="number"
                className="form-input"
                value={formData.avgPrepMinutes}
                onChange={(e) => setFormData({ ...formData, avgPrepMinutes: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Shop UPI ID (for Counter QR Payments)</label>
              <input
                type="text"
                className="form-input"
                value={formData.upiId}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
              />
            </div>

            {/* UPI QR Display Card */}
            <div style={{ background: 'var(--primary-light)', border: '1px dashed var(--primary)', borderRadius: 'var(--radius-sm)', padding: '1.25rem', textAlign: 'center', marginTop: '1rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Counter UPI QR Preview
              </div>
              <div style={{ background: '#fff', padding: '0.75rem', borderRadius: 8, display: 'inline-block', boxShadow: 'var(--shadow-xs)' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=upi://pay?pa=${encodeURIComponent(formData.upiId)}&pn=${encodeURIComponent(formData.shopName)}`}
                  alt="Shop UPI QR"
                  style={{ width: 130, height: 130, display: 'block' }}
                />
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-body)', marginTop: '0.5rem', fontWeight: 600 }}>
                Customers can scan to pay upon counter collection: <strong>{formData.upiId}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Future Firebase Architecture Info Box */}
        <div style={{ background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem 1.5rem', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold-hover)', fontWeight: 800, marginBottom: '0.5rem' }}>
            <Database size={18} />
            <span>Future Firebase Backend Integration Roadmap</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
            State schemas are designed for direct connection with Firebase / Firestore:
            <br />
            • <code>/orders/{'{orderId}'}</code> with 5-step status tracking (<code>received</code>, <code>accepted</code>, <code>preparing</code>, <code>ready</code>, <code>collected</code>)
            <br />
            • <code>/products/{'{productId}'}</code> for real-time menu management & availability
            <br />
            • <code>/config/store</code> for counter timing and UPI settings
          </p>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary btn-lg">
            <Save size={18} /> Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};
