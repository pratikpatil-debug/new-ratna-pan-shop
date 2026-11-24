import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Type, Check, ChevronDown } from 'lucide-react';

const FONT_THEMES = [
  {
    id: 'royal',
    name: 'Royal Banarasi',
    tagline: 'Marcellus & Cinzel Imperial Serif',
    icon: '👑',
    fontSample: 'राजसी'
  },
  {
    id: 'modern',
    name: 'Modern Chic',
    tagline: 'Outfit & Space Grotesk Bold',
    icon: '⚡',
    fontSample: 'Urban'
  },
  {
    id: 'classic',
    name: 'Artisan Velvet',
    tagline: 'Playfair Display & Editorial Sans',
    icon: '✒️',
    fontSample: 'Classic'
  }
];

export const FontThemeSwitcher = () => {
  const { fontTheme, setFontTheme, showToast } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const current = FONT_THEMES.find((t) => t.id === fontTheme) || FONT_THEMES[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id, name) => {
    setFontTheme(id);
    setIsOpen(false);
    showToast(`Typography switched to "${name}"`, 'info');
  };

  return (
    <div className="font-switcher-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className="font-switcher-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Select typography aesthetic theme"
        title="Switch UI Typography Theme"
      >
        <span className="font-switcher-icon">{current.icon}</span>
        <span className="font-switcher-label">{current.name}</span>
        <ChevronDown size={12} className={`font-switcher-chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="font-switcher-dropdown animate-dropdown-fade">
          <div className="font-switcher-header">
            <Type size={13} style={{ color: 'var(--primary)' }} />
            <span>UI Typography & Aesthetics</span>
          </div>

          <div className="font-switcher-list">
            {FONT_THEMES.map((theme) => {
              const isSelected = theme.id === fontTheme;
              return (
                <button
                  key={theme.id}
                  type="button"
                  className={`font-theme-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(theme.id, theme.name)}
                >
                  <div className="font-theme-item-left">
                    <span className="font-theme-icon">{theme.icon}</span>
                    <div className="font-theme-details">
                      <div className="font-theme-name">{theme.name}</div>
                      <div className="font-theme-tagline">{theme.tagline}</div>
                    </div>
                  </div>
                  {isSelected && <Check size={14} className="font-theme-check" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
