/* ═══════════════════════════════════════════════════════
   PARTICLES JS — Hero Section Floating Particles
   Canvas-based, performant, GPU accelerated
   ═══════════════════════════════════════════════════════ */

'use strict';

(function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = `
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  `;
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let W, H, dpr, particles, raf;

  // ─── Config ───────────────────────────────────────
  const CONFIG = {
    count: Math.min(70, Math.floor((window.innerWidth * window.innerHeight) / 14000)),
    baseSpeed: 0.3,
    minRadius: 1,
    maxRadius: 3,
    colors: [
      'rgba(167,139,250,',   // purple
      'rgba(56,189,248,',    // blue
      'rgba(244,114,182,',   // pink
      'rgba(52,211,153,',    // green
      'rgba(251,191,36,',    // yellow
    ],
    connectionDist: 120,
    connectionOpacity: 0.12,
  };

  // ─── Resize ───────────────────────────────────────
  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
  }

  // ─── Particle class ───────────────────────────────
  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(randomY = false) {
      this.x      = Math.random() * W;
      this.y      = randomY ? Math.random() * H : H + 10;
      this.r      = CONFIG.minRadius + Math.random() * (CONFIG.maxRadius - CONFIG.minRadius);
      this.speed  = CONFIG.baseSpeed + Math.random() * 0.4;
      this.vx     = (Math.random() - 0.5) * 0.4;
      this.vy     = -(this.speed);
      this.alpha  = 0.1 + Math.random() * 0.6;
      this.color  = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
      this.pulse  = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.02 + Math.random() * 0.03;
    }

    update() {
      this.x    += this.vx;
      this.y    += this.vy;
      this.pulse += this.pulseSpeed;

      // Wrap horizontally
      if (this.x < -this.r)  this.x = W + this.r;
      if (this.x > W + this.r) this.x = -this.r;

      // Reset when off top
      if (this.y < -this.r * 2) this.reset();
    }

    draw(ctx) {
      const pulseAlpha = this.alpha * (0.8 + 0.2 * Math.sin(this.pulse));
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);

      // Glow gradient
      const grad = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.r * 3
      );
      grad.addColorStop(0,   this.color + pulseAlpha + ')');
      grad.addColorStop(0.5, this.color + (pulseAlpha * 0.4) + ')');
      grad.addColorStop(1,   this.color + '0)');

      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    }
  }

  // ─── Draw connections ──────────────────────────────
  function drawConnections(particles) {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.connectionDist) {
          const alpha = CONFIG.connectionOpacity * (1 - dist / CONFIG.connectionDist);
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = `rgba(167,139,250,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  // ─── Init particles ────────────────────────────────
  function initParticleList() {
    particles = Array.from({ length: CONFIG.count }, () => new Particle());
  }

  // ─── Animation loop ────────────────────────────────
  function animate() {
    ctx.clearRect(0, 0, W, H);

    drawConnections(particles);

    particles.forEach(p => {
      p.update();
      p.draw(ctx);
    });

    raf = requestAnimationFrame(animate);
  }

  // ─── Pause when hidden ─────────────────────────────
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else {
      animate();
    }
  });

  // ─── Handle resize (debounced) ─────────────────────
  let resizeTimer;
  const handleResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      initParticleList();
    }, 200);
  };

  window.addEventListener('resize', handleResize, { passive: true });

  // ─── Boot ──────────────────────────────────────────
  resize();
  initParticleList();

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Draw once, no animation
    particles.forEach(p => p.draw(ctx));
    return;
  }

  animate();
})();

