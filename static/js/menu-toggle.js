document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('menu');

  if (!toggle) {
    console.warn('[ToggleMenu] .menu-toggle button not found');
    return;
  }
  if (!menu) {
    console.warn('[ToggleMenu] #menu not found');
    return;
  }

  console.log('[ToggleMenu] DOM ready – Binding click listener.');
  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('active');
    toggle.setAttribute('aria-expanded', isOpen);
    menu.setAttribute('aria-hidden', !isOpen);
    console.log(`[ToggleMenu] Menu toggled: ${isOpen ? 'open' : 'closed'}`);
  });
});
