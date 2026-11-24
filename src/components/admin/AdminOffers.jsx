import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  Gift,
  X,
  AlertCircle
} from 'lucide-react';
import { isOfferDateValid } from '../../services/offerService';

export const AdminOffers = () => {
  const {
    offers,
    products,
    categories,
    createOffer,
    editOffer,
    toggleOfferStatus,
    deleteOffer,
    showToast
  } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountType: 'flat',
    discountValue: 20,
    minimumQuantity: 2,
    applicableCategory: 'all',
    applicableProductIds: [],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    enabled: true
  });

  const openCreateModal = () => {
    setEditingOffer(null);
    setFormData({
      title: '',
      description: '',
      discountType: 'flat',
      discountValue: 20,
      minimumQuantity: 2,
      applicableCategory: 'all',
      applicableProductIds: [],
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      enabled: true
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title || '',
      description: offer.description || '',
      discountType: offer.discountType || 'flat',
      discountValue: offer.discountValue ?? 10,
      minimumQuantity: offer.minimumQuantity ?? 1,
      applicableCategory: offer.applicableCategory || 'all',
      applicableProductIds: Array.isArray(offer.applicableProductIds) ? offer.applicableProductIds : [],
      startDate: offer.startDate ? String(offer.startDate).split('T')[0] : '',
      endDate: offer.endDate ? String(offer.endDate).split('T')[0] : '',
      enabled: offer.enabled !== false
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = 'Offer title is required.';
    }
    if (!formData.description.trim()) {
      errors.description = 'Short description is required.';
    }
    if (Number(formData.discountValue) <= 0) {
      errors.discountValue = 'Discount value must be greater than 0.';
    }
    if (Number(formData.minimumQuantity) < 1) {
      errors.minimumQuantity = 'Minimum quantity must be at least 1.';
    }
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      errors.endDate = 'End date cannot be earlier than start date.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveOffer = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      if (editingOffer) {
        await editOffer(editingOffer.id, formData);
      } else {
        await createOffer(formData);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save offer:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (offer) => {
    if (window.confirm(`Are you sure you want to delete offer "${offer.title}"?`)) {
      await deleteOffer(offer.id);
    }
  };

  const formatCategoryName = (catId) => {
    if (!catId || catId === 'all') return 'All Specialties';
    const found = categories.find((c) => c.id === catId);
    return found ? found.name : catId;
  };

  return (
    <div className="admin-offers-page">
      {/* Header Banner */}
      <div className="admin-page-header">
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Offers & Deals Management
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
            Configure live customer promotions, combo discounts, and automatic checkout savings.
          </p>
        </div>

        <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
          <Plus size={16} /> Create New Offer
        </button>
      </div>

      {/* Offers Cards Grid */}
      <div className="admin-offers-grid">
        {offers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', gridColumn: '1 / -1' }}>
            <Gift size={36} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No offers created yet</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Create your first promotional deal for paan party orders or combos.
            </p>
            <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
              <Plus size={15} /> Add Offer
            </button>
          </div>
        ) : (
          offers.map((offer) => {
            const isDateValid = isOfferDateValid(offer.startDate, offer.endDate);
            const isCurrentlyActive = offer.enabled && isDateValid;

            return (
              <div
                key={offer.id}
                className={`admin-offer-card ${offer.enabled ? '' : 'admin-offer-disabled'}`}
              >
                {/* Top bar with tag & status switch */}
                <div className="admin-offer-card-top">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span className="admin-offer-discount-pill">
                      ₹{offer.discountValue} OFF
                    </span>
                    {isCurrentlyActive ? (
                      <span className="status-badge status-badge-ready" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                        Active
                      </span>
                    ) : !offer.enabled ? (
                      <span className="status-badge status-badge-rejected" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                        Disabled
                      </span>
                    ) : (
                      <span className="status-badge" style={{ fontSize: '0.72rem', padding: '2px 8px', background: '#fef3c7', color: '#b45309' }}>
                        Expired / Scheduled
                      </span>
                    )}
                  </div>

                  {/* Enable / Disable Toggle Switch */}
                  <label className="switch-container" title={offer.enabled ? 'Click to Disable' : 'Click to Enable'}>
                    <input
                      type="checkbox"
                      checked={offer.enabled}
                      onChange={() => toggleOfferStatus(offer.id)}
                    />
                    <span className="switch-slider"></span>
                  </label>
                </div>

                {/* Offer Details */}
                <div style={{ padding: '1rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    {offer.title}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-body)', lineHeight: 1.45, marginBottom: '0.85rem' }}>
                    {offer.description}
                  </p>

                  <div className="admin-offer-meta-box">
                    <div className="admin-offer-meta-item">
                      <span className="meta-label">Min Qty:</span>
                      <span className="meta-value">{offer.minimumQuantity} items</span>
                    </div>

                    <div className="admin-offer-meta-item">
                      <span className="meta-label">Category:</span>
                      <span className="meta-value">{formatCategoryName(offer.applicableCategory)}</span>
                    </div>

                    {offer.startDate && (
                      <div className="admin-offer-meta-item" style={{ gridColumn: '1 / -1' }}>
                        <span className="meta-label">Validity:</span>
                        <span className="meta-value" style={{ fontSize: '0.78rem' }}>
                          {String(offer.startDate).split('T')[0]} → {String(offer.endDate).split('T')[0]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="admin-offer-card-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => openEditModal(offer)}
                    style={{ flex: 1 }}
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    className="btn btn-sm"
                    onClick={() => handleDelete(offer)}
                    style={{ color: '#dc2626', background: '#fee2e2', border: '1px solid #fecaca' }}
                    title="Delete Offer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit Offer Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="admin-offer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Tag size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                  {editingOffer ? 'Edit Offer & Deal' : 'Create New Offer'}
                </h3>
              </div>
              <button className="drawer-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveOffer}>
              <div className="modal-body" style={{ maxHeight: 'calc(80vh - 120px)', overflowY: 'auto' }}>
                {/* Title */}
                <div className="form-group">
                  <label className="form-label">Offer Title *</label>
                  <input
                    type="text"
                    className={`form-input ${formErrors.title ? 'input-error' : ''}`}
                    placeholder="e.g. Paan Party Deal"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                  {formErrors.title && (
                    <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: 3 }}>
                      {formErrors.title}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="form-label">Short Description *</label>
                  <textarea
                    className={`form-input ${formErrors.description ? 'input-error' : ''}`}
                    placeholder="e.g. Buy any 3 eligible paans and get ₹20 OFF."
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                  {formErrors.description && (
                    <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: 3 }}>
                      {formErrors.description}
                    </div>
                  )}
                </div>

                {/* Discount Value & Min Qty */}
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Discount Amount (₹ OFF) *</label>
                    <input
                      type="number"
                      className={`form-input ${formErrors.discountValue ? 'input-error' : ''}`}
                      min="1"
                      step="1"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                      required
                    />
                    {formErrors.discountValue && (
                      <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: 3 }}>
                        {formErrors.discountValue}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Minimum Quantity *</label>
                    <input
                      type="number"
                      className={`form-input ${formErrors.minimumQuantity ? 'input-error' : ''}`}
                      min="1"
                      step="1"
                      value={formData.minimumQuantity}
                      onChange={(e) => setFormData({ ...formData, minimumQuantity: Number(e.target.value) })}
                      required
                    />
                    {formErrors.minimumQuantity && (
                      <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: 3 }}>
                        {formErrors.minimumQuantity}
                      </div>
                    )}
                  </div>
                </div>

                {/* Applicable Category */}
                <div className="form-group">
                  <label className="form-label">Applicable Category</label>
                  <select
                    className="form-input"
                    value={formData.applicableCategory}
                    onChange={(e) => setFormData({ ...formData, applicableCategory: e.target.value })}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3, display: 'block' }}>
                    Select "All Specialties" to apply across all products in the menu.
                  </span>
                </div>

                {/* Start & End Dates */}
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      className={`form-input ${formErrors.endDate ? 'input-error' : ''}`}
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                    {formErrors.endDate && (
                      <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: 3 }}>
                        {formErrors.endDate}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem', background: 'var(--bg-muted)', borderRadius: 'var(--radius-sm)', marginTop: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>Enable Offer</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Active offers will be automatically checked during checkout.
                    </div>
                  </div>
                  <label className="switch-container">
                    <input
                      type="checkbox"
                      checked={formData.enabled}
                      onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    />
                    <span className="switch-slider"></span>
                  </label>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', padding: '1rem 1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : editingOffer ? 'Update Offer' : 'Create Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
