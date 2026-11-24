import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';

/**
 * LivePaanBackground
 * Ultra-luxury live animated background featuring handcrafted Indian paan elements:
 * - Folded Triangular Meetha Paans (Paan Beda with clove & silver foil)
 * - Fresh Heart-Shaped Banarasi Betel Leaves
 * - Royal Silver Kesar Paan Folds
 * - Damask Rose Petals (Pure Gulkand)
 * - Antique Gold Sparkles
 * 
 * Interacts dynamically with page scrolling:
 * - 3D parallax depth layers (slow background, responsive midground, expressive foreground)
 * - Continuous natural sway and drift
 * - Rotation and tilt responding to scroll velocity and offset
 */
export const LivePaanBackground = () => {
  const { activeView } = useStore();
  const [scrollY, setScrollY] = useState(0);
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(Date.now());
  const velocityTimer = useRef(null);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY || document.documentElement.scrollTop;
          const now = Date.now();
          const dt = Math.max(1, now - lastScrollTime.current);
          const dy = currentY - lastScrollY.current;
          const vel = Math.max(-25, Math.min(25, (dy / dt) * 15));

          setScrollY(currentY);
          setScrollVelocity(vel);

          lastScrollY.current = currentY;
          lastScrollTime.current = now;

          // Decay velocity back to 0 when scrolling stops
          clearTimeout(velocityTimer.current);
          velocityTimer.current = setTimeout(() => {
            setScrollVelocity(0);
          }, 120);

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(velocityTimer.current);
    };
  }, []);

  // Generate 22 luxury paan elements distributed across the canvas
  const paanElements = useMemo(() => {
    const types = ['folded-paan', 'banarasi-leaf', 'silver-paan', 'rose-petal', 'gold-sparkle'];
    
    // Curated positions spread across edges, mid-lanes, and background
    const configs = [
      // Left side floating paans
      { left: 3, top: 4, type: 'folded-paan', layer: 'front', scale: 1.15, baseRot: -18, rotSpeed: 0.06, swayDuration: 7 },
      { left: 8, top: 22, type: 'banarasi-leaf', layer: 'mid', scale: 1.0, baseRot: 24, rotSpeed: -0.05, swayDuration: 9 },
      { left: 4, top: 42, type: 'silver-paan', layer: 'front', scale: 1.1, baseRot: -30, rotSpeed: 0.08, swayDuration: 8 },
      { left: 9, top: 62, type: 'folded-paan', layer: 'mid', scale: 0.95, baseRot: 15, rotSpeed: -0.06, swayDuration: 7.5 },
      { left: 5, top: 82, type: 'rose-petal', layer: 'mid', scale: 1.05, baseRot: -45, rotSpeed: 0.07, swayDuration: 6.5 },
      
      // Right side floating paans (safely positioned within mobile bounds)
      { left: 83, top: 6, type: 'banarasi-leaf', layer: 'front', scale: 1.15, baseRot: 35, rotSpeed: -0.07, swayDuration: 8.5 },
      { left: 80, top: 25, type: 'folded-paan', layer: 'mid', scale: 1.0, baseRot: -20, rotSpeed: 0.06, swayDuration: 7 },
      { left: 84, top: 45, type: 'rose-petal', layer: 'front', scale: 1.1, baseRot: 40, rotSpeed: -0.08, swayDuration: 6 },
      { left: 79, top: 66, type: 'silver-paan', layer: 'mid', scale: 0.95, baseRot: -15, rotSpeed: 0.05, swayDuration: 8 },
      { left: 82, top: 86, type: 'folded-paan', layer: 'front', scale: 1.05, baseRot: 28, rotSpeed: -0.06, swayDuration: 7.5 },

      // Midground ambient background drift (near page content gutters)
      { left: 16, top: 12, type: 'rose-petal', layer: 'back', scale: 0.85, baseRot: -10, rotSpeed: 0.04, swayDuration: 10 },
      { left: 81, top: 18, type: 'gold-sparkle', layer: 'back', scale: 0.9, baseRot: 0, rotSpeed: 0.09, swayDuration: 5 },
      { left: 22, top: 34, type: 'banarasi-leaf', layer: 'back', scale: 0.75, baseRot: 50, rotSpeed: -0.04, swayDuration: 11 },
      { left: 76, top: 38, type: 'folded-paan', layer: 'back', scale: 0.8, baseRot: -35, rotSpeed: 0.04, swayDuration: 9.5 },
      { left: 18, top: 54, type: 'gold-sparkle', layer: 'back', scale: 0.8, baseRot: 15, rotSpeed: 0.08, swayDuration: 6 },
      { left: 79, top: 58, type: 'rose-petal', layer: 'back', scale: 0.75, baseRot: -25, rotSpeed: -0.05, swayDuration: 8.5 },
      { left: 20, top: 74, type: 'folded-paan', layer: 'back', scale: 0.85, baseRot: 20, rotSpeed: 0.04, swayDuration: 10 },
      { left: 77, top: 78, type: 'banarasi-leaf', layer: 'back', scale: 0.8, baseRot: -40, rotSpeed: -0.04, swayDuration: 11.5 },
      
      // Center subtle accent elements
      { left: 48, top: 15, type: 'gold-sparkle', layer: 'back', scale: 0.7, baseRot: 0, rotSpeed: 0.1, swayDuration: 5.5 },
      { left: 52, top: 48, type: 'rose-petal', layer: 'back', scale: 0.7, baseRot: 30, rotSpeed: -0.04, swayDuration: 9 },
      { left: 46, top: 70, type: 'gold-sparkle', layer: 'back', scale: 0.75, baseRot: 45, rotSpeed: 0.07, swayDuration: 6 },
      { left: 50, top: 92, type: 'banarasi-leaf', layer: 'back', scale: 0.75, baseRot: -15, rotSpeed: 0.03, swayDuration: 10 }
    ];

    return configs.map((cfg, idx) => {
      // Speed multiplier by layer for distinct 3D parallax depth
      const speed = cfg.layer === 'front' ? -0.42 : cfg.layer === 'mid' ? -0.24 : -0.12;
      const opacity = cfg.layer === 'front' ? 0.35 : cfg.layer === 'mid' ? 0.22 : 0.14;
      return {
        id: `paan-bg-${idx}`,
        ...cfg,
        speed,
        opacity,
        delay: (idx * 0.45) % 4
      };
    });
  }, []);

  if (!activeView.startsWith('customer')) return null;

  return (
    <div className="live-paan-bg-container" aria-hidden="true">
      {paanElements.map((el) => {
        // Vertical offset based on scrollY and parallax speed
        const translateY = scrollY * el.speed;
        // Rotation based on scroll distance + tilt velocity
        const rotation = el.baseRot + scrollY * el.rotSpeed + scrollVelocity * 0.8;
        // Subtle tilt on scroll momentum
        const tilt = Math.max(-15, Math.min(15, scrollVelocity * 0.5));

        return (
          <div
            key={el.id}
            className={`live-paan-item live-paan-${el.type} live-paan-layer-${el.layer}`}
            style={{
              left: `${el.left}%`,
              top: `${el.top}%`,
              opacity: el.opacity,
              '--sway-duration': `${el.swayDuration}s`,
              '--sway-delay': `${el.delay}s`,
              transform: `translate3d(0, ${Math.round(translateY)}px, 0) rotate(${rotation.toFixed(1)}deg) skewX(${tilt.toFixed(1)}deg) scale(${el.scale})`
            }}
          >
            {/* 1. Folded Triangular Meetha Paan (Beda) */}
            {el.type === 'folded-paan' && (
              <svg viewBox="0 0 60 60" className="paan-svg-graphic" filter="url(#paanDropShadow)">
                <defs>
                  <linearGradient id={`paan-fold-${el.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1E7A3D" />
                    <stop offset="55%" stopColor="#13592C" />
                    <stop offset="100%" stopColor="#0D3B1D" />
                  </linearGradient>
                  <linearGradient id={`paan-vark-${el.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                    <stop offset="60%" stopColor="#E6C77B" stopOpacity="0.65" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.8" />
                  </linearGradient>
                </defs>
                {/* Folded triangular leaf body */}
                <path
                  d="M30 6 L53 48 L7 48 Z"
                  fill={`url(#paan-fold-${el.id})`}
                  stroke="rgba(74, 222, 128, 0.55)"
                  strokeWidth="1.2"
                />
                {/* Leaf Texture Veins */}
                <path d="M30 8 L32 48" stroke="#16A34A" strokeWidth="1.2" opacity="0.6" strokeDasharray="3 2" />
                <path d="M21 28 L46 44" stroke="#15803D" strokeWidth="1" opacity="0.65" />
                <path d="M38 24 L14 43" stroke="#0F5124" strokeWidth="1" opacity="0.5" />
                {/* Pure Silver / Gold Vark Foil Corner */}
                <polygon
                  points="25,23 37,26 33,35 21,30"
                  fill={`url(#paan-vark-${el.id})`}
                  stroke="rgba(255,255,255,0.7)"
                  strokeWidth="0.5"
                />
                {/* Authentic Clove Pin (Laung) */}
                <circle cx="30" cy="7" r="2.6" fill="#3D1A06" stroke="#78350F" strokeWidth="0.8" />
                <path d="M30 9 L30 14" stroke="#78350F" strokeWidth="1.4" strokeLinecap="round" />
                {/* Pure Gulkand Glaze Accent */}
                <circle cx="32" cy="29" r="2.2" fill="#BE123C" opacity="0.85" />
              </svg>
            )}

            {/* 2. Banarasi Fresh Heart-Shaped Betel Leaf */}
            {el.type === 'banarasi-leaf' && (
              <svg viewBox="0 0 60 70" className="paan-svg-graphic" filter="url(#paanDropShadow)">
                <defs>
                  <linearGradient id={`leaf-grad-${el.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22C55E" />
                    <stop offset="50%" stopColor="#15803D" />
                    <stop offset="100%" stopColor="#14532D" />
                  </linearGradient>
                </defs>
                {/* Heart-shaped Banarasi Betel Leaf */}
                <path
                  d="M30 6 C18 -2, 4 12, 6 34 C8 50, 24 62, 30 68 C36 62, 52 50, 54 34 C56 12, 42 -2, 30 6 Z"
                  fill={`url(#leaf-grad-${el.id})`}
                  stroke="rgba(134, 239, 172, 0.45)"
                  strokeWidth="1.2"
                />
                {/* Main Midrib Stem */}
                <path d="M30 6 Q30 38 30 68" stroke="#0F4723" strokeWidth="1.6" strokeLinecap="round" opacity="0.75" />
                {/* Secondary Veins */}
                <path d="M30 20 Q18 24 10 27 M30 20 Q42 24 50 27" stroke="#16A34A" strokeWidth="1.1" opacity="0.6" />
                <path d="M30 35 Q16 39 9 43 M30 35 Q44 39 51 43" stroke="#16A34A" strokeWidth="1.1" opacity="0.6" />
                <path d="M30 50 Q20 54 15 57 M30 50 Q40 54 45 57" stroke="#16A34A" strokeWidth="1" opacity="0.55" />
              </svg>
            )}

            {/* 3. Royal Silver Kesar Paan Fold */}
            {el.type === 'silver-paan' && (
              <svg viewBox="0 0 60 60" className="paan-svg-graphic" filter="url(#paanDropShadow)">
                <defs>
                  <linearGradient id={`silver-grad-${el.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F8FAFC" />
                    <stop offset="40%" stopColor="#CBD5E1" />
                    <stop offset="80%" stopColor="#64748B" />
                    <stop offset="100%" stopColor="#14532D" />
                  </linearGradient>
                </defs>
                <path
                  d="M30 6 L53 48 L7 48 Z"
                  fill={`url(#silver-grad-${el.id})`}
                  stroke="#E6C77B"
                  strokeWidth="1.2"
                />
                {/* Saffron (Kesar) Strands on top */}
                <path d="M28 18 Q35 26 27 35" stroke="#D97706" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M32 20 Q24 28 33 38" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
                <circle cx="30" cy="7" r="2.6" fill="#78350F" />
              </svg>
            )}

            {/* 4. Damask Rose Petal (Gulkand Petal) */}
            {el.type === 'rose-petal' && (
              <svg viewBox="0 0 40 40" className="paan-svg-graphic">
                <defs>
                  <linearGradient id={`petal-grad-${el.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FB7185" />
                    <stop offset="55%" stopColor="#BE123C" />
                    <stop offset="100%" stopColor="#881337" />
                  </linearGradient>
                </defs>
                <path
                  d="M20 4 C10 4 4 14 6 24 C8 34 20 38 24 36 C32 32 36 20 34 12 C32 6 26 4 20 4 Z"
                  fill={`url(#petal-grad-${el.id})`}
                  stroke="rgba(251, 113, 133, 0.4)"
                  strokeWidth="0.8"
                />
                <path d="M19 8 Q21 22 23 34" stroke="#FFE4E6" strokeWidth="0.8" opacity="0.4" />
              </svg>
            )}

            {/* 5. Antique Gold Star Sparkle */}
            {el.type === 'gold-sparkle' && (
              <svg viewBox="0 0 24 24" className="paan-svg-graphic sparkle-graphic">
                <path
                  d="M12 0 Q12 12 24 12 Q12 12 12 24 Q12 12 0 12 Q12 12 12 0 Z"
                  fill="#E6C77B"
                  stroke="#FFF5D0"
                  strokeWidth="0.6"
                />
              </svg>
            )}
          </div>
        );
      })}

      {/* Global SVG Drop Shadow Filter */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <filter id="paanDropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#3E1018" floodOpacity="0.14" />
        </filter>
      </svg>
    </div>
  );
};
