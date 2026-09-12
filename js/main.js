/* ═══════════════════════════════════════════════════════
   MAIN JS — Trion School AI Vibecoding Course
   Navbar, FAQ accordion, form validation, counters, parallax
   ═══════════════════════════════════════════════════════ */

'use strict';

// ─── Utility ──────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ─── Google Sheets Webhook ────────────────────────────
// HOW TO SET UP: See SHEETS_SETUP.md for step-by-step instructions.
// After deploying your Apps Script, paste the Web App URL below:
const SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycby-EewsWPlF1p0Exy8eNWhO2JeP99avZcCQ-2TXkUAbBqt5ytZiYx2rZnn1RFz1IPj1/exec';

// ─── DOM Ready ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initFAQ();
  initContactForm();
  initScrollReveal();
  initCounters();
  initParallax();
  initSpotlight();
  initActiveNavLinks();
});

/* ════════════════════════════════════════════════════════
   NAVBAR — scroll state + mobile hamburger
════════════════════════════════════════════════════════ */
function initNavbar() {
  const navbar    = $('#navbar');
  const hamburger = $('#hamburger');
  const navLinks  = $('#navLinks');

  if (!navbar) return;

  // Scroll state
  const handleScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Hamburger toggle
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    // Close on link click
    $$('a', navLinks).forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && navLinks.classList.contains('is-open')) {
        navLinks.classList.remove('is-open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

/* ════════════════════════════════════════════════════════
   ACTIVE NAV LINKS via IntersectionObserver
════════════════════════════════════════════════════════ */
function initActiveNavLinks() {
  const sections  = $$('section[id]');
  const navLinks  = $$('.nav-link:not(.nav-link--cta)');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          link.classList.toggle('active', href === `#${id}`);
        });
      }
    });
  }, {
    rootMargin: '-40% 0px -55% 0px',
    threshold: 0,
  });

  sections.forEach(s => observer.observe(s));
}

/* ════════════════════════════════════════════════════════
   FAQ ACCORDION
════════════════════════════════════════════════════════ */
function initFAQ() {
  const faqItems = $$('.faq-item');

  faqItems.forEach(item => {
    const btn    = $('.faq-question', item);
    const answer = $('.faq-answer', item);

    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Close all others
      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('is-open');
          const otherBtn = $('.faq-question', other);
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current
      item.classList.toggle('is-open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });

    // Keyboard support
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });
}

/* ════════════════════════════════════════════════════════
   CONTACT FORM — Validation + Submit
════════════════════════════════════════════════════════ */
function initContactForm() {
  const form       = $('#contactForm');
  const submitBtn  = $('#submitBtn');
  const submitText = $('#submitBtnText');
  const success    = $('#formSuccess');

  if (!form) return;

  // Phone mask
  const phoneInput = $('#phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.startsWith('8')) val = '7' + val.slice(1);
      if (val.length > 11) val = val.slice(0, 11);

      let formatted = '';
      if (val.length > 0)  formatted  = '+' + val[0];
      if (val.length > 1)  formatted += ' (' + val.slice(1, 4);
      if (val.length > 4)  formatted += ') ' + val.slice(4, 7);
      if (val.length > 7)  formatted += '-' + val.slice(7, 9);
      if (val.length > 9)  formatted += '-' + val.slice(9, 11);

      e.target.value = formatted;
    });
  }

  // Validators
  const validators = {
    name(val) {
      if (!val.trim()) return 'Аты-жөніңізді енгізіңіз';
      if (val.trim().length < 2) return 'Аты-жөні тым қысқа';
      return '';
    },
    phone(val) {
      const digits = val.replace(/\D/g, '');
      if (!digits) return 'Телефон нөмірін енгізіңіз';
      if (digits.length < 11) return 'Толық нөмір енгізіңіз';
      return '';
    },
    email(val) {
      if (!val.trim()) return 'Email енгізіңіз';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Дұрыс email форматы: example@mail.com';
      return '';
    },
  };

  // Real-time validation
  ['name', 'phone', 'email'].forEach(fieldId => {
    const input = $(`#${fieldId}`);
    const error = $(`#${fieldId}Error`);
    if (!input || !error) return;

    const validate = () => {
      const msg = validators[fieldId](input.value);
      error.textContent = msg;
      input.classList.toggle('error', !!msg);
      return !msg;
    };

    input.addEventListener('blur', validate);
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) validate();
    });
  });

  // Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all
    let valid = true;
    ['name', 'phone', 'email'].forEach(fieldId => {
      const input = $(`#${fieldId}`);
      const error = $(`#${fieldId}Error`);
      if (!input || !error) return;
      const msg = validators[fieldId](input.value);
      error.textContent = msg;
      input.classList.toggle('error', !!msg);
      if (msg) valid = false;
    });

    if (!valid) {
      // Focus first error
      const firstError = $('.form-input.error', form);
      firstError?.focus();
      // Shake animation
      form.classList.add('shake');
      setTimeout(() => form.classList.remove('shake'), 600);
      return;
    }

    // Show loading
    submitBtn.disabled = true;
    submitBtn.classList.add('btn--loading');
    submitText.textContent = 'Жіберілуде...';

    // ── Real Google Sheets submission ──────────────────
    const payload = {
      timestamp: new Date().toISOString(),
      name:      $('#name', form)?.value.trim()    || '',
      phone:     $('#phone', form)?.value.trim()   || '',
      email:     $('#email', form)?.value.trim()   || '',
      message:   $('#message', form)?.value.trim() || '',
    };

    try {
      if (SHEETS_WEBHOOK_URL && SHEETS_WEBHOOK_URL !== 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE') {
        // mode: 'no-cors' — response is opaque but the POST still goes through
        await fetch(SHEETS_WEBHOOK_URL, {
          method: 'POST',
          mode:   'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body:   JSON.stringify(payload),
        });
      } else {
        // Webhook not configured yet — simulate delay for demo
        await delay(1200);
        console.info('[Trion] Sheets webhook not configured. Payload:', payload);
      }
    } catch (fetchErr) {
      // Network error — still show success to user (data logged to console)
      console.warn('[Trion] Sheets webhook error:', fetchErr, payload);
    }


    // Show success
    submitBtn.disabled = false;
    submitBtn.classList.remove('btn--loading');
    submitText.textContent = 'Жіберу';

    if (success) {
      success.removeAttribute('hidden');
      success.focus();
    }

    form.reset();
    $$('.form-input.error', form).forEach(el => el.classList.remove('error'));

    // Hide success after 6s
    setTimeout(() => {
      if (success) success.setAttribute('hidden', '');
    }, 6000);
  });
}

