/* ═══════════════════════════════════════════════════════
   REGISTER.JS — Dedicated registration page logic
   Trion Education AI Vibecoding Course
   ═══════════════════════════════════════════════════════ */

import { auth } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js';

const googleProvider = new GoogleAuthProvider();

// ─── If already logged in, redirect to home ──────────
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = 'index.html';
  }
});

// ─── Error messages ───────────────────────────────────
const ERROR_MESSAGES = {
  'auth/email-already-in-use':  'Бұл email тіркелген. Кіруді қолданыңыз.',
  'auth/weak-password':         'Құпиясөз кемінде 6 таңбадан тұруы керек',
  'auth/invalid-email':         'Email форматы дұрыс емес',
  'auth/network-request-failed':'Интернет байланысын тексеріңіз',
  'auth/too-many-requests':     'Тым көп әрекет. Кейінірек қайталаңыз.',
  'auth/popup-closed-by-user':  '',
  'auth/configuration-not-found': '⚠️ Firebase конфигурациясы дұрыс емес.',
};

function getErrorMsg(code) {
  return ERROR_MESSAGES[code] || 'Қате орын алды. Қайталап көріңіз.';
}

function showError(msg) {
  const el = document.getElementById('registerError');
  if (el) el.textContent = msg;
}

function setLoading(loading) {
  const btn  = document.getElementById('registerBtn');
  const text = document.getElementById('registerBtnText');
  if (!btn || !text) return;
  btn.disabled     = loading;
  text.textContent = loading ? 'Жүктелуде...' : 'Тіркелу';
  btn.classList.toggle('btn--loading', loading);
}

// ─── Email/Password registration ─────────────────────
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  showError('');

  const name    = document.getElementById('regName')?.value.trim();
  const email   = document.getElementById('regEmail')?.value.trim();
  const pass    = document.getElementById('regPassword')?.value;
  const confirm = document.getElementById('regPasswordConfirm')?.value;

  // Validate
  if (!name) { showError('Аты-жөніңізді енгізіңіз'); return; }
  if (!email) { showError('Email енгізіңіз'); return; }
  if (!pass || pass.length < 6) { showError('Құпиясөз кемінде 6 таңбадан тұруы керек'); return; }
  if (pass !== confirm) { showError('Құпиясөздер сәйкес келмейді'); return; }

  setLoading(true);
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: name });
    // Redirect to home after successful registration
    window.location.href = 'index.html';
  } catch (err) {
    const msg = getErrorMsg(err.code);
    if (msg) showError(msg);
    setLoading(false);
  }
});

// ─── Google Sign-Up ───────────────────────────────────
document.getElementById('btnGoogleReg')?.addEventListener('click', async () => {
  const btn = document.getElementById('btnGoogleReg');
  if (btn) { btn.disabled = true; btn.textContent = 'Жүктелуде...'; }
  try {
    await signInWithPopup(auth, googleProvider);
    window.location.href = 'index.html';
  } catch (err) {
    const msg = getErrorMsg(err.code);
    if (msg) showError(msg);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Google арқылы тіркелу`;
    }
  }
});

