import React, { useEffect, useRef } from 'react';

/**
 * HeroGoldenParticles
 * Ultra-luxury canvas-based particle system for the Royal Pan Shop hero.
 * Features:
 * - Glowing gold specks drifting along subtle curved orbital paths around the royal paan
 * - Sparkling 4-point diamond stars that twinkle and rotate slowly
 * - Delicate Kashmiri Damask rose petals (pure Gulkand essence) gently floating down
 * - High performance 60fps requestAnimationFrame loop
 * - Automatic reduction on mobile devices and respects prefers-reduced-motion
 */
export const HeroGoldenParticles = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = 0;
    let height = 0;
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 12 : 28;

    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Focal center (around the royal paan product on the right side)
    const getPaanCenter = () => ({
      x: isMobile ? width * 0.5 : width * 0.72,
      y: isMobile ? height * 0.65 : height * 0.5
    });

    // Particle pool
    const particles = [];
    const petalCount = isMobile ? 2 : 5;
    const starCount = isMobile ? 3 : 7;

    for (let i = 0; i < particleCount; i++) {
      let type = 'gold-orb';
      if (i < petalCount) {
        type = 'rose-petal';
      } else if (i < petalCount + starCount) {
        type = 'sparkle-star';
      }

      const center = getPaanCenter();
      const radius = 60 + Math.random() * (isMobile ? 180 : 340);
      const angle = Math.random() * Math.PI * 2;

      particles.push({
        id: i,
        type,
        // Orbital parameters for gold specks and stars
        radius,
        baseRadius: radius,
        angle,
        angularSpeed: (0.0015 + Math.random() * 0.003) * (Math.random() > 0.5 ? 1 : -1),
        radialOscillation: 0.002 + Math.random() * 0.003,
        radialAmp: 15 + Math.random() * 25,
        // General position (for petals falling down)
        x: center.x + Math.cos(angle) * radius,
        y: center.y + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 0.3,
        vy: type === 'rose-petal' ? 0.35 + Math.random() * 0.45 : 0,
        size: type === 'rose-petal' ? 9 + Math.random() * 6 : type === 'sparkle-star' ? 4 + Math.random() * 5 : 1.5 + Math.random() * 3,
        alpha: 0.25 + Math.random() * 0.65,
        twinkleSpeed: 0.02 + Math.random() * 0.04,
        twinklePhase: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.015 + Math.random() * 0.02
      });
    }

    // Draw 4-point diamond star
    const drawStar = (x, y, radius, alpha, rot) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.beginPath();
      const spikes = 4;
      const innerRadius = radius * 0.22;
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? radius : innerRadius;
        const currAngle = (i * Math.PI) / spikes;
        const px = Math.cos(currAngle) * r;
        const py = Math.sin(currAngle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();

      // Radiant gold glow
      ctx.fillStyle = `rgba(245, 212, 119, ${alpha})`;
      ctx.shadowColor = 'rgba(245, 212, 119, 0.9)';
      ctx.shadowBlur = radius * 1.8;
      ctx.fill();

      // Bright white core
      ctx.beginPath();
      ctx.arc(0, 0, innerRadius * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, alpha * 1.3)})`;
      ctx.fill();
      ctx.restore();
    };

    // Draw Damask Rose Petal
    const drawPetal = (x, y, size, alpha, rot, wobble) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot + Math.sin(wobble) * 0.35);

      // Organic curved petal path
      ctx.beginPath();
      const w = size * 0.75;
      const h = size * 1.25;
      ctx.moveTo(0, -h * 0.5);
      ctx.bezierCurveTo(w, -h * 0.4, w * 0.9, h * 0.4, 0, h * 0.5);
      ctx.bezierCurveTo(-w * 0.9, h * 0.4, -w, -h * 0.4, 0, -h * 0.5);

      // Rich Crimson / Gulkand Damask Rose Gradient
      const grad = ctx.createLinearGradient(0, -h * 0.5, 0, h * 0.5);
      grad.addColorStop(0, `rgba(251, 113, 133, ${alpha * 0.85})`);
      grad.addColorStop(0.5, `rgba(225, 29, 72, ${alpha * 0.75})`);
      grad.addColorStop(1, `rgba(159, 18, 57, ${alpha * 0.9})`);

      ctx.fillStyle = grad;
      ctx.shadowColor = 'rgba(159, 18, 57, 0.35)';
      ctx.shadowBlur = 8;
      ctx.fill();

      // Delicate petal vein highlight
      ctx.beginPath();
      ctx.moveTo(0, -h * 0.35);
      ctx.quadraticCurveTo(w * 0.15, 0, 0, h * 0.35);
      ctx.strokeStyle = `rgba(255, 228, 230, ${alpha * 0.35})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.restore();
    };

    // Draw glowing gold orb
    const drawGoldOrb = (x, y, size, alpha) => {
      ctx.save();
      const radGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 2.5);
      radGrad.addColorStop(0, `rgba(255, 255, 255, ${Math.min(1, alpha * 1.4)})`);
      radGrad.addColorStop(0.25, `rgba(245, 212, 119, ${alpha})`);
      radGrad.addColorStop(0.65, `rgba(217, 174, 78, ${alpha * 0.45})`);
      radGrad.addColorStop(1, 'rgba(217, 174, 78, 0)');

      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(x, y, size * 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.016;

      const center = getPaanCenter();

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (p.type === 'rose-petal') {
          // Petals drift downwards with soft sway
          if (!prefersReducedMotion) {
            p.y += p.vy;
            p.x += Math.sin(time * 1.5 + p.wobble) * 0.75 + p.vx;
            p.wobble += p.wobbleSpeed;
            p.rotation += p.rotSpeed;

            // Reset when leaving bottom or side
            if (p.y > height + 40 || p.x < -40 || p.x > width + 40) {
              p.y = -30;
              p.x = center.x + (Math.random() - 0.5) * (isMobile ? width * 0.8 : 450);
              p.vy = 0.35 + Math.random() * 0.45;
            }
          }

          drawPetal(p.x, p.y, p.size, p.alpha, p.rotation, p.wobble);
        } else {
          // Gold specks and sparkle stars orbit in smooth curved paths
          if (!prefersReducedMotion) {
            p.angle += p.angularSpeed;
            p.twinklePhase += p.twinkleSpeed;
            p.rotation += p.rotSpeed;
          }

          // Oscillate radius for organic elliptical curves
          const currentRadius = p.baseRadius + Math.sin(time * 0.8 + p.id) * p.radialAmp;
          const px = center.x + Math.cos(p.angle) * currentRadius * 1.25;
          const py = center.y + Math.sin(p.angle) * currentRadius * 0.75; // Elliptical 3D tilt

          const currentAlpha = Math.max(0.12, Math.min(0.95, p.alpha + Math.sin(p.twinklePhase) * 0.35));

          if (p.type === 'sparkle-star') {
            drawStar(px, py, p.size, currentAlpha, p.rotation);
          } else {
            drawGoldOrb(px, py, p.size, currentAlpha);
          }
        }
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    // Initial render
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hero-golden-particles-canvas"
      aria-hidden="true"
    />
  );
};
