/**
 * NEW RATNA PAN SHOP — BOTANICAL PAAN LEAF SPRITE ATLAS
 * Generates and caches offscreen canvas sprites of realistic miniature
 * Indian betel leaves (heart-shaped cordate silhouette, tapered tip,
 * midrib & lateral branching veins, emerald botanical gradients, specular highlight)
 * and champagne-gold sparkles.
 * 
 * Shared globally across all product card assemblers for 60fps performance with 0 duplicate allocations.
 */

let cachedSprites = null;

export function getPaanLeafSprites() {
  if (cachedSprites) return cachedSprites;
  if (typeof window === 'undefined') return { leaves: [], sparkles: [] };

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const leaves = [];
  const sparkles = [];

  // Botanical color profiles
  const profiles = [
    {
      tip: '#34A853',
      body: '#247A45', // Natural Emerald Green
      base: '#144A27',
      vein: '#1B5E34',
      goldVein: false
    },
    {
      tip: '#2ECC71',
      body: '#1E6639',
      base: '#0F3B1E',
      vein: '#14532D',
      goldVein: false
    },
    {
      tip: '#4ADE80',
      body: '#22C55E',
      base: '#15803D',
      vein: '#166534',
      goldVein: false
    },
    {
      tip: '#38B264',
      body: '#247A45',
      base: '#144A27',
      vein: '#E6C77B', // Antique Champagne Gold veining
      goldVein: true
    }
  ];

  // Sizes tailored for product cards: 10px, 16px, 22px
  const sizes = [11, 16, 24];
  const curls = [-0.15, 0, 0.15];

  profiles.forEach((prof) => {
    sizes.forEach((size) => {
      curls.forEach((curl) => {
        const w = Math.ceil(size * 1.5 * dpr);
        const h = Math.ceil(size * 1.8 * dpr);
        const offCanvas = document.createElement('canvas');
        offCanvas.width = w;
        offCanvas.height = h;
        const ctx = offCanvas.getContext('2d');
        if (!ctx) return;

        ctx.scale(dpr, dpr);
        const cx = (w / dpr) / 2;
        const cy = (h / dpr) / 2;

        ctx.save();
        ctx.translate(cx, cy);

        // Draw Heart-Shaped Cordate Betel Leaf Path
        ctx.beginPath();
        ctx.moveTo(0, size * 0.45); // Stem base

        // Left lobe
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
        // Right shoulder from tip
        ctx.bezierCurveTo(
          size * 0.18 + curl * size * 0.2, -size * 0.48,
          size * 0.45, -size * 0.32,
          size * 0.5, -size * 0.08
        );
        // Right lobe back to base
        ctx.bezierCurveTo(
          size * 0.55, size * 0.15,
          size * 0.42, size * 0.48,
          0, size * 0.45
        );
        ctx.closePath();

        // Botanical gradient fill
        const grad = ctx.createLinearGradient(-size * 0.2, -size * 0.5, size * 0.2, size * 0.5);
        grad.addColorStop(0, prof.tip);
        grad.addColorStop(0.45, prof.body);
        grad.addColorStop(1, prof.base);
        ctx.fillStyle = grad;
        ctx.fill();

        // Specular highlight on left lobe
        ctx.save();
        ctx.clip();
        const sheen = ctx.createLinearGradient(-size * 0.35, -size * 0.25, 0, 0);
        sheen.addColorStop(0, 'rgba(255, 255, 255, 0.32)');
        sheen.addColorStop(0.6, prof.goldVein ? 'rgba(230, 199, 123, 0.25)' : 'rgba(255, 255, 255, 0.08)');
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
        ctx.lineWidth = Math.max(0.7, size * 0.038);
        ctx.strokeStyle = prof.goldVein ? 'rgba(230, 199, 123, 0.85)' : prof.vein;
        ctx.stroke();

        // Secondary Curved Lateral Veins (3 pairs)
        ctx.lineWidth = Math.max(0.5, size * 0.022);
        for (let i = 1; i <= 3; i++) {
          const frac = i / 4;
          const yMid = size * 0.45 - frac * size * 0.95;
          ctx.beginPath();
          ctx.moveTo(0, yMid);
          ctx.quadraticCurveTo(-size * 0.2, yMid - size * 0.06, -size * 0.42 * (1 - frac * 0.45), yMid - size * 0.14);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, yMid);
          ctx.quadraticCurveTo(size * 0.2, yMid - size * 0.06, size * 0.42 * (1 - frac * 0.45), yMid - size * 0.14);
          ctx.stroke();
        }

        // Stem at base
        ctx.beginPath();
        ctx.moveTo(0, size * 0.45);
        ctx.lineTo(0, size * 0.53);
        ctx.lineWidth = Math.max(0.9, size * 0.045);
        ctx.strokeStyle = '#144A27';
        ctx.stroke();

        ctx.restore();

        leaves.push({
          canvas: offCanvas,
          w: w / dpr,
          h: h / dpr,
          size
        });
      });
    });
  });

  // Champagne Gold Sparkle Stars (sizes: 8px, 14px, 20px)
  [8, 14, 20].forEach((starSize) => {
    const w = Math.ceil(starSize * 2.2 * dpr);
    const h = Math.ceil(starSize * 2.2 * dpr);
    const offCanvas = document.createElement('canvas');
    offCanvas.width = w;
    offCanvas.height = h;
    const ctx = offCanvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    const cx = (w / dpr) / 2;
    const cy = (h / dpr) / 2;

    // Soft radial gold glow
    const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, starSize);
    halo.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    halo.addColorStop(0.3, 'rgba(230, 199, 123, 0.75)');
    halo.addColorStop(0.7, 'rgba(217, 174, 78, 0.25)');
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

    sparkles.push({
      canvas: offCanvas,
      w: w / dpr,
      h: h / dpr,
      size: starSize
    });
  });

  cachedSprites = { leaves, sparkles };
  return cachedSprites;
}

