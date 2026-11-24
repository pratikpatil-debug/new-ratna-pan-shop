import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Plus, Minus, Edit2, Trash2, Check, X, Search, Sparkles, AlertCircle, AlertTriangle, Image as ImageIcon, Layers } from 'lucide-react';

export const AdminProducts = () => {
  const {
    products,
    categories,
    orders,
    addProduct,
    editProduct,
    adjustProductStock,
    toggleProductAvailability,
    deleteProduct,
    uploadProductImage,
    showToast
  } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); // 'all', 'available', 'low_stock', 'sold_out'
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Compute product sales metrics from actual order history
  const productPerformanceMap = React.useMemo(() => {
    const map = {};
    orders
      .filter((o) => o.status !== 'rejected')
      .forEach((order) => {
        (order.items || []).forEach((it) => {
          const key = it.productId || it.id || it.name;
          if (!map[key]) {
            map[key] = { unitsSold: 0, revenue: 0 };
          }
          const qty = Number(it.quantity) || 1;
          const price = Number(it.price) || 0;
          map[key].unitsSold += qty;
          map[key].revenue += qty * price;
        });
      });
    return map;
  }, [orders]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'meetha',
    price: '',
    stockQuantity: 0,
    description: '',
    image: '',
    tags: 'Bestseller, 100% Tobacco Free',
    prepTime: '2 mins',
    ingredients: '',
    isAvailable: true,
    customizable: true
  });

  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size must be under 5MB', 'error');
      return;
    }

    try {
      setIsUploadingImage(true);
      showToast('Uploading image...', 'info');
      const downloadUrl = await uploadProductImage(file, editingProduct?.id || 'new');
      setFormData((prev) => ({ ...prev, image: downloadUrl }));
      showToast('Image uploaded successfully!', 'success');
    } catch (err) {
      console.error('Image upload failure:', err);
      showToast(err.message || 'Image upload failed. You can paste an image URL instead.', 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'meetha',
      price: '',
      stockQuantity: 0,
      description: '',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
      tags: 'Bestseller, 100% Tobacco Free',
      prepTime: '2 mins',
      ingredients: 'Fresh Betel Leaf, Royal Gulkand, Sweet Spices',
      isAvailable: true,
      customizable: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      stockQuantity: product.stockQuantity !== undefined ? Number(product.stockQuantity) : 0,
      description: product.description,
      image: product.image,
      tags: product.tags ? product.tags.join(', ') : '',
      prepTime: product.prepTime || '2 mins',
      ingredients: product.ingredients || '',
      isAvailable: product.isAvailable !== false && product.available !== false,
      customizable: product.customizable !== false
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const tagArray = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const productPayload = {
      ...formData,
      tags: tagArray,
      price: Number(formData.price) || 0,
      stockQuantity: Math.max(0, parseInt(formData.stockQuantity, 10) || 0),
      available: formData.isAvailable,
      isAvailable: formData.isAvailable
    };

    if (editingProduct) {
      editProduct(editingProduct.id, productPayload);
    } else {
      addProduct(productPayload);
    }
    setIsModalOpen(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCat === 'all' || p.category === selectedCat;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    const stock = Number(p.stockQuantity !== undefined ? p.stockQuantity : 0);
    const isAvail = p.isAvailable !== false && p.available !== false;

    let matchesStock = true;
    if (stockFilter === 'available') {
      matchesStock = isAvail && stock > 0;
    } else if (stockFilter === 'low_stock') {
      matchesStock = isAvail && stock > 0 && stock <= 5;
    } else if (stockFilter === 'sold_out') {
      matchesStock = !isAvail || stock === 0;
    }

    return matchesCat && matchesSearch && matchesStock;
  });

  return (
    <div>
      {/* Top Header & Actions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Manage Menu & Inventory</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Total {products.length} handcrafted items • Live stock management & availability
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} /> Add New Product
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem', background: '#fff', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCat(c.id)}
                className={`btn btn-sm ${selectedCat === c.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: 240, minWidth: 200 }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.2rem', paddingRight: '0.75rem', fontSize: '0.85rem' }}
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={14} style={{ position: 'absolute', left: 10, top: 12, color: 'var(--text-muted)' }} />
          </div>
        </div>

        {/* Stock Status Sub-Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Stock Filter:
          </span>
          {[
            { id: 'all', label: 'All Items' },
            { id: 'available', label: 'In Stock' },
            { id: 'low_stock', label: 'Low Stock (≤ 5)' },
            { id: 'sold_out', label: 'Sold Out' }
          ].map((sf) => (
            <button
              key={sf.id}
              onClick={() => setStockFilter(sf.id)}
              className={`btn btn-sm ${stockFilter === sf.id ? 'btn-gold' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-full)' }}
            >
              {sf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {filteredProducts.map((prod) => {
          const stock = prod.stockQuantity !== undefined ? Number(prod.stockQuantity) : 25;
          const isSoldOut = stock <= 0 || prod.isAvailable === false || prod.available === false;
          const isLowStock = stock > 0 && stock <= 5 && prod.isAvailable !== false;

          return (
            <div
              key={prod.id}
              style={{
                background: '#fff',
                borderRadius: 'var(--radius-md)',
                border: isSoldOut ? '1px solid #fecaca' : isLowStock ? '1px solid #fde68a' : '1px solid var(--border-subtle)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                position: 'relative',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', gap: '0.85rem' }}>
                <img
                  src={prod.image}
                  alt={prod.name}
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: 'var(--radius-sm)',
                    objectFit: 'cover',
                    background: 'var(--bg-muted)',
                    opacity: isSoldOut ? 0.9 : 1
                  }}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--gold-hover)', fontWeight: 800 }}>
                      {prod.category}
                    </div>
                    {/* Stock Status Badge */}
                    {stock === 0 ? (
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 7px', borderRadius: 4, background: '#fee2e2', color: '#dc2626' }}>
                        Sold Out
                      </span>
                    ) : isLowStock ? (
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 7px', borderRadius: 4, background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <AlertTriangle size={10} /> Low Stock
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: '#dcfce7', color: '#15803d' }}>
                        Available
                      </span>
                    )}
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.25, marginTop: '2px' }}>{prod.name}</h4>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem', fontFamily: 'var(--font-heading)' }}>
                    ₹{prod.price}
                  </div>

                  {/* Performance indicator */}
                  <div style={{ fontSize: '0.72rem', color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 6px', borderRadius: 4, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                    <span>{productPerformanceMap[prod.id]?.unitsSold || 0} sold</span>
                    <span>•</span>
                    <span>₹{productPerformanceMap[prod.id]?.revenue || 0} rev</span>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.45, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {prod.description}
              </p>

              {/* Stock Quantity Quick Stepper Controls */}
              <div style={{ background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Layers size={14} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Stock: <strong style={{ color: stock === 0 ? '#dc2626' : stock <= 5 ? '#b45309' : 'var(--primary)' }}>{stock}</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <button
                    onClick={() => adjustProductStock(prod.id, -1)}
                    className="stepper-btn"
                    style={{ width: 26, height: 26, borderRadius: 4 }}
                    title="Decrease stock by 1"
                    aria-label="Decrease stock"
                  >
                    <Minus size={12} />
                  </button>

                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        adjustProductStock(prod.id, Math.max(0, val), true);
                      }
                    }}
                    style={{
                      width: 44,
                      textAlign: 'center',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 4,
                      padding: '2px 0',
                      background: '#fff'
                    }}
                    title="Directly edit stock"
                  />

                  <button
                    onClick={() => adjustProductStock(prod.id, 1)}
                    className="stepper-btn"
                    style={{ width: 26, height: 26, borderRadius: 4 }}
                    title="Increase stock by 1"
                    aria-label="Increase stock"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              {/* Bottom Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', marginTop: 'auto' }}>
                {/* Availability Toggle */}
                <button
                  onClick={() => toggleProductAvailability(prod.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    background: (prod.isAvailable !== false && prod.available !== false) ? '#dcfce7' : '#fee2e2',
                    color: (prod.isAvailable !== false && prod.available !== false) ? '#15803d' : '#991b1b',
                    cursor: 'pointer',
                    border: 'none'
                  }}
                >
                  {(prod.isAvailable !== false && prod.available !== false) ? <Check size={12} /> : <X size={12} />}
                  {(prod.isAvailable !== false && prod.available !== false) ? 'Active (Listed)' : 'Inactive (Hidden)'}
                </button>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    onClick={() => handleOpenEdit(prod)}
                    className="btn btn-secondary btn-sm"
                    title="Edit Product Details & Stock"
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete product "${prod.name}"?`)) {
                        deleteProduct(prod.id);
                      }
                    }}
                    className="btn btn-danger btn-sm"
                    title="Delete Product"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product to Menu'}
              </h3>
              <button className="drawer-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Special Maghai Kesar Paan"
                    required
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {categories.filter((c) => c.id !== 'all').map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Price (₹) *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="e.g. 50"
                      required
                    />
                  </div>
                </div>

                {/* Stock Quantity & Availability Controls */}
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">
                      Available Quantity (Stock) *
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="stepper-btn"
                        onClick={() => setFormData((prev) => ({ ...prev, stockQuantity: Math.max(0, (parseInt(prev.stockQuantity, 10) || 0) - 1) }))}
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="number"
                        min="0"
                        className="form-input"
                        style={{ textAlign: 'center', fontWeight: 800 }}
                        value={formData.stockQuantity}
                        onChange={(e) => setFormData({ ...formData, stockQuantity: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                        required
                      />
                      <button
                        type="button"
                        className="stepper-btn"
                        onClick={() => setFormData((prev) => ({ ...prev, stockQuantity: (parseInt(prev.stockQuantity, 10) || 0) + 1 }))}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3, display: 'block' }}>
                      Set to 0 to mark as Sold Out
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Menu Listing Status</label>
                    <select
                      className="form-select"
                      value={formData.isAvailable ? 'true' : 'false'}
                      onChange={(e) => setFormData({ ...formData, isAvailable: e.target.value === 'true' })}
                    >
                      <option value="true">Active (Listed on Menu)</option>
                      <option value="false">Inactive (Temporarily Hidden)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Short Description</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Crisp tender leaf with gulkand and rose syrup..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Product Image</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="url"
                      className="form-input"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="Enter Image URL (https://...)"
                      style={{ flex: 1 }}
                    />
                    <label
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: isUploadingImage ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}
                    >
                      <ImageIcon size={14} />
                      {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        disabled={isUploadingImage}
                        onChange={handleImageFileUpload}
                      />
                    </label>
                  </div>

                  {formData.image && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                      <img
                        src={formData.image}
                        alt="Product preview"
                        style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 4, background: '#e2e8f0' }}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                        {formData.image}
                      </span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Key Ingredients</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.ingredients}
                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                    placeholder="Maghai Leaf, Gulkand, Fennel, Silver Vark..."
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Tags (comma separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Bestseller, 100% Tobacco Free, Supari-Free"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
