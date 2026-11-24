import React, { useEffect, useRef, useState, useMemo } from 'react';
import { getPaanLeafSprites } from '../../utils/paanLeafSpriteAtlas';

/**
 * ProductParticleAssembler
 * 
 * Independent, card-by-card particle assembly for each product card:
 * 1. Detects the card's exact position on screen.
 * 2. Spawns tiny emerald betel-leaf-shaped particles and champagne gold sparkles
 *    outside and around this card's target area.
 * 3. As the user scrolls toward this specific product, its particles swirl inward
 *    along curved organic paths, assembling first around the product image,
 *    then unveiling the title, description, price, and Add to Cart button.
 * 4. Completes with the real HTML product card fully visible, crisp, and interactive.
 */
export const ProductParticleAssembler = ({ children, index = 0, isSoldOut = false }) => {
  const cardRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const isVisibleRef = useRef(false);

  const [isAssembled, setIsAssembled] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);

  // Padding margin outside the card so particles can spawn outside and swirl in
  const PADDING = 70;

  // Generate 52 independent particles tailored to this card's geometry
  const particles = useMemo(() => {
    const list = [];
    const LEAF_COUNT = 38;
    const SPARKLE_COUNT = 14;
    const seedOffset = (index * 47) % 100;

    // 1. Betel Leaf Particles
    for (let i = 0; i < LEAF_COUNT; i++) {
      const s1 = ((i + seedOffset) * 13.7) % 1;
      const s2 = ((i + seedOffset) * 29.3) % 1;
      const s3 = ((i + seedOffset) * 47.9) % 1;

      // Spawn angle & distance outside the card (60px to 140px out from image center)
      const spawnAngle = (i / LEAF_COUNT) * Math.PI * 2 + s1 * 0.5;
      const spawnDist = 110 + s2 * 70;

      // Target position on card:
      // ~70% target the image area (top half), ~30% target the card body & footer
      const isTargetingImage = i < Math.floor(LEAF_COUNT * 0.7);
      let targetNormalizedX = 0.5 + (s1 - 0.5) * 0.75;
      let targetNormalizedY = isTargetingImage
        ? 0.12 + s2 * 0.38 // Image region (0% to 50% height)
        : 0.55 + s2 * 0.40; // Body / Price / Button region (50% to 95% height)

      // Spiral vortex parameters
      const spiralDir = i % 2 === 0 ? 1 : -1;
      const spiralTurns = 1.8 + s3 * 1.4;
      const flutterFreq = 3 + s1 * 4;
      const flutterPhase = s2 * Math.PI * 2;
      const baseRot = s3 * Math.PI * 2;
      const baseScale = 0.65 + s1 * 0.55;
      const baseAlpha = 0.6 + s2 * 0.4;

      list.push({
        type: 'leaf',
        spriteIndex: i,
        spawnAngle,
        spawnDist,
        targetNormalizedX,
        targetNormalizedY,
        spiralDir,
        spiralTurns,
        flutterFreq,
        flutterPhase,
        baseRot,
        baseScale,
        baseAlpha,
        // Delay offset: image particles assemble first, body particles follow
        revealDelay: isTargetingImage ? 0 : 0.22
      });
    }

    // 2. Champagne Gold Sparkle Stars
    for (let j = 0; j < SPARKLE_COUNT; j++) {
      const s1 = ((j + seedOffset * 2) * 19.1) % 1;
      const s2 = ((j + seedOffset * 2) * 31.7) % 1;
      const s3 = ((j + seedOffset * 2) * 53.3) % 1;

      const spawnAngle = (j / SPARKLE_COUNT) * Math.PI * 2 + s1 * 0.8;
      const spawnDist = 90 + s2 * 80;
      const targetNormalizedX = 0.15 + s1 * 0.7;
      const targetNormalizedY = 0.1 + s2 * 0.8;

      list.push({
        type: 'sparkle',
        spriteIndex: j,
        spawnAngle,
        spawnDist,
        targetNormalizedX,
        targetNormalizedY,
        spiralDir: j % 2 === 0 ? 1 : -1,
        spiralTurns: 2 + s3 * 1.5,
        flutterFreq: 4 + s1 * 3,
        flutterPhase: s2 * Math.PI * 2,
        baseRot: s3 * Math.PI * 2,
        baseScale: 0.55 + s1 * 0.5,
        baseAlpha: 0.7 + s2 * 0.3,
        revealDelay: s3 * 0.15
      });
    }

    return list;
  }, [index]);

  // --------------------------------------------------------------------------
  // SCROLL OBSERVER PER CARD (Calculates exact relative progress)
  // --------------------------------------------------------------------------
  useEffect(() => {
    // Check reduced motion preference
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsAssembled(true);
      setRenderProgress(1);
      return;
    }

    const card = cardRef.current;
    if (!card) return;

    const handleScroll = () => {
      if (isAssembled || !cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const windowH = window.innerHeight;

      // Start when card top reaches 98% of viewport height (entering view)
      // Complete when card top reaches 38% of viewport height (well into center)
      const start = windowH * 0.98;
      const end = windowH * 0.38;

      let progress = (start - rect.top) / (start - end);
      progress = Math.max(0, Math.min(1, progress));

      targetProgressRef.current = progress;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    // Intersection observer to only run animation when approaching screen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          isVisibleRef.current = e.isIntersecting;
          if (e.isIntersecting) handleScroll();
        });
      },
      { rootMargin: '120px 0px 120px 0px', threshold: 0 }
    );

    observer.observe(card);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      observer.disconnect();
    };
  }, [isAssembled]);

  // --------------------------------------------------------------------------
  // CANVAS RENDERING LOOP (Particle swirl & convergence onto this specific card)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (isAssembled) return;

    const canvas = canvasRef.current;
    const card = cardRef.current;
    if (!canvas || !card) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resizeCanvas = () => {
      if (!canvas || !card) return;
      const w = card.offsetWidth + PADDING * 2;
      const h = card.offsetHeight + PADDING * 2;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
      }
    };

    resizeCanvas();

    const sprites = getPaanLeafSprites();
    let isCancelled = false;

    const render = () => {
      if (isCancelled) return;
      animFrameRef.current = requestAnimationFrame(render);

      // Smooth damped lerp interpolation
      const lerp = 0.12;
      currentProgressRef.current += (targetProgressRef.current - currentProgressRef.current) * lerp;
      const p = currentProgressRef.current;

      // Update state for DOM reveal styling (throttled)
      if (Math.abs(p - renderProgress) > 0.02) {
        setRenderProgress(p);
      }

      // Check if card has completed its assembly
      if (p >= 0.985 && targetProgressRef.current >= 0.985) {
        setIsAssembled(true);
        setRenderProgress(1);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animFrameRef.current);
        return;
      }

      // If card is not visible and progress is 0, skip canvas draw
      if (!isVisibleRef.current && p < 0.01) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      const cardW = card.offsetWidth;
      const cardH = card.offsetHeight;
      const totalW = cardW + PADDING * 2;
      const totalH = cardH + PADDING * 2;

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);

      // Image center relative to canvas coordinates (including padding)
      const imageCenterX = PADDING + cardW * 0.5;
      const imageCenterY = PADDING + Math.min(cardH * 0.35, 105);

      particles.forEach((pt) => {
        // Individual delayed progress
        const localP = Math.max(0, Math.min(1, (p - pt.revealDelay) / (1 - pt.revealDelay)));
        if (localP <= 0) return;

        // Start point outside the card
        const startX = imageCenterX + Math.cos(pt.spawnAngle) * pt.spawnDist;
        const startY = imageCenterY + Math.sin(pt.spawnAngle) * pt.spawnDist;

        // Exact target point on this specific card
        const targetX = PADDING + pt.targetNormalizedX * cardW;
        const targetY = PADDING + pt.targetNormalizedY * cardH;

        // Curved organic swirling motion path:
        // Angle rotates inward as localP goes from 0 to 1
        const currentAngle = pt.spawnAngle + pt.spiralDir * (1 - localP) * Math.PI * pt.spiralTurns;
        const currentDist = pt.spawnDist * (1 - Math.pow(localP, 1.4));

        // Flutter oscillation
        const flutter = Math.sin(localP * pt.flutterFreq * 5 + pt.flutterPhase) * (1 - localP) * 14;

        // Interpolated position
        const swirlX = imageCenterX + Math.cos(currentAngle) * currentDist + flutter;
        const swirlY = imageCenterY + Math.sin(currentAngle) * (currentDist * 0.75) + flutter * 0.6;

        // Blend from swirling path to exact final target position
        const blendFactor = Math.pow(localP, 2.5);
        const curX = swirlX * (1 - blendFactor) + targetX * blendFactor;
        const curY = swirlY * (1 - blendFactor) + targetY * blendFactor;

        // Rotation & scaling
        const curRot = pt.baseRot + localP * Math.PI * 2 * pt.spiralDir;
        const curScale = pt.baseScale * (0.6 + localP * 0.4);

        // Alpha: fades in on entry, glows during convergence, dissolves at end
        let alpha = pt.baseAlpha;
        if (localP < 0.2) {
          alpha *= localP / 0.2;
        } else if (localP > 0.85) {
          alpha *= (1 - localP) / 0.15; // dissolve into the real HTML card
        }

        if (alpha > 0.02) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
          ctx.translate(curX, curY);
          ctx.rotate(curRot);
          ctx.scale(curScale, curScale);

          if (pt.type === 'leaf' && sprites.leaves.length > 0) {
            const spr = sprites.leaves[pt.spriteIndex % sprites.leaves.length];
            ctx.drawImage(spr.canvas, -spr.w / 2, -spr.h / 2, spr.w, spr.h);
          } else if (sprites.sparkles.length > 0) {
            const spr = sprites.sparkles[pt.spriteIndex % sprites.sparkles.length];
            ctx.drawImage(spr.canvas, -spr.w / 2, -spr.h / 2, spr.w, spr.h);
          }

          ctx.restore();
        }
      });

      ctx.restore();
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      isCancelled = true;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [particles, isAssembled]);

  // Compute reveal phase styles for real card content
  const p = isAssembled ? 1 : renderProgress;

  // 1. Image reveal: begins at progress 0.25, completes by 0.75
  const imageReveal = Math.max(0, Math.min(1, (p - 0.25) / 0.5));
  // 2. Card body & footer reveal: begins at progress 0.60, completes by 0.95
  const bodyReveal = Math.max(0, Math.min(1, (p - 0.60) / 0.35));

  return (
    <div
      ref={cardRef}
      className={`product-particle-card-wrapper ${isAssembled ? 'card-assembled' : 'card-assembling'}`}
      style={{
        position: 'relative',
        overflow: 'visible'
      }}
    >
      {/* 1. INDEPENDENT OVERLAY CANVAS (MARGIN PADDING = 70px) */}
      {!isAssembled && (
        <canvas
          ref={canvasRef}
          className="product-particle-canvas"
          style={{
            position: 'absolute',
            top: -PADDING,
            left: -PADDING,
            width: `calc(100% + ${PADDING * 2}px)`,
            height: `calc(100% + ${PADDING * 2}px)`,
            pointerEvents: 'none',
            zIndex: 15,
            willChange: 'transform'
          }}
          aria-hidden="true"
        />
      )}

      {/* 2. REAL HTML PRODUCT CARD WITH COORDINATED STAGGERED REVEAL */}
      <div
        className="product-real-card-content"
        style={{
          opacity: isAssembled ? 1 : Math.max(0, Math.min(1, (p - 0.2) / 0.75)),
          filter: isAssembled ? 'none' : `blur(${(1 - imageReveal) * 8}px)`,
          transform: isAssembled ? 'none' : `scale(${0.94 + p * 0.06})`,
          transition: isAssembled ? 'opacity 0.3s ease, transform 0.3s ease' : 'none',
          pointerEvents: isAssembled || p > 0.85 ? 'auto' : 'none',
          '--image-clip-radius': isAssembled ? '150%' : `${Math.round(imageReveal * 150)}%`,
          '--body-reveal-opacity': isAssembled ? 1 : bodyReveal,
          '--body-reveal-translate': isAssembled ? '0px' : `${(1 - bodyReveal) * 14}px`
        }}
      >
        {children}
      </div>
    </div>
  );
};

