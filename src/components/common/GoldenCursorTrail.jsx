import React, { useEffect, useRef } from 'react';

/**
 * GoldenCursorTrail
 * High-performance, luxury ambient cursor trail for the New Ratna Pan Shop digital experience.
 * Emits subtle champagne-gold sparkles, stardust, and emerald botanic micro-glimmer as the user
 * explores the website, with a sparkling burst on clicks.
 * 
 * - Only active on precision pointers (pointer: fine) to keep mobile touch scroll 100% native.
 * - Automatically throttles and sleeps when the mouse stops moving (0 CPU waste).
 * - Respects prefers-reduced-motion.
 */
export const GoldenCursorTrail = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Only run on non-touch devices with fine pointers and no reduced-motion preference
    if (typeof window === 'undefined') return;
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isFinePointer || prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = null;
    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    const particles = [];
    let lastX = -100;
    let lastY = -100;
    let isMoving = false;
    let idleTimer = null;

    const spawnParticle = (x, y, count = 1, isBurst = false) => {
      for (let i = 0; i < count; i++) {
        if (particles.length > 60) particles.shift(); // Hard cap for optimal 60fps

        const angle = isBurst ? (i / count) * Math.PI * 2 + Math.random() * 0.4 : Math.random() * Math.PI * 2;
        const speed = isBurst ? 1.8 + Math.random() * 2.5 : 0.3 + Math.random() * 0.8;
        const type = Math.random() < 0.65 ? 'gold-star' : Math.random() < 0.85 ? 'emerald-dust' : 'gold-orb';

        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (isBurst ? 0 : 0.4), // Gentle upward drift
          size: type === 'gold-star' ? (isBurst ? 4.5 + Math.random() * 3.5 : 3 + Math.random() * 2.5) : 1.5 + Math.random() * 2,
          type,
          alpha: isBurst ? 0.95 : 0.75 + Math.random() * 0.25,
          decay: isBurst ? 0.035 + Math.random() * 0.02 : 0.028 + Math.random() * 0.02,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.08
        });
      }
    };

    const handleMouseMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      const dist = Math.hypot(x - lastX, y - lastY);

      if (dist > 18) {
        spawnParticle(x, y, 1, false);
        lastX = x;
        lastY = y;
      }

      isMoving = true;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        isMoving = false;
      }, 150);

      if (!animId) {
        animId = requestAnimationFrame(loop);
      }
    };

    const handleClick = (e) => {
      spawnParticle(e.clientX, e.clientY, 7, true);
      if (!animId) {
        animId = requestAnimationFrame(loop);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });

    // 4-point diamond star renderer
    const drawStar = (x, y, radius, alpha, rot) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        ctx.lineTo(Math.cos((i * Math.PI) / 2) * radius, Math.sin((i * Math.PI) / 2) * radius);
        ctx.lineTo(Math.cos((i * Math.PI) / 2 + Math.PI / 4) * (radius * 0.22), Math.sin((i * Math.PI) / 2 + Math.PI / 4) * (radius * 0.22));
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(230, 199, 123, ${alpha})`;
      ctx.shadowColor = 'rgba(230, 199, 123, 0.8)';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.restore();
    };

    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.alpha -= p.decay;

        if (p.alpha <= 0.02) {
          particles.splice(i, 1);
          continue;
        }

        if (p.type === 'gold-star') {
          drawStar(p.x, p.y, p.size, p.alpha, p.rotation);
        } else if (p.type === 'emerald-dust') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(74, 222, 128, ${p.alpha * 0.75})`;
          ctx.shadowColor = 'rgba(34, 197, 94, 0.6)';
          ctx.shadowBlur = 4;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 245, 208, ${p.alpha * 0.85})`;
          ctx.shadowColor = 'rgba(230, 199, 123, 0.9)';
          ctx.shadowBlur = 5;
          ctx.fill();
        }
      }

      // If particles remain or mouse is moving, continue loop; otherwise sleep
      if (particles.length > 0 || isMoving) {
        animId = requestAnimationFrame(loop);
      } else {
        animId = null;
      }
    };

    // Kick off initial frame
    animId = requestAnimationFrame(loop);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      clearTimeout(idleTimer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
        userSelect: 'none'
      }}
      aria-hidden="true"
    />
  );
};
