import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Sparkles, Check, Plus, Minus, Flame, Heart, Info, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

const LEAF_OPTIONS = [
  { id: 'maghai', name: 'Banarasi Maghai Patta', price: 45, icon: '🍃', tag: 'Melt-in-Mouth', desc: 'Tender, delicate leaf known for its buttery smoothness.' },
  { id: 'calcutta', name: 'Meetha Calcutta Leaf', price: 35, icon: '🌿', tag: 'Crisp & Sweet', desc: 'Crunchy aromatic leaf with a sweet refreshing bite.' },
  { id: 'royal_chandi', name: 'Royal Chandi Leaf (Silver)', price: 75, icon: '✨', tag: 'Imperial Luxe', desc: 'Premium leaf adorned with certified pure edible silver foil.' },
  { id: 'desi_saada', name: 'Desi Banarasi Saada', price: 30, icon: '🌱', tag: 'Bold Heritage', desc: 'Classic earthy Banarasi leaf for authentic connoisseurs.' }
];

const BASE_OPTIONS = [
  { id: 'gulkand', name: 'Shahi Damask Rose Gulkand', price: 15, sweetness: 40, icon: '🌹', desc: 'Sun-matured organic rose petals.' },
  { id: 'kesar_honey', name: 'Kashmiri Kesar & Honey', price: 25, sweetness: 35, icon: '🍯', desc: 'Wild forest honey infused with pure saffron strands.' },
  { id: 'sugar_free', name: 'Sugar-Free Date & Rose Nectar', price: 20, sweetness: 25, icon: '🌿', desc: 'Diabetic-friendly natural date sweetness.' },
  { id: 'kesar_chutney', name: 'Saffron Chutney Jam', price: 15, sweetness: 30, icon: '✨', desc: 'Spiced aromatic kesar compote.' }
];

const FILLING_OPTIONS = [
  { id: 'silver_saunf', name: 'Silver Coated Saunf', price: 10, crunch: 25, icon: '✨', category: 'mukhwas' },
  { id: 'dhanadal', name: 'Roasted Dhanadal', price: 5, crunch: 30, icon: '🌾', category: 'mukhwas' },
  { id: 'coconut', name: 'Sweet Shredded Coconut', price: 10, crunch: 15, icon: '🥥', category: 'sweet' },
  { id: 'tutti_frutti', name: 'Glazed Tutti Frutti & Cherries', price: 10, crunch: 10, icon: '🍒', category: 'sweet' },
  { id: 'elaichi', name: 'Cardamom Elaichi Pearls', price: 10, crunch: 10, icon: '🌿', category: 'spice' },
  { id: 'meetha_supari', name: 'Kashmiri Meetha Supari', price: 15, crunch: 25, icon: '🌰', category: 'spice' },
  { id: 'menthol_chill', name: 'Menthol Ice Crystal Blast', price: 10, cool: 50, icon: '❄️', category: 'ice' },
  { id: 'choco_drizzle', name: 'Dark Chocolate Drizzle', price: 15, sweetness: 20, icon: '🍫', category: 'sweet' },
  { id: 'silver_vark', name: 'Pure Edible Silver Foil (Vark)', price: 25, royal: 40, icon: '👑', category: 'royal' }
];

