/**
 * Pure Business Logic: Global Keyboard Shortcuts Listener
 * Handles:
 *  - [1] Apps, [2] Skills, [3] Combos, [4] Scripts on main menu
 *  - [*] Title Search
 *  - [L] Theme Toggle
 *  - [ESC] Close active modals / search / drawers
 */
export function initKeyboardShortcuts(handlers = {}) {
  window.addEventListener('keydown', (e) => {
    // If typing in input or textarea, ignore single key triggers except Escape
    const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea') {
      if (e.key === 'Escape') {
        if (handlers.onEscape) handlers.onEscape();
      }
      return;
    }

    if (e.key === '1') {
      if (handlers.onDigit1) handlers.onDigit1();
    } else if (e.key === '2') {
      if (handlers.onDigit2) handlers.onDigit2();
    } else if (e.key === '3') {
      if (handlers.onDigit3) handlers.onDigit3();
    } else if (e.key === '4') {
      if (handlers.onDigit4) handlers.onDigit4();
    } else if (e.key === '*' || (e.shiftKey && e.key === '8')) {
      if (handlers.onSearch) handlers.onSearch();
    } else if (e.key === 'l' || e.key === 'L') {
      if (handlers.onThemeToggle) handlers.onThemeToggle();
    } else if (e.key === 'Escape') {
      if (handlers.onEscape) handlers.onEscape();
    }
  });
}
