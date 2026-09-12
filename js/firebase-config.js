/* ═══════════════════════════════════════════════════════
   FIREBASE CONFIG — Trion School AI Vibecoding Course
   Uses CDN ESM imports (no build tool needed)
   ═══════════════════════════════════════════════════════ */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js';
import { getAuth }       from 'https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js';

const firebaseConfig = {
  apiKey:            'AIzaSyC0ANJjd5KIyNztLTGvn4gp1_-S6WMkjT0',
  authDomain:        'trion-education.firebaseapp.com',
  projectId:         'trion-education',
  storageBucket:     'trion-education.firebasestorage.app',
  messagingSenderId: '235322388455',
  appId:             '1:235322388455:web:13215898ecba36afb39742',
  measurementId:     'G-08RVSQYW72',
};

const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