/* ════════════════════════════════════════════════════════
   SCROLL REVEAL via IntersectionObserver
════════════════════════════════════════════════════════ */
function initScrollReveal() {
  const elements = $$('.reveal, .reveal-left, .reveal-right');

  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        // Animate level bars in tool cards
        const levelBar = $('.level-bar', entry.target);
        if (levelBar) {
          entry.target.classList.add('in-view');
        }
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px',
  });

  elements.forEach(el => observer.observe(el));
}

/* ════════════════════════════════════════════════════════
   ANIMATED COUNTERS
════════════════════════════════════════════════════════ */
function initCounters() {
  const counters = $$('[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      animateCounter(entry.target);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target   = parseInt(el.getAttribute('data-target'), 10);
  const duration = 1600;
  const steps    = 60;
  const interval = duration / steps;
  let current    = 0;
  let step       = 0;

  const timer = setInterval(() => {
    step++;
    // Ease-out quad
    const progress = step / steps;
    const eased    = 1 - Math.pow(1 - progress, 3);
    current = Math.round(eased * target);
    el.textContent = current.toLocaleString('kk-KZ');

    if (step >= steps) {
      clearInterval(timer);
      el.textContent = target.toLocaleString('kk-KZ');
    }
  }, interval);
}

/* ════════════════════════════════════════════════════════
   PARALLAX on scroll
════════════════════════════════════════════════════════ */
function initParallax() {
  // Video parallax
  const video = document.querySelector('.video-bg');

  const handleParallax = () => {
    const scrollY = window.scrollY;

    // Slow video parallax
    if (video) {
      video.style.transform = `translateY(${scrollY * 0.25}px)`;
    }

    // Data-parallax elements
    $$('[data-parallax]').forEach(el => {
      const speed = parseFloat(el.getAttribute('data-parallax')) || 0.3;
      el.style.transform = `translateY(${scrollY * speed}px)`;
    });
  };

  window.addEventListener('scroll', handleParallax, { passive: true });
}

/* ════════════════════════════════════════════════════════
   CURSOR SPOTLIGHT
════════════════════════════════════════════════════════ */
function initSpotlight() {
  // Only on non-touch
  if (window.matchMedia('(hover: none)').matches) return;

  const spotlight = document.createElement('div');
  spotlight.className = 'spotlight';
  document.body.appendChild(spotlight);

  let mouseX = 0, mouseY = 0;
  let rafId;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!rafId) {
      rafId = requestAnimationFrame(() => {
        spotlight.style.left = `${mouseX}px`;
        spotlight.style.top  = `${mouseY}px`;
        spotlight.style.opacity = '1';
        rafId = null;
      });
    }
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    spotlight.style.opacity = '0';
  });
}

/* ════════════════════════════════════════════════════════
   SMOOTH SCROLL for anchor links
════════════════════════════════════════════════════════ */
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;

  const href   = link.getAttribute('href');
  if (href === '#') return;

  const target = document.querySelector(href);
  if (!target) return;

  e.preventDefault();
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

/* ════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════ */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Form shake keyframe (injected dynamically to keep CSS clean)
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
@keyframes formShake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-5px); }
  80% { transform: translateX(5px); }
}
.shake { animation: formShake 0.55s cubic-bezier(.36,.07,.19,.97) both; }
`;
document.head.appendChild(shakeStyle);

