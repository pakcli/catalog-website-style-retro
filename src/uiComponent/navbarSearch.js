/**
 * Atomic UI Component: Persistent CLI Breadcrumb & Search Bar (`navbar-search`)
 * Format: home / [menu] > [ Type title to filter... ] [O] [*] [L]
 */
export function initNavbarSearch(onSearchInput, onKeycapTrigger) {
  const container = document.getElementById('navbarSearchContainer');
  if (!container) return;

  const isSubdir = typeof window !== 'undefined' && window.location && (
    window.location.pathname.includes('/apps') ||
    window.location.pathname.includes('/skills') ||
    window.location.pathname.includes('/combos') ||
    window.location.pathname.includes('/scripts')
  );
  const homeUrl = isSubdir ? '../' : './';

  container.innerHTML = `
    <div class="cli-navbar-bar">
      <div class="cli-breadcrumb-left">
        <a href="${homeUrl}" class="cli-crumb-link">home</a>
        <span class="cli-sep">/</span>
        <a href="${homeUrl}" class="cli-crumb-menu">[menu]</a>
        <span class="cli-prompt">&gt;</span>
      </div>
      <div class="cli-input-wrapper">
        <input type="text" id="cliSearchInput" class="cli-input-field" placeholder="Type title to filter..." autocomplete="off" spellcheck="false" />
      </div>
      <div class="cli-keycaps-right">
        <button class="keycap-btn" id="keycapSearchOverlay" title="Open Title Search [*]">[*]</button>
        <button class="keycap-btn" id="keycapThemeToggle" title="Toggle Theme Light/Dark [L]">[L]</button>
      </div>
    </div>
  `;

  const inputEl = document.getElementById('cliSearchInput');
  if (inputEl && onSearchInput) {
    inputEl.addEventListener('input', (e) => onSearchInput(e.target.value));
  }

  const starBtn = document.getElementById('keycapSearchOverlay');
  if (starBtn && onKeycapTrigger) {
    starBtn.addEventListener('click', () => onKeycapTrigger('search'));
  }

  const lightBtn = document.getElementById('keycapThemeToggle');
  if (lightBtn) {
    lightBtn.addEventListener('click', () => {
      document.documentElement.classList.toggle('theme-light');
      document.documentElement.classList.toggle('theme-dark');
    });
  }
}
