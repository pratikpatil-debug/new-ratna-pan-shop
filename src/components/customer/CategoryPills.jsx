import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Sparkles, Leaf, Crown, Flame, Smile, CupSoda, Cookie } from 'lucide-react';

const iconMap = {
  Sparkles: Sparkles,
  Leaf: Leaf,
  Crown: Crown,
  Flame: Flame,
  Smile: Smile,
  CupSoda: CupSoda,
  Cookie: Cookie
};

export const CategoryPills = () => {
  const { categories, selectedCategory, setSelectedCategory, products, favorites = [] } = useStore();
  const [isDocked, setIsDocked] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById('menu-section');
      if (el) {
        const rect = el.getBoundingClientRect();
        // Header height is 72px desktop / 60px mobile
        const headerThreshold = window.innerWidth <= 768 ? 62 : 74;
        setIsDocked(rect.top <= headerThreshold);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getCount = (catId) => {
    if (catId === 'all') return products.length;
    return products.filter((p) => p.category === catId).length;
  };

  return (
    <section
      className={`categories-nav-section ${isDocked ? 'categories-docked' : ''}`}
      id="menu-section"
      aria-label="Menu Categories Navigation"
    >
      <div className="container">
        <div className="category-scroll-container" role="tablist">
          {categories.map((cat) => {
            const IconComp = iconMap[cat.icon] || Leaf;
            const count = getCount(cat.id);
            const isActive = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedCategory(cat.id)}
                className={`category-pill-btn ${isActive ? 'active' : ''}`}
                tabIndex={0}
              >
                <IconComp size={15} className="category-icon" />
                <span className="category-name">{cat.name}</span>
                <span className="category-count">{count}</span>
              </button>
            );
          })}

          {/* Favorites Filter Pill */}
          <button
            role="tab"
            aria-selected={selectedCategory === 'favorites'}
            onClick={() => setSelectedCategory('favorites')}
            className={`category-pill-btn ${selectedCategory === 'favorites' ? 'active' : ''}`}
            tabIndex={0}
            title="View saved favorite delicacies"
          >
            <span style={{ fontSize: '0.95rem' }}>❤️</span>
            <span className="category-name">Favorites</span>
            <span className="category-count">{favorites.length}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
