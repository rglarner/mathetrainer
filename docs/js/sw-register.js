// Registrierung und Update‑Handling für den Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(reg => {
    function promptAndActivate(worker) {
      // Sofort aktivieren und danach neu laden
      try { worker.postMessage({ type: 'SKIP_WAITING' }); } catch (e) {}
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // einmalig neu laden, wenn Controller wechselt
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
    // Registrierung fehlgeschlagen (offline/zugriffsrechte)
  });
}