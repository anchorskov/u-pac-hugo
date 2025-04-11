document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('menuToggle');
    const menu = document.getElementById('menu');
  
    console.log("[ToggleMenu] DOMContentLoaded fired.");
    console.log("[ToggleMenu] Toggle Button:", toggle);
    console.log("[ToggleMenu] Menu Element:", menu);
  
    if (toggle && menu) {
      toggle.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('active');
        console.log(`[ToggleMenu] Toggle clicked → Menu is now ${isOpen ? 'open' : 'closed'}`);
  
        toggle.setAttribute('aria-expanded', isOpen);
        menu.setAttribute('aria-hidden', !isOpen);
      });
    } else {
      console.warn("[ToggleMenu] Toggle or menu element not found in DOM.");
    }
  });
  