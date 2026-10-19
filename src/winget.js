// ==========================================
// MODULE: modules/theme-engine.js
// ==========================================
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


;
// ==========================================
// MODULE: components/accent-picker-modal.js
// ==========================================
/**
 * ============================================================================
 * COMPONENT: Obsidian-Style Accent Color Picker Modal
 * Feature: v01_01-theme-colour-accent-like-obsidian-one-colour-pick
 * Purpose: Interactive retro modal allowing users to pick an accent color,
 *          select vintage CRT presets, or reset to default #b0a84a.
 * ============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['../modules/theme-engine'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('../modules/theme-engine'));
  } else {
    root.ArcadeAccentPicker = factory(root.ArcadeThemeEngine);
  }
})(typeof self !== 'undefined' ? self : this, function (ThemeEngine) {
  'use strict';

  let modalBackdrop = null;
  let hexInput = null;
  let colorPickerInput = null;
  let swatchPreview = null;
  let presetContainer = null;
  let activeColor = '#B0A84A';

  /**
   * Build the retro modal DOM structure
   */
  function renderModalDOM() {
    if (document.getElementById('arcade-accent-modal-backdrop')) {
      modalBackdrop = document.getElementById('arcade-accent-modal-backdrop');
      return;
    }

    const backdrop = document.createElement('div');
    backdrop.id = 'arcade-accent-modal-backdrop';
    backdrop.className = 'arcade-modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-labelledby', 'accent-modal-title');

    backdrop.innerHTML = `
      <div class="arcade-modal-window" onclick="event.stopPropagation()">
        <!-- Titlebar -->
        <div class="arcade-modal-titlebar">
          <div class="arcade-modal-title" id="accent-modal-title">
            <span>🎨</span>
            <span>ACCENT COLOR RESOLVER • RETRO OS</span>
          </div>
          <button class="arcade-modal-close-btn" id="arcade-accent-close-btn" title="Close (ESC)">✕</button>
        </div>

        <!-- Body -->
        <div class="arcade-modal-body">
          <p class="arcade-modal-hint">
            Customize the system accent color. Just like Obsidian, picking a single color dynamically re-calculates all CRT glows, beveled borders, card shutters, and active states.
          </p>

          <!-- Active Swatch & Hex Input -->
          <div class="arcade-active-color-card">
            <div class="arcade-swatch-preview" id="arcade-active-swatch-preview" title="Click to open color wheel">
              <input type="color" id="arcade-native-color-picker" value="${activeColor}" title="Pick custom accent color">
            </div>
            <div class="arcade-color-details">
              <div class="arcade-hex-input-group">
                <span class="arcade-hex-prefix">HEX #</span>
                <input type="text" id="arcade-hex-input" class="arcade-hex-input" maxlength="6" value="${activeColor.replace('#', '')}" spellcheck="false">
                <label for="arcade-native-color-picker" class="arcade-pick-btn" title="Open Native Color Palette">🎨 PICK</label>
              </div>
              <span style="font-size: 10px; color: var(--text-faint); margin-top: 2px;">Type hex code or click swatch</span>
            </div>
          </div>

          <!-- Presets Section -->
          <div class="arcade-swatches-label">VINTAGE MONITOR PRESETS</div>
          <div class="arcade-swatches-grid" id="arcade-presets-grid"></div>

          <!-- Footer Actions -->
          <div class="arcade-modal-footer">
            <button class="arcade-reset-accent-btn" id="arcade-reset-accent-btn" title="Restore Default Retro Olive (#b0a84a)">
              ↺ Reset Default (#B0A84A)
            </button>
            <button class="arcade-apply-btn" id="arcade-apply-accent-btn">
              ✔ Apply Accent
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    modalBackdrop = backdrop;

    // Cache elements
    hexInput = backdrop.querySelector('#arcade-hex-input');
    colorPickerInput = backdrop.querySelector('#arcade-native-color-picker');
    swatchPreview = backdrop.querySelector('#arcade-active-swatch-preview');
    presetContainer = backdrop.querySelector('#arcade-presets-grid');

    // Build presets
    renderPresets();

    // Attach listeners
    attachEventListeners();
  }

  /**
   * Render preset swatches into the grid
   */
  function renderPresets() {
    if (!presetContainer || !ThemeEngine) return;
    presetContainer.innerHTML = '';

    ThemeEngine.presets.forEach(p => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'arcade-swatch-pill';
      btn.style.backgroundColor = p.hex;
      btn.title = `${p.name} (${p.hex}) - ${p.desc}`;
      btn.dataset.hex = p.hex;

      if (p.hex.toUpperCase() === activeColor.toUpperCase()) {
        btn.classList.add('is-active');
      }

      btn.addEventListener('click', () => {
        applyColor(p.hex);
      });

      presetContainer.appendChild(btn);
    });
  }

  /**
   * Apply selected color to state and UI
   * @param {string} hex
   */
  function applyColor(hex) {
    if (!ThemeEngine) return;
    if (!ThemeEngine.isValidHex(hex)) return;

    activeColor = ThemeEngine.normalizeHex(hex);

    // Update Theme Engine
    ThemeEngine.setAccent(activeColor, true);

    // Update Modal UI
    updateModalUI();
  }

  /**
   * Synchronize Modal UI controls with activeColor
   */
  function updateModalUI() {
    if (!modalBackdrop) return;

    const normalized = activeColor.toUpperCase();
    if (hexInput) hexInput.value = normalized.replace('#', '');
    if (colorPickerInput) colorPickerInput.value = normalized;
    if (swatchPreview) swatchPreview.style.backgroundColor = normalized;

    // Highlight active preset
    if (presetContainer) {
      presetContainer.querySelectorAll('.arcade-swatch-pill').forEach(btn => {
        if (btn.dataset.hex.toUpperCase() === normalized) {
          btn.classList.add('is-active');
        } else {
          btn.classList.remove('is-active');
        }
      });
    }
  }

  /**
   * Attach modal event listeners
   */
  function attachEventListeners() {
    // Backdrop click closes modal
    modalBackdrop.addEventListener('click', close);

    // Close button
    const closeBtn = modalBackdrop.querySelector('#arcade-accent-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', close);

    // Apply button
    const applyBtn = modalBackdrop.querySelector('#arcade-apply-accent-btn');
    if (applyBtn) applyBtn.addEventListener('click', close);

    // Reset button (Obsidian reset pattern)
    const resetBtn = modalBackdrop.querySelector('#arcade-reset-accent-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (ThemeEngine) {
          ThemeEngine.resetAccent();
          activeColor = ThemeEngine.defaultAccent;
          updateModalUI();
        }
      });
    }

    // Native color picker changes
    if (colorPickerInput) {
      colorPickerInput.addEventListener('input', (e) => {
        applyColor(e.target.value);
      });
    }

    // Hex text input typing
    if (hexInput) {
      hexInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val.length === 3 || val.length === 6) {
          if (ThemeEngine && ThemeEngine.isValidHex(val)) {
            applyColor(val);
          }
        }
      });

      hexInput.addEventListener('blur', () => {
        // Restore formatted value on blur
        hexInput.value = activeColor.replace('#', '');
      });
    }

    // Global ESC key closes modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) {
        close();
      }
    });
  }

  /**
   * Open the Accent Picker Modal
   */
  function open() {
    renderModalDOM();
    if (ThemeEngine) {
      activeColor = ThemeEngine.getAccent();
    }
    updateModalUI();
    modalBackdrop.classList.add('is-open');
    if (hexInput) hexInput.focus();
  }

  /**
   * Close the Accent Picker Modal
   */
  function close() {
    if (modalBackdrop) {
      modalBackdrop.classList.remove('is-open');
    }
  }

  /**
   * Toggle modal visibility
   */
  function toggle() {
    if (isOpen()) {
      close();
    } else {
      open();
    }
  }

  /**
   * Check if modal is currently open
   * @returns {boolean}
   */
  function isOpen() {
    return modalBackdrop && modalBackdrop.classList.contains('is-open');
  }

  /**
   * Bind all DOM buttons with [data-action="open-accent-picker"]
   */
  function bindTriggers() {
    document.querySelectorAll('[data-action="open-accent-picker"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        open();
      });
    });
  }

  // Initialize triggers when DOM is ready
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bindTriggers);
    } else {
      bindTriggers();
    }
  }

  return {
    open: open,
    close: close,
    toggle: toggle,
    isOpen: isOpen,
    bindTriggers: bindTriggers
  };
});


;
// ==========================================
// MODULE: modules/winget.js
// ==========================================
/**
 * ============================================================================
 * MODULE: Emergency Floating Quick Nav Pod (winget.js)
 * Purpose: Multimodal rescue navigation pod (2x2 grid) triggered by:
 *          1. Mobile 5-finger touch hold (0.5s)
 *          2. Desktop typing 'dowkwkwk' (< 1.0s)
 *          3. Global function window.toggleQuickNavPod()
 * ============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['./theme-engine'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./theme-engine'));
  } else {
    root.ArcadeWinget = factory(root.ArcadeThemeEngine);
  }
})(typeof self !== 'undefined' ? self : this, function (ThemeEngine) {
  'use strict';

  let podContainer = null;
  let keyBuffer = '';
  let keyTimer = null;
  let touchHoldTimer = null;

  /**
   * Render Floating Pod HTML into DOM
   */
  function renderPodDOM() {
    if (document.getElementById('arcade-floating-pod')) {
      podContainer = document.getElementById('arcade-floating-pod');
      return;
    }

    const pod = document.createElement('div');
    pod.id = 'arcade-floating-pod';
    pod.className = 'arcade-floating-pod';
    pod.setAttribute('role', 'complementary');
    pod.setAttribute('aria-label', 'Emergency Quick Nav Pod');

    pod.innerHTML = `
      <div class="arcade-pod-card">
        <div class="arcade-pod-header">
          <span>🕹️ QUICK NAV POD</span>
          <span style="font-size: 8px; opacity: 0.7;">[ESC]</span>
        </div>
        <div class="arcade-pod-grid">
          <button class="arcade-pod-item" id="winget-btn-back" title="Go back one step">
            <span class="pod-icon">◀</span>
            <span class="pod-label">Back</span>
          </button>
          <a href="page-apps.html" class="arcade-pod-item" id="winget-btn-home" title="Return to Arcade Library">
            <span class="pod-icon">🏠</span>
            <span class="pod-label">Library</span>
          </a>
          <button class="arcade-pod-item" id="winget-btn-accent" title="Open Obsidian Accent Picker">
            <span class="pod-icon">🎨</span>
            <span class="pod-label">Accent</span>
          </button>
          <button class="arcade-pod-item" id="winget-btn-close" title="Close pod">
            <span class="pod-icon">✕</span>
            <span class="pod-label">Close</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(pod);
    podContainer = pod;

    // Attach button listeners
    pod.querySelector('#winget-btn-back').addEventListener('click', () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = 'page-apps.html';
      }
      hide();
    });

    pod.querySelector('#winget-btn-accent').addEventListener('click', () => {
      hide();
      if (window.ArcadeAccentPicker) {
        window.ArcadeAccentPicker.open();
      }
    });

    pod.querySelector('#winget-btn-close').addEventListener('click', hide);
  }

  /**
   * Show the quick nav pod
   */
  function show() {
    renderPodDOM();
    podContainer.classList.add('is-visible');

    // Haptic feedback if supported
    if ('vibrate' in navigator) {
      try { navigator.vibrate([40, 30, 40]); } catch (e) {}
    }
  }

  /**
   * Hide the quick nav pod
   */
  function hide() {
    if (podContainer) {
      podContainer.classList.remove('is-visible');
    }
  }

  /**
   * Toggle pod visibility
   */
  function toggle() {
    if (isVisible()) {
      hide();
    } else {
      show();
    }
  }

  /**
   * Check if pod is visible
   * @returns {boolean}
   */
  function isVisible() {
    return podContainer && podContainer.classList.contains('is-visible');
  }

  /**
   * Setup Multimodal Triggers:
   * 1. Secret typing 'dowkwkwk' (< 1.0s)
   * 2. 5-Finger touch hold on mobile (500ms)
   * 3. Global ESC key
   */
  function setupTriggers() {
    // 1. Desktop secret typing trigger 'dowkwkwk'
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isVisible()) {
        hide();
        return;
      }

      // Ignore input inside form fields
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) {
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        keyBuffer += e.key.toLowerCase();

        clearTimeout(keyTimer);
        keyTimer = setTimeout(() => {
          keyBuffer = '';
        }, 1000); // 1.0 second typing window

        if (keyBuffer.includes('dowkwkwk')) {
          keyBuffer = '';
          toggle();
        }
      }
    });

    // 2. Mobile 5-Finger Touch Hold Trigger
    window.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length >= 5) {
        clearTimeout(touchHoldTimer);
        touchHoldTimer = setTimeout(() => {
          toggle();
        }, 500); // 500ms hold
      } else {
        clearTimeout(touchHoldTimer);
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      clearTimeout(touchHoldTimer);
    }, { passive: true });

    window.addEventListener('touchcancel', () => {
      clearTimeout(touchHoldTimer);
    }, { passive: true });
  }

  // Initialize
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        renderPodDOM();
        setupTriggers();
      });
    } else {
      renderPodDOM();
      setupTriggers();
    }
  }

  // Expose global convenience function
  if (typeof window !== 'undefined') {
    window.toggleQuickNavPod = toggle;
  }

  return {
    show: show,
    hide: hide,
    toggle: toggle,
    isVisible: isVisible
  };
});

