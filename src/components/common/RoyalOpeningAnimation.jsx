import React, { useState, useEffect, useRef } from 'react';
import { Crown, Sparkles, ChevronRight } from 'lucide-react';
import './RoyalOpeningAnimation.css';

const STATUS_MESSAGES = [
  'Handpicking fresh Maghai & Banarasi betel leaves...',
  'Infusing slow-cooked Shahi Gulkand & royal spices...',
  'Adorning with certified pure silver vark...',
  'Welcome to the Royal Taste of Banaras ✦'
];

export const RoyalOpeningAnimation = () => {
  const [isVisible, setIsVisible] = useState(() => {
    // Check if user already saw opening in this browser session
    try {
      return !sessionStorage.getItem('new_ratna_opening_seen');
    } catch {
      return true;
    }
  });

  const [isDismissing, setIsDismissing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const canvasRef = useRef(null);

  // Allow triggering replay from anywhere via custom event
  useEffect(() => {
    const handleReplay = () => {
      setIsDismissing(false);
      setProgress(0);
      setStatusIndex(0);
      setIsVisible(true);
    };

    window.addEventListener('play-royal-opening', handleReplay);
    return () => window.removeEventListener('play-royal-opening', handleReplay);
  }, []);

  const handleDismiss = () => {
    if (isDismissing) return;
    setIsDismissing(true);
    try {
      sessionStorage.setItem('new_ratna_opening_seen', 'true');
    } catch {
      // sessionStorage unavailable
    }
    // Allow curtain animation to complete (850ms) before unmounting
    setTimeout(() => {
      setIsVisible(false);
    }, 850);
  };

  // Keyboard accessibility: ESC key dismisses intro instantly
  useEffect(() => {
    if (!isVisible) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, isDismissing]);

  // Timed progress & ticker sequence
  useEffect(() => {
    if (!isVisible || isDismissing) return;

    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      handleDismiss();
      return;
    }

    const duration = 2800; // 2.8 seconds total intro
    const intervalTime = 40;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          handleDismiss();
          return 100;
        }

        // Update status ticker messages
        if (next < 28) setStatusIndex(0);
        else if (next < 60) setStatusIndex(1);
        else if (next < 88) setStatusIndex(2);
        else setStatusIndex(3);

        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isVisible, isDismissing]);

  // Ambient Golden Stardust Particles on Canvas
  useEffect(() => {
    if (!isVisible || isDismissing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generate 32 gentle rising gold dust motes
    const particles = Array.from({ length: 32 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.8,
      speedY: -(Math.random() * 0.7 + 0.3),
      speedX: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.6 + 0.2,
      pulseSpeed: Math.random() * 0.03 + 0.015,
      pulse: Math.random() * Math.PI
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.pulse += p.pulseSpeed;

        // Wrap around borders
        if (p.y < -10) p.y = height + 10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentOpacity = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));

        // Draw glowing gold particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 212, 119, ${currentOpacity})`;
        ctx.shadowColor = 'rgba(230, 199, 123, 0.8)';
        ctx.shadowBlur = 6;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible, isDismissing]);

  if (!isVisible) return null;

  return (
    <div
      className={`royal-opening-overlay ${isDismissing ? 'dismissing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to New Ratna Pan Shop"
    >
      {/* Royal Silk Curtain Left */}
      <div className="royal-curtain royal-curtain-left" />

      {/* Royal Silk Curtain Right */}
      <div className="royal-curtain royal-curtain-right" />

      {/* Background Indian Jali Motif */}
      <div className="royal-jali-pattern" />

      {/* Ambient Imperial Radial Glow */}
      <div className="royal-ambient-glow" />

      {/* Golden Stardust Particles Canvas */}
      <canvas ref={canvasRef} className="royal-stardust-canvas" />

      {/* Instant Skip / Enter Button */}
      <button
        type="button"
        className="royal-skip-btn"
        onClick={handleDismiss}
        title="Enter Shop (Esc)"
      >
        <span>Enter Counter</span>
        <ChevronRight size={14} />
      </button>

      {/* Central Royal Stage */}
      <div className="royal-opening-stage">
        {/* Emblem Wrapper */}
        <div className="royal-emblem-wrap">
          {/* Ambient Pulse Aura Rings */}
          <div className="royal-pulse-ring" />
          <div className="royal-pulse-ring" />

          {/* Rotating Mandala Filigree SVG Ring */}
          <svg
            className="royal-mandala-ring"
            viewBox="0 0 140 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="70"
              cy="70"
              r="67"
              stroke="#E6C77B"
              strokeWidth="1.2"
              strokeDasharray="4 6"
              opacity="0.6"
            />
            <circle
              cx="70"
              cy="70"
              r="58"
              stroke="#F5D477"
              strokeWidth="0.8"
              opacity="0.4"
            />
            {/* 12 Celestial Golden Dots */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30 * Math.PI) / 180;
              const x = 70 + 67 * Math.cos(angle);
              const y = 70 + 67 * Math.sin(angle);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="2"
                  fill="#F5D477"
                  opacity="0.85"
                />
              );
            })}
          </svg>

          {/* Imperial Crown At Crest */}
          <div className="royal-crown-crest">
            <Crown size={28} />
          </div>

          {/* Core Emblem: Royal Paan Leaf on Brass Platter */}
          <div className="royal-emblem-core">
            <svg
              className="royal-leaf-svg"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="leafGrad" x1="10%" y1="0%" x2="90%" y2="100%">
                  <stop offset="0%" stopColor="#4ADE80" />
                  <stop offset="45%" stopColor="#247A45" />
                  <stop offset="100%" stopColor="#0E3D1E" />
                </linearGradient>
                <linearGradient id="goldVein" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF2B2" />
                  <stop offset="50%" stopColor="#E6C77B" />
                  <stop offset="100%" stopColor="#CFA848" />
                </linearGradient>
              </defs>

              {/* Heart/Betel Leaf Contour */}
              <path
                d="M50 88 C32 72 16 52 16 34 C16 18 30 12 44 20 C48 22 50 25 50 25 C50 25 52 22 56 20 C70 12 84 18 84 34 C84 52 68 72 50 88 Z"
                fill="url(#leafGrad)"
                stroke="#E6C77B"
                strokeWidth="2.2"
              />

              {/* Central Midrib Gold Vein */}
              <path
                className="royal-leaf-vein"
                d="M50 25 L50 86"
                stroke="url(#goldVein)"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Side Veins */}
              <path
                className="royal-leaf-vein"
                d="M50 40 Q32 36 24 45 M50 52 Q30 50 23 60 M50 64 Q34 65 30 73"
                stroke="url(#goldVein)"
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.8"
              />
              <path
                className="royal-leaf-vein"
                d="M50 40 Q68 36 76 45 M50 52 Q70 50 77 60 M50 64 Q66 65 70 73"
                stroke="url(#goldVein)"
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.8"
              />
            </svg>
          </div>
        </div>

        {/* Micro Heritage Header */}
        <div className="royal-opening-tag">
          <Sparkles size={13} style={{ color: '#F5D477' }} />
          <span>ESTD. BANARAS • ROYAL HERITAGE</span>
          <Sparkles size={13} style={{ color: '#F5D477' }} />
        </div>

        {/* Grand Brand Typography with Gold Foil Shimmer */}
        <h1 className="royal-opening-title">NEW RATNA</h1>

        {/* Subtitle with Filigree Divider */}
        <div className="royal-opening-sub">
          <span className="royal-fleuron-line" />
          <span>Luxury Paan & Confectionery</span>
          <span className="royal-fleuron-line" />
        </div>

        {/* Sensory Badges */}
        <div className="royal-sensory-badges">
          <div className="royal-sensory-pill">
            <span>🌿</span> Fresh Betel Leaves
          </div>
          <div className="royal-sensory-pill">
            <span>👑</span> Pure Silver Vark
          </div>
          <div className="royal-sensory-pill">
            <span>🌹</span> Shahi Gulkand
          </div>
          <div className="royal-sensory-pill">
            <span>⚡</span> Quick Counter Pickup
          </div>
        </div>

        {/* Slender Gold Progress Tracker */}
        <div className="royal-opening-footer">
          <div className="royal-progress-track">
            <div
              className="royal-progress-bar"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <div className="royal-status-ticker">
            {STATUS_MESSAGES[statusIndex]}
          </div>
        </div>
      </div>
    </div>
  );
};
