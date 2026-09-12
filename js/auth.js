/* ═══════════════════════════════════════════════════════
   AUTH.JS — Firebase Authentication Module
   Trion School AI Vibecoding Course
   ─────────────────────────────────────────────────────
   Handles: Sign In, Sign Up, Google OAuth,
            Sign Out, onAuthStateChanged,
            Auth Modal UI, Protected Курстар section.
   ═══════════════════════════════════════════════════════ */

import { auth } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js';

// ─── State ────────────────────────────────────────────
const googleProvider = new GoogleAuthProvider();
let currentUser = null;

// ─── Error code → Kazakh messages ────────────────────
const ERROR_MESSAGES = {
  'auth/user-not-found':        'Пайдаланушы табылмады',
  'auth/wrong-password':        'Қате құпиясөз',
  'auth/invalid-credential':    'Email немесе құпиясөз қате',
  'auth/email-already-in-use':  'Бұл email тіркелген',
  'auth/weak-password':         'Құпиясөз кемінде 6 таңбадан тұруы керек',
  'auth/invalid-email':         'Email форматы дұрыс емес',
  'auth/popup-closed-by-user':  '',
  'auth/cancelled-popup-request': '',
  'auth/network-request-failed':'Интернет байланысын тексеріңіз',
  'auth/too-many-requests':     'Тым көп әрекет. Кейінірек қайталаңыз.',
  'auth/configuration-not-found': '⚠️ Firebase конфигурациясы дұрыс емес. js/firebase-config.js файлын толтырыңыз.',
};

function getErrorMsg(code) {
  return ERROR_MESSAGES[code] || 'Қате орын алды. Қайталап көріңіз.';
}

/* ════════════════════════════════════════════════════════
   MODAL HELPERS
════════════════════════════════════════════════════════ */
function openModal(tab = 'signin') {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.removeAttribute('hidden');
  // Prevent body scroll
  document.body.style.overflow = 'hidden';
  // Animate in
  requestAnimationFrame(() => modal.classList.add('is-visible'));
  switchTab(tab);
  // Focus first input
  const firstInput = modal.querySelector(`#${tab === 'signin' ? 'siEmail' : 'suName'}`);
  setTimeout(() => firstInput?.focus(), 150);
}

function closeModal() {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.classList.remove('is-visible');
  document.body.style.overflow = '';
  setTimeout(() => {
    modal.setAttribute('hidden', '');
    clearErrors();
    document.getElementById('signInForm')?.reset();
    document.getElementById('signUpForm')?.reset();
  }, 320);
}

function switchTab(tab) {
  const tabs      = document.querySelectorAll('.auth-tab');
  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');
  const title      = document.getElementById('authModalTitle');

  tabs.forEach(t => {
    const isActive = t.dataset.tab === tab;
    t.classList.toggle('active', isActive);
    t.setAttribute('aria-selected', String(isActive));
  });

  if (tab === 'signin') {
    signInForm?.removeAttribute('hidden');
    signUpForm?.setAttribute('hidden', '');
    if (title) title.textContent = 'Жүйеге кіру';
  } else {
    signUpForm?.removeAttribute('hidden');
    signInForm?.setAttribute('hidden', '');
    if (title) title.textContent = 'Тіркелу';
  }
  clearErrors();
}

function clearErrors() {
  document.getElementById('signInError') && (document.getElementById('signInError').textContent = '');
  document.getElementById('signUpError') && (document.getElementById('signUpError').textContent = '');
}

function setError(elId, msg) {
  const el = document.getElementById(elId);
  if (el) el.textContent = msg;
}

function setLoading(btnTextId, loading, defaultText) {
  const btn  = document.getElementById(btnTextId)?.closest('button');
  const text = document.getElementById(btnTextId);
  if (!btn || !text) return;
  btn.disabled   = loading;
  text.textContent = loading ? 'Жүктелуде...' : defaultText;
  btn.classList.toggle('btn--loading', loading);
}

