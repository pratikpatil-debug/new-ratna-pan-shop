import React, { useMemo, useState, useEffect } from 'react';

export const AmbientLeafParticles = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 900) {
        setScrollY(window.scrollY);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Generate random particles for ambient background drift
  const particles = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      left: `${(i * 7.5 + (i % 3) * 5) % 96}%`,
      top: `${(i * 8 + (i % 4) * 6) % 90}%`,
      size: 14 + (i % 4) * 8,
      duration: 8 + (i % 5) * 3,
      delay: (i % 6) * 1.2,
      opacity: 0.18 + (i % 3) * 0.12,
      type: i % 3 === 0 ? 'leaf' : i % 3 === 1 ? 'gold-star' : 'petal',
      rotate: (i * 37) % 360
    }));
  }, []);

  return (
    <div
      className="ambient-particles-container"
      aria-hidden="true"
      style={{ transform: `translate3d(0, ${Math.round(scrollY * -0.12)}px, 0)` }}
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className={`ambient-particle ambient-${p.type}`}
          style={{
            left: p.left,
            top: p.top,
            fontSize: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
            transform: `rotate(${p.rotate}deg)`
          }}
        >
          {p.type === 'leaf' ? '🍃' : p.type === 'gold-star' ? '✦' : '🌸'}
        </span>
      ))}
    </div>
  );
};
