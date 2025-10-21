// kleines Skript, das bei Touch/Click die Tooltip-Anzeige toggelt.
// Desktop: Hover (CSS) reicht; Mobile: toggle per touch/click.

document.addEventListener('DOMContentLoaded', () => {
  const helpButtons = Array.from(document.querySelectorAll('.help'));

  function hideAllHelp(except = null) {
    helpButtons.forEach(btn => {
      if (btn !== except) {
        btn.classList.remove('help-visible');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Klick / Touch auf ein Hilfe-Icon toggelt die Sichtbarkeit (für Mobile)
  helpButtons.forEach(btn => {
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', '0');
    btn.setAttribute('aria-expanded', 'false');

    btn.addEventListener('click', (e) => {
      const isVisible = btn.classList.toggle('help-visible');
      btn.setAttribute('aria-expanded', isVisible ? 'true' : 'false');
      if (isVisible) hideAllHelp(btn);
      e.stopPropagation();
    });

    // Tastatur: Enter / Space auch möglich
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      } else if (e.key === 'Escape') {
        btn.classList.remove('help-visible');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Klick ausserhalb schliesst alle Tooltips
  document.addEventListener('click', () => hideAllHelp());
  // Touch also
  document.addEventListener('touchstart', () => hideAllHelp());
});