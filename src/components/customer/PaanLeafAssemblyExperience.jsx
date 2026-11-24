import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Sparkles, Play, RotateCcw, Eye, Compass, Leaf } from 'lucide-react';

/**
 * NEW RATNA PAN SHOP — SIGNATURE PAAN LEAF PARTICLE ASSEMBLY
 * 
 * An original, high-performance scroll-driven particle animation.
 * Features 300+ miniature Indian betel leaves (heart-shaped cordate silhouette,
 * sharp apex tip, midrib & lateral veins, emerald gradients, specular highlight)
 * and champagne-gold sparkles choreographed across 5 distinct phases:
 * 
 * - Phase 1: Particle Introduction (Inflow from viewport edges with flutter)
 * - Phase 2: Swirling Motion (Golden spiral vortex with 3D depth)
 * - Phase 3: Particle Assembly (Organic convergence into a royal wreath/crest)
 * - Phase 4: Section Reveal (Coordinated unveiling of HTML header, cards, photo)
 * - Phase 5: Final State (Cluster dissolves into ambient mist, 100% interactive)
 */
export const PaanLeafAssemblyExperience = ({ children, onProgressChange }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const spritesRef = useRef([]);

  // Scroll tracking and smooth interpolation (lerp)
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const isAutoPlayingRef = useRef(false);
  const autoPlayStartRef = useRef(0);
  const isVisibleRef = useRef(true);

  // UI state for floating control pill
  const [activePhase, setActivePhase] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);

  // --------------------------------------------------------------------------
  // 1. PRE-RENDER BOTANICAL BETEL LEAF & GOLD SPARKLE CANVAS SPRITES
  // --------------------------------------------------------------------------
  const initSprites = useCallback(() => {
    if (typeof window === 'undefined') return;
    const sprites = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // 4 Botanical Betel Leaf Color Nuances:
    const colorProfiles = [
      {
        name: 'banarasi-emerald',
        tip: '#34A853',
        body: '#247A45',
        base: '#144A27',
        vein: '#1B5E34',
        stem: '#194D2B',
        goldVein: false
      },
      {
        name: 'maghai-forest',
        tip: '#2ECC71',
        body: '#1E6639',
        base: '#0F3B1E',
        vein: '#14532D',
        stem: '#0D331A',
        goldVein: false
      },
      {
        name: 'fresh-calcutta',
        tip: '#4ADE80',
        body: '#22C55E',
        base: '#15803D',
        vein: '#166534',
        stem: '#14532D',
        goldVein: false
      },
      {
        name: 'royal-gold-veined',
        tip: '#38B264',
        body: '#247A45',
        base: '#144A27',
        vein: '#E6C77B', // Antique Champagne Gold veining!
        stem: '#B88E35',
        goldVein: true
      }
    ];

    // Scales: Small (16x22), Medium (26x36), Large (38x52)
    const sizes = [18, 28, 42];
    const curls = [-0.15, 0, 0.15]; // left curl, straight, right curl

    // Generate betel leaf sprites
    colorProfiles.forEach((profile) => {
      sizes.forEach((size) => {
        curls.forEach((curl) => {
          const w = Math.ceil(size * 1.5 * dpr);
          const h = Math.ceil(size * 1.8 * dpr);
          const offCanvas = document.createElement('canvas');
          offCanvas.width = w;
          offCanvas.height = h;
          const ctx = offCanvas.getContext('2d');
          ctx.scale(dpr, dpr);

          const cx = (w / dpr) / 2;
          const cy = (h / dpr) / 2;

          ctx.save();
          ctx.translate(cx, cy);

          // Draw Botanical Betel Leaf Path
          ctx.beginPath();
          // Stem base at (0, size * 0.45)
          ctx.moveTo(0, size * 0.45);

          // Left cordate lobe
          ctx.bezierCurveTo(
            -size * 0.42, size * 0.48,
            -size * 0.55, size * 0.15,
            -size * 0.5, -size * 0.08
          );
          // Left shoulder to sharp tip
          ctx.bezierCurveTo(
            -size * 0.45, -size * 0.32,
            -size * 0.18 + curl * size * 0.2, -size * 0.48,
            curl * size * 0.25, -size * 0.58
          );
          // Right shoulder from sharp tip
          ctx.bezierCurveTo(
            size * 0.18 + curl * size * 0.2, -size * 0.48,
            size * 0.45, -size * 0.32,
            size * 0.5, -size * 0.08
          );
          // Right cordate lobe back to stem base
          ctx.bezierCurveTo(
            size * 0.55, size * 0.15,
            size * 0.42, size * 0.48,
            0, size * 0.45
          );
          ctx.closePath();

          // Botanical gradient fill
          const grad = ctx.createLinearGradient(-size * 0.2, -size * 0.5, size * 0.2, size * 0.5);
          grad.addColorStop(0, profile.tip);
          grad.addColorStop(0.45, profile.body);
          grad.addColorStop(1, profile.base);
          ctx.fillStyle = grad;
          ctx.fill();

          // Soft specular highlight on left lobe (Apple-style subtle sheen)
          ctx.save();
          ctx.clip();
          const sheen = ctx.createLinearGradient(-size * 0.35, -size * 0.25, 0, 0);
          sheen.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
          sheen.addColorStop(0.6, profile.goldVein ? 'rgba(230, 199, 123, 0.25)' : 'rgba(255, 255, 255, 0.08)');
          sheen.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = sheen;
          ctx.beginPath();
          ctx.ellipse(-size * 0.18, -size * 0.08, size * 0.22, size * 0.32, -0.28, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Primary Midrib Vein
          ctx.beginPath();
          ctx.moveTo(0, size * 0.45);
          ctx.quadraticCurveTo(curl * size * 0.1, -size * 0.1, curl * size * 0.25, -size * 0.58);
          ctx.lineWidth = Math.max(0.8, size * 0.038);
          ctx.strokeStyle = profile.vein;
          ctx.stroke();

          // Secondary Lateral Veins (3 pairs curving outwards)
          const veinCount = 3;
          ctx.lineWidth = Math.max(0.55, size * 0.022);
          ctx.strokeStyle = profile.goldVein ? 'rgba(230, 199, 123, 0.75)' : profile.vein;
          for (let i = 1; i <= veinCount; i++) {
            const frac = i / (veinCount + 1);
            const yMid = size * 0.45 - frac * size * 0.95;
            // Left branch
            ctx.beginPath();
            ctx.moveTo(0, yMid);
            ctx.quadraticCurveTo(-size * 0.2, yMid - size * 0.06, -size * 0.42 * (1 - frac * 0.45), yMid - size * 0.14);
            ctx.stroke();
            // Right branch
            ctx.beginPath();
            ctx.moveTo(0, yMid);
            ctx.quadraticCurveTo(size * 0.2, yMid - size * 0.06, size * 0.42 * (1 - frac * 0.45), yMid - size * 0.14);
            ctx.stroke();
          }

          // Petiole (stem at base)
          ctx.beginPath();
          ctx.moveTo(0, size * 0.45);
          ctx.lineTo(0, size * 0.54);
          ctx.lineWidth = Math.max(1, size * 0.045);
          ctx.strokeStyle = profile.stem;
          ctx.stroke();

          ctx.restore();

          sprites.push({
            type: 'leaf',
            canvas: offCanvas,
            w: w / dpr,
            h: h / dpr,
            size,
            goldVein: profile.goldVein
          });
        });
      });
    });

    // Generate Champagne Gold Sparkle Sprites (3 sizes: 12, 18, 26)
    [12, 18, 26].forEach((starSize) => {
      const w = Math.ceil(starSize * 2.2 * dpr);
      const h = Math.ceil(starSize * 2.2 * dpr);
      const offCanvas = document.createElement('canvas');
      offCanvas.width = w;
      offCanvas.height = h;
      const ctx = offCanvas.getContext('2d');
      ctx.scale(dpr, dpr);

      const cx = (w / dpr) / 2;
      const cy = (h / dpr) / 2;

      // Soft radial glow
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, starSize);
      halo.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      halo.addColorStop(0.25, 'rgba(230, 199, 123, 0.7)');
      halo.addColorStop(0.65, 'rgba(217, 174, 78, 0.25)');
      halo.addColorStop(1, 'rgba(217, 174, 78, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, starSize, 0, Math.PI * 2);
      ctx.fill();

      // 4-pointed diamond star
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(cx, cy - starSize * 0.85);
      ctx.quadraticCurveTo(cx, cy, cx + starSize * 0.85, cy);
      ctx.quadraticCurveTo(cx, cy, cx, cy + starSize * 0.85);
      ctx.quadraticCurveTo(cx, cy, cx - starSize * 0.85, cy);
      ctx.quadraticCurveTo(cx, cy, cx, cy - starSize * 0.85);
      ctx.fill();

      sprites.push({
        type: 'sparkle',
        canvas: offCanvas,
        w: w / dpr,
        h: h / dpr,
        size: starSize
      });
    });

    spritesRef.current = sprites;
  }, []);

  // --------------------------------------------------------------------------
  // 2. GENERATE PARTICLE ARRAY (300 BETEL LEAVES + 80 GOLD SPARKLES)
  // --------------------------------------------------------------------------
  const particles = useMemo(() => {
    const list = [];
    const LEAF_COUNT = 300;
    const SPARKLE_COUNT = 80;

    // Betel Leaves
    for (let i = 0; i < LEAF_COUNT; i++) {
      const seed = (i * 137.5) % 1;
      const seed2 = (i * 224.7) % 1;
      const seed3 = (i * 359.1) % 1;

      // Determine edge entry side (0: top, 1: right, 2: bottom, 3: left)
      const edgeSide = i % 4;
      let sx = 0;
      let sy = 0;
      if (edgeSide === 0) {
        sx = seed * 1.2 - 0.1;
        sy = -0.15 - seed2 * 0.2;
      } else if (edgeSide === 1) {
        sx = 1.15 + seed2 * 0.2;
        sy = seed * 1.2 - 0.1;
      } else if (edgeSide === 2) {
        sx = seed * 1.2 - 0.1;
        sy = 1.15 + seed2 * 0.2;
      } else {
        sx = -0.15 - seed2 * 0.2;
        sy = seed * 1.2 - 0.1;
      }

      // Spiral parameters for Phase 2
      const spiralAngle0 = (i / LEAF_COUNT) * Math.PI * 8 + seed2 * Math.PI;
      const spiralDirection = i % 2 === 0 ? 1 : -1;
      const spiralRadiusBase = 0.25 + seed * 0.45;

      // Assembly target (Phase 3): Royal Elliptical Garland / Crest
      const targetAngle = (i / LEAF_COUNT) * Math.PI * 2;
      const targetRadiusX = 0.28 + (seed - 0.5) * 0.08;
      const targetRadiusY = 0.22 + (seed2 - 0.5) * 0.06;

      // Depth perspective: 0.4 (background, small) to 1.35 (foreground, large)
      const depth = 0.45 + seed3 * 0.85;

      // Dissolve dispersal vector for Phase 5
      const scatterAngle = targetAngle + (seed - 0.5) * 1.2;
      const scatterDist = 0.4 + seed2 * 0.6;

      list.push({
        id: `leaf-${i}`,
        type: 'leaf',
        spriteIndex: i, // mapped modulo leaf sprites
        depth,
        baseScale: 0.55 + depth * 0.65,
        baseAlpha: 0.35 + depth * 0.65,
        // Trajectory waypoints (normalized 0 to 1 relative to container)
        sx,
        sy,
        spiralAngle0,
        spiralDirection,
        spiralRadiusBase,
        targetAngle,
        targetRadiusX,
        targetRadiusY,
        scatterAngle,
        scatterDist,
        flutterFreq: 2 + seed * 3,
        flutterPhase: seed2 * Math.PI * 2,
        rotSpeed: (seed - 0.5) * 0.08,
        baseRot: seed3 * Math.PI * 2
      });
    }

    // Champagne Gold Sparkles
    for (let j = 0; j < SPARKLE_COUNT; j++) {
      const s1 = (j * 179.3) % 1;
      const s2 = (j * 283.1) % 1;
      const s3 = (j * 419.7) % 1;
      const edgeSide = j % 4;

      let sx = 0;
      let sy = 0;
      if (edgeSide === 0) {
        sx = s1;
        sy = -0.1 - s2 * 0.15;
      } else if (edgeSide === 1) {
        sx = 1.1 + s2 * 0.15;
        sy = s1;
      } else if (edgeSide === 2) {
        sx = s1;
        sy = 1.1 + s2 * 0.15;
      } else {
        sx = -0.1 - s2 * 0.15;
        sy = s1;
      }

      list.push({
        id: `sparkle-${j}`,
        type: 'sparkle',
        spriteIndex: j,
        depth: 0.6 + s3 * 0.7,
        baseScale: 0.6 + s2 * 0.6,
        baseAlpha: 0.5 + s1 * 0.5,
        sx,
        sy,
        spiralAngle0: (j / SPARKLE_COUNT) * Math.PI * 6 + s2 * Math.PI,
        spiralDirection: j % 2 === 0 ? 1 : -1,
        spiralRadiusBase: 0.15 + s1 * 0.5,
        targetAngle: (j / SPARKLE_COUNT) * Math.PI * 2,
        targetRadiusX: 0.22 + s2 * 0.12,
        targetRadiusY: 0.16 + s3 * 0.1,
        scatterAngle: s1 * Math.PI * 2,
        scatterDist: 0.3 + s2 * 0.5,
        flutterFreq: 3 + s1 * 4,
        flutterPhase: s2 * Math.PI * 2,
        rotSpeed: (s1 - 0.5) * 0.15,
        baseRot: s3 * Math.PI * 2
      });
    }

    return list;
  }, []);

  // --------------------------------------------------------------------------
  // 3. SCROLL TRACKING & NATURAL BROWSER SCROLL INTEGRATION
  // --------------------------------------------------------------------------
  useEffect(() => {
    initSprites();

    const handleScroll = () => {
      if (isAutoPlayingRef.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const windowH = window.innerHeight;

      // Active zone: from when container top enters lower viewport until it passes header
      const totalDist = rect.height + windowH * 0.5;
      const currentScroll = windowH - rect.top;
      const rawProgress = Math.max(0, Math.min(1, currentScroll / totalDist));

      targetProgressRef.current = rawProgress;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Intersection observer to sleep when scrolled out of view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          isVisibleRef.current = e.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [initSprites]);

  // --------------------------------------------------------------------------
  // 4. ANIMATION LOOP WITH 5-PHASE CHOREOGRAPHY & BUTTER-SMOOTH LERP
  // --------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let lastTime = performance.now();

    const resizeCanvas = () => {
      if (!canvas || !containerRef.current) return;
      const width = containerRef.current.offsetWidth || window.innerWidth;
      const height = containerRef.current.offsetHeight || window.innerHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = (now) => {
      animFrameRef.current = requestAnimationFrame(render);

      // Handle AutoPlay Cinematic Demo
      if (isAutoPlayingRef.current) {
        const elapsed = (now - autoPlayStartRef.current) / 4200; // 4.2s luxury sweep
        if (elapsed >= 1) {
          targetProgressRef.current = 1;
          isAutoPlayingRef.current = false;
          setIsPlaying(false);
        } else {
          // Smooth sinusoidal ease
          targetProgressRef.current = 0.5 - 0.5 * Math.cos(elapsed * Math.PI);
        }
      }

      // Smooth damped lerp interpolation (eliminates jitter and sudden jumps)
      const lerpFactor = 0.082;
      currentProgressRef.current += (targetProgressRef.current - currentProgressRef.current) * lerpFactor;
      const p = currentProgressRef.current;

      // Update state for UI progress badge (throttled)
      if (Math.abs(p - displayProgress) > 0.015) {
        setDisplayProgress(p);
        const phaseNum = p < 0.28 ? 1 : p < 0.60 ? 2 : p < 0.82 ? 3 : p < 0.94 ? 4 : 5;
        setActivePhase(phaseNum);
        if (onProgressChange) onProgressChange(p, phaseNum);
      }

      // Skip rendering if offscreen and settled
      if (!isVisibleRef.current && (p < 0.01 || p > 0.99)) return;

      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      const cx = width * 0.5;
      const cy = height * 0.42; // Center of assembly slightly above midpoint

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const leafSprites = spritesRef.current.filter((s) => s.type === 'leaf');
      const sparkleSprites = spritesRef.current.filter((s) => s.type === 'sparkle');
      if (leafSprites.length === 0) {
        ctx.restore();
        return;
      }

      // Global phase timeline:
      // p in [0.00, 0.28] => Phase 1: Inflow from edges
      // p in [0.25, 0.60] => Phase 2: Swirling vortex
      // p in [0.55, 0.82] => Phase 3: Assembly onto target wreath
      // p in [0.75, 0.94] => Phase 4: Section Reveal
      // p in [0.92, 1.00] => Phase 5: Final state & ambient dissipation

      particles.forEach((pt) => {
        let x = 0;
        let y = 0;
        let rot = pt.baseRot;
        let scale = pt.baseScale;
        let alpha = pt.baseAlpha;

        // Position coordinates across the 5 phases
        if (p < 0.28) {
          // PHASE 1: Introduction from edges
          const t1 = Math.max(0, p / 0.28);
          // Ease-out entry
          const ease1 = Math.sin((t1 * Math.PI) / 2);

          const startX = pt.sx * width;
          const startY = pt.sy * height;
          // Intermediate waypoint towards center
          const midX = cx + (startX - cx) * 0.4;
          const midY = cy + (startY - cy) * 0.4;

          const flutterX = Math.sin(t1 * pt.flutterFreq * 4 + pt.flutterPhase) * 22;
          const flutterY = Math.cos(t1 * pt.flutterFreq * 3 + pt.flutterPhase) * 16;

          x = startX + (midX - startX) * ease1 + flutterX;
          y = startY + (midY - startY) * ease1 + flutterY;
          rot = pt.baseRot + t1 * pt.rotSpeed * 10 + flutterX * 0.02;
          alpha = Math.min(1, t1 * 1.5) * pt.baseAlpha;
        } else if (p < 0.60) {
          // PHASE 2: Swirling spiral vortex with 3D depth
          const t2 = (p - 0.28) / 0.32;
          const spiralRadius = Math.max(
            width * 0.15,
            width * pt.spiralRadiusBase * (1 - t2 * 0.55)
          );
          const currentAngle = pt.spiralAngle0 + pt.spiralDirection * t2 * Math.PI * 3.8;

          const flutter = Math.sin(t2 * pt.flutterFreq * 6 + pt.flutterPhase) * 12;

          x = cx + Math.cos(currentAngle) * spiralRadius + flutter;
          y = cy + Math.sin(currentAngle) * (spiralRadius * 0.62) + flutter * 0.5;

          // Depth parallax scaling
          const depthFactor = 0.7 + 0.6 * Math.sin(currentAngle);
          scale = pt.baseScale * depthFactor;
          rot = currentAngle + Math.PI / 2 + pt.baseRot * 0.2;
          alpha = pt.baseAlpha * Math.min(1, 0.4 + depthFactor * 0.6);
        } else if (p < 0.82) {
          // PHASE 3: Particle Assembly into defined target garland / wreath
          const t3 = (p - 0.60) / 0.22;
          // Decelerate organically like flock of birds
          const ease3 = 1 - Math.pow(1 - t3, 3);

          // Phase 2 ending point
          const endSpiralR = width * pt.spiralRadiusBase * 0.45;
          const endSpiralAngle = pt.spiralAngle0 + pt.spiralDirection * Math.PI * 3.8;
          const prevX = cx + Math.cos(endSpiralAngle) * endSpiralR;
          const prevY = cy + Math.sin(endSpiralAngle) * (endSpiralR * 0.62);

          // Target configuration
          const targetX = cx + Math.cos(pt.targetAngle) * (width * pt.targetRadiusX);
          const targetY = cy + Math.sin(pt.targetAngle) * (height * pt.targetRadiusY);

          x = prevX + (targetX - prevX) * ease3;
          y = prevY + (targetY - prevY) * ease3;
          rot = pt.targetAngle + Math.PI / 2 + (1 - ease3) * 0.5;
          alpha = pt.baseAlpha;
        } else if (p < 0.94) {
          // PHASE 4: Section Reveal
          const t4 = (p - 0.82) / 0.12;

          const targetX = cx + Math.cos(pt.targetAngle) * (width * pt.targetRadiusX);
          const targetY = cy + Math.sin(pt.targetAngle) * (height * pt.targetRadiusY);

          // Gentle breathing float on assembled positions
          const breath = Math.sin(now * 0.002 + pt.flutterPhase) * 6;
          x = targetX + Math.cos(pt.targetAngle) * breath;
          y = targetY + Math.sin(pt.targetAngle) * breath;
          rot = pt.targetAngle + Math.PI / 2 + breath * 0.02;

          // Sparkles start gently fading away in phase 4
          if (pt.type === 'sparkle') {
            alpha = pt.baseAlpha * (1 - t4 * 0.85);
          } else {
            alpha = pt.baseAlpha;
          }
        } else {
          // PHASE 5: Final state — cluster dissolves into ambient drift, fading out
          const t5 = Math.min(1, (p - 0.94) / 0.06);

          const targetX = cx + Math.cos(pt.targetAngle) * (width * pt.targetRadiusX);
          const targetY = cy + Math.sin(pt.targetAngle) * (height * pt.targetRadiusY);

          // Disperse outwards gently
          const scatterX = targetX + Math.cos(pt.scatterAngle) * (width * pt.scatterDist * t5);
          const scatterY = targetY + Math.sin(pt.scatterAngle) * (height * pt.scatterDist * t5);

          x = scatterX;
          y = scatterY;
          rot = pt.baseRot + t5 * 1.5;

          // Fade out to leave section pristine & usable
          alpha = Math.max(0, pt.baseAlpha * (1 - t5 * 0.92));
        }

        // Draw the Sprite
        if (alpha > 0.02) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
          ctx.translate(x, y);
          ctx.rotate(rot);
          ctx.scale(scale, scale);

          if (pt.type === 'leaf') {
            const spr = leafSprites[pt.spriteIndex % leafSprites.length];
            ctx.drawImage(spr.canvas, -spr.w / 2, -spr.h / 2, spr.w, spr.h);
          } else {
            const spr = sparkleSprites[pt.spriteIndex % sparkleSprites.length];
            ctx.drawImage(spr.canvas, -spr.w / 2, -spr.h / 2, spr.w, spr.h);
          }

          ctx.restore();
        }
      });

      ctx.restore();
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [particles, onProgressChange, displayProgress]);

  // --------------------------------------------------------------------------
  // 5. INTERACTIVE CONTROL ACTIONS (PLAY CINEMATIC & REPLAY)
  // --------------------------------------------------------------------------
  const handlePlayCinematic = () => {
    isAutoPlayingRef.current = true;
    autoPlayStartRef.current = performance.now();
    setIsPlaying(true);
  };

  const handleReset = () => {
    isAutoPlayingRef.current = false;
    targetProgressRef.current = 0;
    setIsPlaying(false);
  };

  const phaseNames = [
    'Particle Introduction',
    'Swirling Spiral Vortex',
    'Particle Assembly',
    'Section Reveal',
    'Final Royal State'
  ];

  return (
    <div
      ref={containerRef}
      className="signature-leaf-assembly-container"
      id="signature-assembly-stage"
      aria-label="Signature Paan Leaf Particle Assembly Experience"
    >
      {/* 1. HIGH-PERFORMANCE CANVAS PARTICLE LAYER (Pointer-events: none) */}
      <canvas
        ref={canvasRef}
        className="signature-leaf-canvas"
        aria-hidden="true"
      />

      {/* 2. REVEALED CONTENT (Phase 4 & 5 Coordinated HTML Reveal) */}
      <div
        className={`assembly-revealed-content phase-${activePhase}`}
        style={{
          opacity: displayProgress < 0.65 ? Math.max(0.12, displayProgress * 0.5) : Math.min(1, 0.35 + (displayProgress - 0.65) * 2.8),
          transform: `translate3d(0, ${Math.max(0, (1 - displayProgress) * 36)}px, 0)`,
          transition: isAutoPlayingRef.current ? 'opacity 0.25s ease, transform 0.25s ease' : 'none'
        }}
      >
        {children}
      </div>

      {/* 3. LUXURY INTERACTIVE HUD CONTROL PILL */}
      <div className="assembly-hud-pill-wrap" aria-label="Cinematic Assembly Controls">
        <div className="assembly-hud-pill">
          <div className="hud-phase-indicator">
            <span className="hud-leaf-icon">
              <Leaf size={14} className="hud-leaf-pulse" />
            </span>
            <div className="hud-phase-meta">
              <span className="hud-phase-num">PHASE {activePhase} / 5</span>
              <span className="hud-phase-name">{phaseNames[activePhase - 1]}</span>
            </div>
          </div>

          {/* Progress Bar Track */}
          <div className="hud-progress-track" title="Scroll down or play to assemble">
            <div
              className="hud-progress-fill"
              style={{ width: `${Math.round(displayProgress * 100)}%` }}
            />
          </div>

          {/* Play Cinematic & Reset Controls */}
          <div className="hud-buttons">
            <button
              type="button"
              onClick={handlePlayCinematic}
              className={`btn-hud-play ${isPlaying ? 'active' : ''}`}
              title="Play 5-Phase Leaf Assembly Animation"
              aria-label="Play Cinematic Assembly"
            >
              <Play size={12} fill="currentColor" />
              <span>{isPlaying ? 'Witnessing...' : 'Play Cinematic'}</span>
            </button>

            {displayProgress > 0.05 && (
              <button
                type="button"
                onClick={handleReset}
                className="btn-hud-reset"
                title="Reset animation to beginning"
                aria-label="Reset Leaf Assembly"
              >
                <RotateCcw size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