export const CustomPaanBuilderModal = () => {
  const { isCustomPaanModalOpen, setIsCustomPaanModalOpen, addCustomPaanToCart } = useStore();

  const [selectedLeaf, setSelectedLeaf] = useState(LEAF_OPTIONS[0]);
  const [selectedBase, setSelectedBase] = useState(BASE_OPTIONS[0]);
  const [selectedFillings, setSelectedFillings] = useState(['silver_saunf', 'coconut', 'tutti_frutti']);
  const [customNote, setCustomNote] = useState('');
  const [paanName, setPaanName] = useState('My Bespoke Royal Paan');

  // Prevent background scroll
  useEffect(() => {
    if (!isCustomPaanModalOpen) return;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = orig;
      window.scrollTo({ top: scrollY, behavior: 'instant' });
    };
  }, [isCustomPaanModalOpen]);

  if (!isCustomPaanModalOpen) return null;

  const toggleFilling = (fillingId) => {
    setSelectedFillings((prev) =>
      prev.includes(fillingId) ? prev.filter((id) => id !== fillingId) : [...prev, fillingId]
    );
  };

  // Calculate Total Dynamic Price
  const fillingsCost = selectedFillings.reduce((sum, id) => {
    const item = FILLING_OPTIONS.find((f) => f.id === id);
    return sum + (item ? item.price : 0);
  }, 0);
  const totalPrice = selectedLeaf.price + selectedBase.price + fillingsCost;

  // Flavor Profile Calculation
  const hasIce = selectedFillings.includes('menthol_chill');
  const hasChoco = selectedFillings.includes('choco_drizzle');
  const hasSilver = selectedFillings.includes('silver_vark') || selectedLeaf.id === 'royal_chandi';
  const sweetnessScore = Math.min(100, (selectedBase.sweetness || 30) + (hasChoco ? 30 : 15) + (selectedFillings.length * 6));
  const coolingScore = hasIce ? 90 : 45;
  const crunchScore = Math.min(100, 20 + selectedFillings.length * 15);

  const handleCreateOrder = (e) => {
    e.preventDefault();

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 55,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#E6C77B', '#641B25', '#1B7343', '#ffffff']
      });
    } catch {
      // ignore
    }

    const fillingNames = selectedFillings
      .map((id) => FILLING_OPTIONS.find((f) => f.id === id)?.name)
      .filter(Boolean)
      .join(', ');

    const ingredientsSummary = `${selectedLeaf.name} + ${selectedBase.name} + [${fillingNames}]`;

    addCustomPaanToCart({
      name: paanName.trim() || 'Bespoke Royal Paan',
      price: totalPrice,
      description: `Handcrafted custom creation: ${selectedLeaf.name} layered with ${selectedBase.name} and artisan fillings.`,
      ingredients: ingredientsSummary,
      customizableNote: customNote ? `Note: ${customNote} | Ingredients: ${ingredientsSummary}` : ingredientsSummary,
      image: hasChoco
        ? 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/abd49e69-2d2f-4aa5-92c3-213a3d513e4e_03146df5-a200-45a4-9a8a-6e0be22086ff.jpg_compressed'
        : 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/14a25a25-80fc-4d44-a42e-62004d697657_e5aab33e-4d64-40fa-bb8c-fc5b8b49e006.jpg_compressed'
    });

    setIsCustomPaanModalOpen(false);
  };

  return (
    <div
      className="modal-backdrop"
      onClick={() => setIsCustomPaanModalOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Royal Paan Crafting Studio"
    >
      <div className="modal-card paan-studio-card animate-modal-scale" onClick={(e) => e.stopPropagation()}>
        {/* Studio Header */}
        <div className="modal-header paan-studio-header">
          <div className="paan-studio-title-block">
            <span className="paan-studio-badge">
              <Sparkles size={13} />
              <span>HANDCRAFT STUDIO</span>
            </span>
            <h3 className="paan-studio-heading">Royal Paan Artisan Studio</h3>
            <p className="paan-studio-sub">Select your leaf, fillings, and sweets. Freshly prepared to your exact palate.</p>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={() => setIsCustomPaanModalOpen(false)}
            aria-label="Close custom paan studio"
          >
            <X size={18} />
          </button>
        </div>

        {/* Studio Body */}
        <div className="modal-body paan-studio-body">
          {/* Live Paan Showcase Plate */}
          <div className="paan-preview-plate">
            <div className="paan-preview-plate-inner">
              <div className="paan-preview-leaf-icon">{selectedLeaf.icon}</div>
              <div className="paan-preview-info">
                <input
                  type="text"
                  className="paan-preview-name-input"
                  value={paanName}
                  onChange={(e) => setPaanName(e.target.value)}
                  placeholder="Name your Paan..."
                  title="Click to rename your bespoke paan"
                />
                <div className="paan-preview-meta">
                  <span>{selectedLeaf.name}</span> • <span>{selectedBase.name}</span>
                </div>
              </div>
              <div className="paan-preview-price-box">
                <span className="paan-preview-price-label">Live Price</span>
                <span className="paan-preview-price">₹{totalPrice}</span>
              </div>
            </div>

            {/* Dynamic Flavor Meters */}
            <div className="paan-flavor-meters">
              <div className="flavor-meter-item">
                <div className="meter-label-row">
                  <span>Sweetness</span>
                  <span>{sweetnessScore}%</span>
                </div>
                <div className="meter-bar-track">
                  <div className="meter-bar-fill meter-sweet" style={{ width: `${sweetnessScore}%` }}></div>
                </div>
              </div>
              <div className="flavor-meter-item">
                <div className="meter-label-row">
                  <span>Fresh Chill</span>
                  <span>{coolingScore}%</span>
                </div>
                <div className="meter-bar-track">
                  <div className="meter-bar-fill meter-cool" style={{ width: `${coolingScore}%` }}></div>
                </div>
              </div>
              <div className="flavor-meter-item">
                <div className="meter-label-row">
                  <span>Crunch Factor</span>
                  <span>{crunchScore}%</span>
                </div>
                <div className="meter-bar-track">
                  <div className="meter-bar-fill meter-crunch" style={{ width: `${crunchScore}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 1: Leaf Selection */}
          <div className="studio-step-block">
            <div className="studio-step-title">
              <span className="step-num">1</span>
              <span>Choose Your Betel Leaf Base</span>
            </div>
            <div className="leaf-options-grid">
              {LEAF_OPTIONS.map((leaf) => {
                const isSelected = selectedLeaf.id === leaf.id;
                return (
                  <button
                    key={leaf.id}
                    type="button"
                    className={`leaf-option-card ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedLeaf(leaf)}
                  >
                    <div className="leaf-card-top">
                      <span className="leaf-icon">{leaf.icon}</span>
                      <span className="leaf-tag">{leaf.tag}</span>
                    </div>
                    <div className="leaf-card-name">{leaf.name}</div>
                    <div className="leaf-card-desc">{leaf.desc}</div>
                    <div className="leaf-card-price">₹{leaf.price}</div>
                    {isSelected && <Check size={14} className="leaf-selected-check" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Sweetener / Base */}
          <div className="studio-step-block">
            <div className="studio-step-title">
              <span className="step-num">2</span>
              <span>Select Sweetener Base</span>
            </div>
            <div className="base-options-grid">
              {BASE_OPTIONS.map((base) => {
                const isSelected = selectedBase.id === base.id;
                return (
                  <button
                    key={base.id}
                    type="button"
                    className={`base-option-card ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedBase(base)}
                  >
                    <div className="base-card-content">
                      <span className="base-icon">{base.icon}</span>
                      <div className="base-info">
                        <div className="base-name">{base.name}</div>
                        <div className="base-desc">{base.desc}</div>
                      </div>
                    </div>
                    <div className="base-price">+₹{base.price}</div>
                    {isSelected && <Check size={14} className="leaf-selected-check" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3: Mukhwas & Crunch Fillings */}
          <div className="studio-step-block">
            <div className="studio-step-title">
              <span className="step-num">3</span>
              <span>Add Artisan Mukhwas & Fillings ({selectedFillings.length} chosen)</span>
            </div>
            <div className="fillings-chips-grid">
              {FILLING_OPTIONS.map((filling) => {
                const isChecked = selectedFillings.includes(filling.id);
                return (
                  <button
                    key={filling.id}
                    type="button"
                    className={`filling-chip ${isChecked ? 'active' : ''}`}
                    onClick={() => toggleFilling(filling.id)}
                  >
                    <span className="filling-chip-icon">{filling.icon}</span>
                    <span className="filling-chip-name">{filling.name}</span>
                    <span className="filling-chip-price">+₹{filling.price}</span>
                    {isChecked && <Check size={12} className="filling-chip-check" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special Instructions */}
          <div className="studio-step-block">
            <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
              Special Request for Paan Master (Optional):
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Less sweet, wrap in silver paper, extra ice, separate packet..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer paan-studio-footer">
          <div className="studio-footer-summary">
            <div className="studio-total-label">Total Custom Price:</div>
            <div className="studio-total-price">₹{totalPrice}</div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsCustomPaanModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-gold-shimmer"
              onClick={handleCreateOrder}
            >
              <Sparkles size={16} />
              <span>Add Handcrafted Paan to Order (₹{totalPrice})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
