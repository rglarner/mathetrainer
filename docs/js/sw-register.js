// Registrierung und Update‑Handling für den Service Worker (Scope an Repo-Pfad anpassen)
if ('serviceWorker' in navigator) {
  // Passe Pfad + Scope an deine GitHub Pages-Subpath an
  const SW_URL = '/mathetrainer/sw.js';
  const SW_SCOPE = '/mathetrainer/';

  navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE }).then(reg => {
    function promptAndActivate(worker) {
      try { worker.postMessage({ type: 'SKIP_WAITING' }); } catch (e) {}
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!window.__sw_reloaded) {
          window.__sw_reloaded = true;
          window.location.reload();
        }
      });
    }

    if (reg.waiting) promptAndActivate(reg.waiting);

    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      if (!newWorker) return;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          promptAndActivate(newWorker);
        }
      });
    });
  }).catch(() => {
    // Registrierung fehlgeschlagen (z.B. offline)
  });
}