/* ════════════════════════════════════════════════════════
   AUTH OPERATIONS
════════════════════════════════════════════════════════ */
async function handleSignIn(e) {
  e.preventDefault();
  const email    = document.getElementById('siEmail')?.value.trim();
  const password = document.getElementById('siPassword')?.value;
  if (!email || !password) return;

  setError('signInError', '');
  setLoading('signInBtnText', true, 'Кіру');
  try {
    await signInWithEmailAndPassword(auth, email, password);
    closeModal();
  } catch (err) {
    const msg = getErrorMsg(err.code);
    if (msg) setError('signInError', msg);
  } finally {
    setLoading('signInBtnText', false, 'Кіру');
  }
}

async function handleSignUp(e) {
  e.preventDefault();
  const name     = document.getElementById('suName')?.value.trim();
  const email    = document.getElementById('suEmail')?.value.trim();
  const password = document.getElementById('suPassword')?.value;
  const confirm  = document.getElementById('suPasswordConfirm')?.value;

  if (!name || !email || !password || !confirm) return;

  if (password !== confirm) {
    setError('signUpError', 'Құпиясөздер сәйкес келмейді');
    return;
  }
  if (password.length < 6) {
    setError('signUpError', 'Құпиясөз кемінде 6 таңбадан тұруы керек');
    return;
  }

  setError('signUpError', '');
  setLoading('signUpBtnText', true, 'Тіркелу');
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    // Force re-read updated profile
    currentUser = { ...cred.user, displayName: name };
    closeModal();
    updateNavUI(currentUser);
    updateCoursesSection(currentUser);
  } catch (err) {
    const msg = getErrorMsg(err.code);
    if (msg) setError('signUpError', msg);
  } finally {
    setLoading('signUpBtnText', false, 'Тіркелу');
  }
}

