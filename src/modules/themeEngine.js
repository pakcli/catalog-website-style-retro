/**
 * ============================================================================
 * MODULE: Theme Engine & Obsidian-Style Accent Color Picker
 * Feature: v01_01-theme-colour-accent-like-obsidian-one-colour-pick
 * Purpose: Single-accent color picker driving the entire vintage CRT interface.
 * ============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ArcadeThemeEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Constants & Storage Keys
  const STORAGE_KEY_ACCENT = 'arcade_accent_color';
  const STORAGE_KEY_MODE = 'arcade_theme_mode';
  const DEFAULT_ACCENT = '#b0a84a'; // Vintage Olive Gold
  const DEFAULT_MODE = 'theme-dark';

  // Authentic Vintage Computing Accent Presets (inspired by Obsidian & CRT monitors)
  const ACCENT_PRESETS = [
    { id: 'olive',   name: 'Retro Olive',     hex: '#b0a84a', desc: 'Classic 3.5" Diskette Olive Gold (Default)' },
    { id: 'matrix',  name: 'VT100 Phosphor',  hex: '#22c55e', desc: 'Monochrome Green Terminal Phosphor' },
    { id: 'amber',   name: 'Amber CRT',       hex: '#f59e0b', desc: 'Monochrome Amber CRT Monitor' },
    { id: 'cyan',    name: 'Cyberpunk Cyan',  hex: '#06b6d4', desc: 'Neon Arcade Blue Screen' },
    { id: 'purple',  name: 'Synthwave Neon',  hex: '#a855f7', desc: '80s Arcade Cabinet Purple' },
    { id: 'red',     name: 'Laser Crimson',   hex: '#ef4444', desc: 'Warning LED & Emergency Red' },
    { id: 'silver',  name: 'Monolith Silver', hex: '#94a3b8', desc: 'Clean Retro Paper Gray' }
  ];

  /**
   * Parse hex string to RGB object
   * @param {string} hex - e.g. '#b0a84a'
   * @returns {{r: number, g: number, b: number}}
   */
  function hexToRgb(hex) {
    let clean = hex.replace('#', '').trim();
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  /**
   * Convert RGB to Hex string
   * @param {number} r
   * @param {number} g
   * @param {number} b
   * @returns {string} e.g. '#B0A84A'
   */
  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  }

  /**
   * Check if a given string is a valid 3 or 6 digit hex color
   * @param {string} hex
   * @returns {boolean}
   */
  function isValidHex(hex) {
    return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex.trim());
  }

  /**
   * Normalize hex format to uppercase 6-digit with #
   * @param {string} hex
   * @returns {string}
   */
  function normalizeHex(hex) {
    let clean = hex.replace('#', '').trim();
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    return '#' + clean.toUpperCase();
  }

  /**
   * Convert RGB (0-255) to HSL (h: 0-360, s: 0-100, l: 0-100)
   */
  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  /**
   * Convert HSL (h: 0-360, s: 0-100, l: 0-100) to 6-digit Hex string
   */
  function hslToHex(h, s, l) {
    h = ((h % 360) + 360) % 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
  }

  /**
  /**
   * Apply accent properties and let theme.css relative OKLCH calculations
   * dynamically tint all backgrounds, panels, and borders (identically to Obsidian Vintage Computer).
   */
  function applySurfacePalette(hexColor, mode) {
    const normalized = normalizeHex(hexColor || getAccent());
    const rgb = hexToRgb(normalized);

    const fontMono = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";

    const targets = [document.documentElement, document.body].filter(Boolean);
    targets.forEach(el => {
      el.style.setProperty('--font-monospace', fontMono);
      el.style.setProperty('--font-text', fontMono);
      el.style.setProperty('--font-interface', fontMono);
      el.style.setProperty('--font-default', fontMono);

      // Set the master accent custom property that drives theme.css relative OKLCH calculations
      el.style.setProperty('--interactive-accent', normalized);
      el.style.setProperty('--interactive-accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
      el.style.setProperty('--interactive-accent-glow', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)`);
      el.style.setProperty('--interactive-accent-subtle', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`);

      // Clean up any stale inline overrides so theme.css relative OKLCH rules take full effect natively
      const overrideKeys = [
        '--base-accent',
        '--accent-1',
        '--accent-2',
        '--titlebar-background',
        '--background-tertiary',
        '--background-secondary',
        '--background-secondary-alt',
        '--background-primary-alt',
        '--background-primary',
        '--background-paper',
        '--bases-cards-background',
        '--code-background'
      ];
      overrideKeys.forEach(key => el.style.removeProperty(key));

      // In Obsidian Vintage Computer, .theme-light uses Obsidian core default dark text.
      // Outside Electron, ensure web browser renders crisp high-contrast dark text for light mode:
      if (mode === 'theme-light') {
        el.style.setProperty('--text-normal', 'oklch(20% 0 0)');
        el.style.setProperty('--text-muted', 'oklch(42% 0 0)');
        el.style.setProperty('--text-faint', 'oklch(58% 0 0)');
      } else {
        el.style.removeProperty('--text-normal');
        el.style.removeProperty('--text-muted');
        el.style.removeProperty('--text-faint');
      }
    });
  }

  /**
   * Apply accent color to document root and broadcast across components & iframes
   * @param {string} hexColor
   * @param {boolean} [persist=true]
   */
  function setAccent(hexColor, persist = true) {
    if (!isValidHex(hexColor)) {
      console.warn('[ThemeEngine] Invalid hex color:', hexColor);
      return;
    }

    const normalized = normalizeHex(hexColor);
    const rgb = hexToRgb(normalized);

    // 1. Set CSS Custom Properties & Solid Surface Palette on html and body
    applySurfacePalette(normalized, getThemeMode());

    // 2. Persist to localStorage
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY_ACCENT, normalized);
      } catch (e) {
        console.warn('[ThemeEngine] LocalStorage access blocked:', e);
      }
    }

    // 3. Synchronize all DOM telemetry elements with data-sync
    syncDomTelemetry(normalized);

    // 4. Dispatch DOM custom event for components & widgets
    const event = new CustomEvent('arcade:accent-change', {
      detail: {
        color: normalized,
        rgb: rgb,
        isDefault: normalized.toLowerCase() === DEFAULT_ACCENT.toLowerCase()
      }
    });
    window.dispatchEvent(event);

    // 5. Broadcast to any open cartridge iframes (e.g. Playground Stage)
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(frame => {
      try {
        frame.contentWindow.postMessage({
          type: 'ARCADE_ACCENT_CHANGE',
          color: normalized
        }, '*');
      } catch (err) {
        // Cross-origin fallback ignore
      }
    });
  }

  /**
   * Update text and styling on all telemetry nodes across the document
   * @param {string} hexColor
   */
  function syncDomTelemetry(hexColor) {
    // Sync Hex label elements (e.g., Hero "THEME: #B0A84A" or Footer "ACCENT: #B0A84A")
    document.querySelectorAll('[data-sync="accent-hex"]').forEach(el => {
      el.textContent = hexColor;
    });

    // Sync swatch preview buttons or pill indicators
    document.querySelectorAll('[data-sync="accent-swatch"]').forEach(el => {
      el.style.backgroundColor = hexColor;
    });

    // Sync input fields
    document.querySelectorAll('input[data-sync="accent-input"]').forEach(input => {
      if (input.type === 'color') {
        input.value = hexColor;
      } else {
        input.value = hexColor.replace('#', '');
      }
    });
  }

  /**
   * Get currently active accent color
   * @returns {string}
   */
  function getAccent() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ACCENT);
      if (stored && isValidHex(stored)) {
        return normalizeHex(stored);
      }
    } catch (e) {
      // Ignore
    }
    return normalizeHex(DEFAULT_ACCENT);
  }

  /**
   * Reset accent color to retro olive default
   */
  function resetAccent() {
    setAccent(DEFAULT_ACCENT, true);
  }

  /**
   * Synchronize theme toggle button icons and labels across the DOM
   * @param {'theme-dark'|'theme-light'} mode
   */
  function syncThemeToggleButtons(mode) {
    const isDark = mode === 'theme-dark';
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');

    if (themeIcon) {
      themeIcon.textContent = isDark ? '☀️' : '🌙';
    }
    if (themeText) {
      const currentTxt = (themeText.textContent || '').trim();
      const useShort = currentTxt === 'Light' || currentTxt === 'Dark';
      themeText.textContent = isDark
        ? (useShort ? 'Light' : 'Light Mode')
        : (useShort ? 'Dark' : 'Dark Mode');
    }

    document.querySelectorAll('[data-sync="theme-mode"]').forEach(el => {
      el.textContent = isDark ? 'DARK' : 'LIGHT';
    });
  }

  /**
   * Bind click listeners to #themeToggleBtn and [data-action="toggle-theme"]
   */
  function bindThemeButtons() {
    const btns = document.querySelectorAll('#themeToggleBtn, [data-action="toggle-theme"]');
    btns.forEach(btn => {
      if (btn.dataset.themeBound === 'true') return;
      btn.dataset.themeBound = 'true';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleThemeMode();
      });
    });
    syncThemeToggleButtons(getThemeMode());
  }

  /**
   * Set theme mode ('theme-dark' or 'theme-light')
   * @param {'theme-dark'|'theme-light'} mode
   */
  function setThemeMode(mode) {
    const targetMode = mode === 'theme-light' ? 'theme-light' : 'theme-dark';
    const body = document.body;
    const html = document.documentElement;

    html.classList.remove('theme-dark', 'theme-light');
    html.classList.add(targetMode);
    html.setAttribute('data-theme', targetMode);

    if (body) {
      body.classList.remove('theme-dark', 'theme-light');
      body.classList.add(targetMode);
      body.setAttribute('data-theme', targetMode);
    }

    try {
      localStorage.setItem(STORAGE_KEY_MODE, targetMode);
    } catch (e) {
      // Ignore
    }

    applySurfacePalette(getAccent(), targetMode);
    syncThemeToggleButtons(targetMode);

    // Dynamically synchronize app screenshot thumbnails to match the active theme mode
    document.querySelectorAll('.thumb-img[data-thumb-slug]').forEach(img => {
      const slug = img.dataset.thumbSlug;
      if (!slug) return;
      const targetSrc = targetMode === 'theme-light' ? `apps/${slug}_img-lightmode.webp` : `apps/${slug}_img-darkmode.webp`;
      img.dataset.fallbackTried = '';
      img.src = targetSrc;
    });

    // Broadcast theme change event
    window.dispatchEvent(new CustomEvent('arcade:theme-mode-change', {
      detail: { mode: targetMode }
    }));
  }

  /**
   * Toggle between dark and light themes
   */
  function toggleThemeMode() {
    const html = document.documentElement;
    const body = document.body;
    const isCurrentlyLight =
      (body && body.classList.contains('theme-light')) ||
      html.classList.contains('theme-light') ||
      getThemeMode() === 'theme-light';

    const next = isCurrentlyLight ? 'theme-dark' : 'theme-light';
    setThemeMode(next);
    return next;
  }

  /**
   * Get active theme mode
   * @returns {'theme-dark'|'theme-light'}
   */
  function getThemeMode() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_MODE);
      if (stored === 'theme-light' || stored === 'theme-dark') {
        return stored;
      }
    } catch (e) {
      // Ignore
    }
    return DEFAULT_MODE;
  }

  /**
   * Initialize Theme Engine: execute immediately before render
   */
  function init() {
    const activeAccent = getAccent();
    const activeMode = getThemeMode();

    // Cleanly apply mode to html & body (removing any hardcoded default class first)
    setThemeMode(activeMode);

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setThemeMode(getThemeMode());
        bindThemeButtons();
      });
    } else {
      bindThemeButtons();
    }

    // Apply accent custom properties
    setAccent(activeAccent, false);

    // Cross-tab synchronization via storage event
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY_ACCENT && e.newValue && isValidHex(e.newValue)) {
        setAccent(e.newValue, false);
      }
      if (e.key === STORAGE_KEY_MODE && e.newValue) {
        setThemeMode(e.newValue);
      }
    });

    // Listen for child iframe messages requesting accent color or notifying of changes
    window.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'ARCADE_REQUEST_ACCENT') {
        if (e.source) {
          e.source.postMessage({
            type: 'ARCADE_ACCENT_CHANGE',
            color: getAccent()
          }, '*');
        }
      }
    });

    console.log(`[ArcadeThemeEngine] Initialized. Mode: ${activeMode} | Accent: ${activeAccent}`);
  }

  // Auto-init on script load
  if (typeof document !== 'undefined') {
    init();
  }

  return {
    presets: ACCENT_PRESETS,
    defaultAccent: DEFAULT_ACCENT,
    setAccent: setAccent,
    getAccent: getAccent,
    resetAccent: resetAccent,
    setThemeMode: setThemeMode,
    toggleThemeMode: toggleThemeMode,
    getThemeMode: getThemeMode,
    isValidHex: isValidHex,
    normalizeHex: normalizeHex,
    init: init
  };
});
