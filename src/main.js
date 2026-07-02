// Entry point: styles first, then the application module (which boots itself on import).
import './styles.css';
import './app.js';

// Service worker: precache-on-use + offline fallback. Registered only in production
// builds so the dev server never fights with a stale cache.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { /* offline support is best-effort */ });
  });
}