async function handleGoogleSignIn() {
  const btn = document.getElementById('btnGoogle');
  if (btn) { btn.disabled = true; btn.textContent = 'Жүктелуде...'; }
  try {
    await signInWithPopup(auth, googleProvider);
    closeModal();
  } catch (err) {
    const msg = getErrorMsg(err.code);
    const errorEl = document.querySelector('.auth-form:not([hidden]) .auth-error');
    if (msg && errorEl) errorEl.textContent = msg;
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Google арқылы кіру`;
    }
  }
}

async function handleSignOut() {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Sign out error:', err);
  }
}

/* ════════════════════════════════════════════════════════
   COURSES — protected nav click
════════════════════════════════════════════════════════ */
function handleCoursesNav(e) {
  e.preventDefault();
  if (!currentUser) {
    openModal('signin');
    // After modal closes successfully (auth state updates), scroll happens via updateCoursesSection
    // Show a tip in the modal
    const subtitle = document.getElementById('authModalSubtitle');
    if (subtitle) subtitle.textContent = 'Курстарды көру үшін алдымен кіріңіз';
  } else {
    document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/* ════════════════════════════════════════════════════════
   UI UPDATE — onAuthStateChanged callback
════════════════════════════════════════════════════════ */
function updateNavUI(user) {
  const btnSignIn = document.getElementById('btnSignIn');
  const btnSignUp = document.getElementById('btnSignUp');
  const userMenu  = document.getElementById('userMenu');
  const userName  = document.getElementById('userName');
  const userAvatar = document.getElementById('userAvatarText');

  if (user) {
    if (btnSignIn) btnSignIn.style.display = 'none';
    if (btnSignUp) btnSignUp.style.display = 'none';
    if (userMenu)  userMenu.style.display  = 'flex';

    const displayName = user.displayName || user.email || '';
    const initials    = displayName
      .split(' ')
      .map(p => p[0]?.toUpperCase())
      .slice(0, 2)
      .join('');

    if (userName)   userName.textContent   = user.displayName || user.email?.split('@')[0] || '';
    if (userAvatar) userAvatar.textContent = initials || '?';

    // Avatar image if available (Google photo)
    const avatarImg = document.getElementById('userAvatarImg');
    if (avatarImg && user.photoURL) {
      avatarImg.src = user.photoURL;
      avatarImg.style.display = 'block';
      const textEl = document.getElementById('userAvatarText');
      if (textEl) textEl.style.display = 'none';
    }
  } else {
    if (btnSignIn) btnSignIn.style.display = '';
    if (btnSignUp) btnSignUp.style.display = '';
    if (userMenu)  userMenu.style.display  = 'none';
    const avatarImg = document.getElementById('userAvatarImg');
    if (avatarImg) { avatarImg.src = ''; avatarImg.style.display = 'none'; }
    const textEl = document.getElementById('userAvatarText');
    if (textEl) textEl.style.display = '';
  }
}

function updateCoursesSection(user) {
  const locked    = document.querySelector('.courses-locked');
  const dashboard = document.querySelector('.courses-dashboard');
  if (!locked || !dashboard) return;

  if (user) {
    locked.style.display    = 'none';
    dashboard.style.display = 'block';
    const welcomeName = dashboard.querySelector('.dashboard-welcome-name');
    if (welcomeName) welcomeName.textContent = user.displayName || user.email?.split('@')[0] || 'Пайдаланушы';
  } else {
    locked.style.display    = '';
    dashboard.style.display = 'none';
  }
}

/* ════════════════════════════════════════════════════════
   KEYBOARD / ACCESSIBILITY
════════════════════════════════════════════════════════ */
function handleModalKeydown(e) {
  if (e.key === 'Escape') closeModal();

  // Focus trap inside modal
  const modal = document.getElementById('authModal');
  if (!modal || modal.hasAttribute('hidden')) return;

  const focusables = [...modal.querySelectorAll(
    'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )];
  if (!focusables.length) return;

  if (e.key === 'Tab') {
    const first = focusables[0];
    const last  = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

/* ════════════════════════════════════════════════════════
   BOOTSTRAP — wire everything up after DOM is ready
════════════════════════════════════════════════════════ */
function bootstrap() {
  // ── Auth state listener ──────────────────────────────
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    updateNavUI(user);
    updateCoursesSection(user);
  });

  // ── Nav buttons ──────────────────────────────────────
  document.getElementById('btnSignIn')?.addEventListener('click', () => openModal('signin'));
  // "Тіркелу" goes to the dedicated register page
  document.getElementById('btnSignUp')?.addEventListener('click', () => {
    window.location.href = 'register.html';
  });
  document.getElementById('btnSignOut')?.addEventListener('click', handleSignOut);
  document.getElementById('navCoursesBtn')?.addEventListener('click', handleCoursesNav);

  // ── Auth modal triggers ──────────────────────────────
  document.getElementById('authModalClose')?.addEventListener('click', closeModal);
  document.getElementById('authModalBackdrop')?.addEventListener('click', closeModal);
  document.addEventListener('keydown', handleModalKeydown);

  // ── Sign in form only ────────────────────────────────
  document.getElementById('signInForm')?.addEventListener('submit', handleSignIn);
  document.getElementById('btnGoogle')?.addEventListener('click', handleGoogleSignIn);

  // ── "Тіркелу" link inside modal → register page ──────
  document.querySelector('.auth-modal__register-link a')?.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal();
    setTimeout(() => { window.location.href = 'register.html'; }, 320);
  });

  // ── Courses locked prompt buttons ────────────────────
  document.getElementById('coursesSignInPrompt')?.addEventListener('click', () => openModal('signin'));
  document.getElementById('coursesSignUpPrompt')?.addEventListener('click', () => {
    window.location.href = 'register.html';
  });

  // ── Mobile: close nav on auth button click ───────────
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    [document.getElementById('btnSignIn'), document.getElementById('btnSignUp')]
      .filter(Boolean)
      .forEach(btn => {
        btn.addEventListener('click', () => {
          navLinks.classList.remove('is-open');
          hamburger.classList.remove('active');
          hamburger.setAttribute('aria-expanded', 'false');
        });
      });
  }
}

// Run after DOM is ready (module scripts are deferred by default)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}

