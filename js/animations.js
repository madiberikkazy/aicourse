/* ═══════════════════════════════════════════════════════
   ANIMATIONS JS — Trion Education
   Advanced scroll-driven effects and micro-interactions
   ═══════════════════════════════════════════════════════ */

'use strict';

(function initAnimations() {

  // ─── Timeline line draw ─────────────────────────────
  function initTimelineDraw() {
    const line = document.querySelector('.timeline::before');
    if (!line) return;

    // The pseudo-element can't be targeted directly;
    // instead we animate timeline items stagger via IO.
    const items = document.querySelectorAll('.timeline-item');
    if (!items.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Already handled by CSS .reveal; just add a small extra dot ping
          const dot = entry.target.querySelector('.timeline-dot');
          if (dot) {
            dot.style.animation = 'none';
            requestAnimationFrame(() => {
              dot.style.animation = 'dotPing 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards';
            });
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    items.forEach(el => observer.observe(el));
  }

  // ─── Tilt effect on cards ────────────────────────────
  function initTiltCards() {
    if (window.matchMedia('(hover: none)').matches) return;

    const cards = document.querySelectorAll('.glass-card:not(.contact-form):not(.faq-item)');

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect   = card.getBoundingClientRect();
        const cx     = rect.left + rect.width  / 2;
        const cy     = rect.top  + rect.height / 2;
        const dx     = (e.clientX - cx) / (rect.width  / 2);
        const dy     = (e.clientY - cy) / (rect.height / 2);
        const rotX   = dy * -6;
        const rotY   = dx *  6;

        card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px) scale(1.01)`;
        card.style.transition = 'transform 0.1s linear';
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
      });
    });
  }

  // ─── Tool card level bars ────────────────────────────
  function initLevelBars() {
    const bars = document.querySelectorAll('.level-bar');
    if (!bars.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const level = bar.style.getPropertyValue('--level');
          // Trigger CSS transition
          requestAnimationFrame(() => {
            bar.style.width = level;
          });
          observer.unobserve(bar);
        }
      });
    }, { threshold: 0.5 });

    bars.forEach(bar => {
      bar.style.width = '0';
      observer.observe(bar);
    });
  }

  // ─── Nav progress bar ────────────────────────────────
  function initReadingProgress() {
    const bar = document.createElement('div');
    bar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      height: 2px;
      width: 0%;
      background: linear-gradient(90deg, #a78bfa, #38bdf8, #f472b6);
      background-size: 200% 100%;
      z-index: 10000;
      transition: width 0.1s linear;
      animation: gradientShift 3s linear infinite;
      pointer-events: none;
    `;
    document.body.appendChild(bar);

    window.addEventListener('scroll', () => {
      const scrollTop = document.documentElement.scrollTop;
      const scrollH   = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress  = scrollH > 0 ? (scrollTop / scrollH) * 100 : 0;
      bar.style.width = `${Math.min(progress, 100)}%`;
    }, { passive: true });
  }

  // ─── Section background parallax blobs ───────────────
  function initBlobParallax() {
    const blobs = [
      { el: document.querySelector('.about-section'),    speed: 0.05 },
      { el: document.querySelector('.tools-section'),    speed: 0.08 },
      { el: document.querySelector('.syllabus-section'), speed: 0.06 },
      { el: document.querySelector('.faq-section'),      speed: 0.07 },
    ];

    const handleScroll = () => {
      const scrollY = window.scrollY;
      blobs.forEach(({ el, speed }) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const offset = (rect.top + scrollY) * speed;
        // Apply to pseudo-element via a CSS var on the element
        el.style.setProperty('--blob-offset', `${offset}px`);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  // ─── Hero content parallax ────────────────────────────
  function initHeroParallax() {
    const hero    = document.querySelector('.hero');
    const content = document.querySelector('.hero__content');
    if (!hero || !content) return;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY > window.innerHeight) return; // Only in hero viewport
      content.style.transform = `translateY(${scrollY * 0.15}px)`;
      content.style.opacity   = `${1 - scrollY / (window.innerHeight * 0.8)}`;
    }, { passive: true });
  }

  // ─── Magnetic buttons ─────────────────────────────────
  function initMagneticButtons() {
    if (window.matchMedia('(hover: none)').matches) return;

    const buttons = document.querySelectorAll('.btn--primary, .nav-link--cta');

    buttons.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const cx   = rect.left + rect.width  / 2;
        const cy   = rect.top  + rect.height / 2;
        const dx   = (e.clientX - cx) * 0.25;
        const dy   = (e.clientY - cy) * 0.25;
        btn.style.transform = `translate(${dx}px, ${dy}px) scale(1.04)`;
        btn.style.transition = 'transform 0.15s ease';
      }, { passive: true });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        btn.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
      });
    });
  }

  // ─── Inject dot ping keyframe ─────────────────────────
  function injectKeyframes() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes dotPing {
        0%   { transform: scale(1); box-shadow: 0 0 0 0 rgba(167,139,250,0.6); }
        50%  { transform: scale(1.5); box-shadow: 0 0 0 12px rgba(167,139,250,0); }
        100% { transform: scale(1); box-shadow: 0 0 12px rgba(167,139,250,0.5); }
      }
      @keyframes gradientShift {
        0%   { background-position: 0% 50%; }
        50%  { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `;
    document.head.appendChild(style);
  }

  // ─── Boot all ──────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    injectKeyframes();
    initTimelineDraw();
    initTiltCards();
    initLevelBars();
    initReadingProgress();
    initBlobParallax();
    initHeroParallax();
    initMagneticButtons();
  });

})();

