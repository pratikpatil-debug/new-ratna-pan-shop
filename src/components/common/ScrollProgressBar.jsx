import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';

export const ScrollProgressBar = () => {
  const { activeView } = useStore();
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (docHeight <= 0) {
        setScrollProgress(0);
        return;
      }
      const progress = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeView]);

  // Only show on customer views
  if (!activeView.startsWith('customer')) return null;

  return (
    <div className="scroll-progress-wrapper" aria-hidden="true">
      <div
        className="scroll-progress-bar"
        style={{
          transform: `scaleX(${scrollProgress / 100})`
        }}
      >
        {scrollProgress > 1 && (
          <div className="scroll-progress-glow-tip" />
        )}
      </div>
    </div>
  );
};
