// Einfaches Toggle für das responsive Menü (Hamburger)
document.addEventListener('DOMContentLoaded', () => {
  const toggles = Array.from(document.querySelectorAll('.menu-toggle'));
  const closeAll = () => {
    document.querySelectorAll('.nav-links.open').forEach(n => n.classList.remove('open'));
    toggles.forEach(t => t.setAttribute('aria-expanded', 'false'));
  };

  toggles.forEach(btn => {
    const navId = btn.getAttribute('aria-controls');
    const nav = document.getElementById(navId);
    if (!nav) return;
    btn.addEventListener('click', (e) => {
      const isOpen = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      e.stopPropagation();
    });
  });

  // Klick ausserhalb schliesst Menü (mobile)
  document.addEventListener('click', (e) => {
    if (!e.target.closest('header')) closeAll();
  });
  document.addEventListener('touchstart', (e) => {
    if (!e.target.closest('header')) closeAll();
  });

  // Beim Vergrössern Fenster Menü schliessen
  window.addEventListener('resize', () => {
    if (window.innerWidth > 700) closeAll();
  });
});