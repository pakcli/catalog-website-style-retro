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
// MODULE: modules/breadcrumb.js
// ==========================================
/**
 * ============================================================================
 * MODULE: Breadcrumb Module (ArcadeBreadcrumb)
 * Standards:
 * - Desktop Library:    home / apps >
 * - Mobile Library:     🏠 / apps >
 * - Desktop Playground: home / apps / [namaapp]  [Playground]
 * - Mobile Playground:  🏠 / apps / [namaapp]  🎮
 * ============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ArcadeBreadcrumb = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Update virtual CLI terminal breadcrumb in the navbar
   * @param {string|object} options - app slug string or options object { mode, appName, category }
   */
  function update(options) {
    const breadcrumbEl = document.querySelector('[data-role="cli-breadcrumb"]');
    if (!breadcrumbEl) return;

    let mode = 'library';
    let appSlug = '';

    if (typeof options === 'string') {
      appSlug = options;
      mode = appSlug ? 'playground' : 'library';
    } else if (options && typeof options === 'object') {
      mode = options.mode || (options.slug || options.appName || options.appId ? 'playground' : 'library');
      appSlug = options.slug || options.appName || options.appId || '';
    } else {
      const isPlayground = window.location.pathname.includes('/playground') || !!document.getElementById('breadcrumbAppName');
      mode = isPlayground ? 'playground' : 'library';
    }

    if (mode === 'playground') {
      const appEl = document.getElementById('breadcrumbAppName');
      if (appEl && appSlug) {
        appEl.textContent = appSlug;
      }
    } else {
      const pageSegment = document.getElementById('promptPageSegment');
      const pageSep = document.getElementById('promptSepPage');
      if (pageSegment) {
        if (options && options.category && options.category !== 'all' && options.category !== 'vibe-code-arcade') {
          pageSegment.textContent = options.category;
          pageSegment.style.display = 'inline-block';
          if (pageSep) pageSep.style.display = 'inline';
        } else if (appSlug && appSlug !== 'all' && appSlug !== 'vibe-code-arcade') {
          pageSegment.textContent = appSlug;
          pageSegment.style.display = 'inline-block';
          if (pageSep) pageSep.style.display = 'inline';
        } else {
          pageSegment.textContent = '';
          pageSegment.style.display = 'none';
          if (pageSep) pageSep.style.display = 'none';
        }
      }
    }
  }

  /**
   * Initialize breadcrumb component
   */
  function init() {
    // Detect context
    const isPlayground = window.location.pathname.includes('/playground') || !!document.getElementById('breadcrumbAppName');
    if (!isPlayground) {
      update({ mode: 'library' });
    }
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  return {
    update: update,
    init: init
  };
});


;
// ==========================================
// MODULE: modules/navigation-url.js
// ==========================================
/**
 * ============================================================================
 * MODULE: Navigation URL Router & Breadcrumb Manager
 * Purpose: Clean naked URL architecture, auto-resume session, terminal breadcrumb
 *          and single-element sticky navbar auto-hide behavior.
 * ============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ArcadeRouter = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEY_LAST_APP = 'arcade_last_playground_app';
  let lastScrollY = window.scrollY || 0;
  let navbarEl = null;

  /**
   * Parse the current path and query parameters cleanly
   * @returns {{ route: string, appId: string|null, category: string|null }}
   */
  function parseCurrentRoute() {
    const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
    const params = new URLSearchParams(window.location.search);

    // Default detection
    let route = 'apps';
    let appId = params.get('app') || null;
    let category = params.get('sector') || params.get('cat') || null;

    if (pathname.includes('/page-playground') || pathname.includes('/playground')) {
      route = 'playground';
      const parts = pathname.split(pathname.includes('/playground/') ? '/playground/' : '/page-playground');
      if (parts[1]) {
        appId = parts[1].split('/')[0].replace(/\.html$/, '');
      }
    } else if (pathname.includes('/winget')) {
      route = 'winget';
    } else if (pathname.includes('/apps/') && !pathname.endsWith('/apps')) {
      const parts = pathname.split('/apps/');
      if (parts[1]) {
        route = 'standalone';
        appId = parts[1].split('/')[0];
      }
    } else {
      route = 'apps';
    }

    return { route, appId, category };
  }

  /**
   * Redirect to the master Apps catalog
   */
  function redirectToApps() {
    window.location.href = 'page-apps.html';
  }

  /**
   * Redirect to interactive Playground sandbox with specified or auto-resumed app
   * @param {string} [appId]
   */
  function redirectToPlayground(appId) {
    const target = appId || getLastApp() || 'ksi';
    saveLastApp(target);
    window.location.href = `page-playground.html?app=${encodeURIComponent(target)}`;
  }

  /**
   * Redirect to standalone Winget emergency pod
   */
  function redirectToWinget() {
    window.location.href = 'winget.html';
  }

  /**
   * Save last visited playground app for auto-resume
   * @param {string} appId
   */
  function saveLastApp(appId) {
    if (!appId) return;
    try {
      localStorage.setItem(STORAGE_KEY_LAST_APP, appId);
    } catch (e) {
      // Ignore
    }
  }

  /**
   * Get last visited playground app
   * @returns {string|null}
   */
  function getLastApp() {
    try {
      return localStorage.getItem(STORAGE_KEY_LAST_APP) || null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Update virtual CLI terminal breadcrumb in the navbar
   * @param {string|object} options - app slug string or options object { mode, appName, category }
   */
  function updateBreadcrumb(options) {
    if (typeof root !== 'undefined' && root.ArcadeBreadcrumb && typeof root.ArcadeBreadcrumb.update === 'function') {
      root.ArcadeBreadcrumb.update(options);
      return;
    }
    const breadcrumbEl = document.querySelector('[data-role="cli-breadcrumb"]');
    if (!breadcrumbEl) return;

    let appSlug = typeof options === 'string' ? options : (options && (options.slug || options.appName || options.appId)) || '';
    const appEl = document.getElementById('breadcrumbAppName');
    if (appEl && appSlug) {
      appEl.textContent = appSlug;
      return;
    }

    const pageSegment = document.getElementById('promptPageSegment');
    const pageSep = document.getElementById('promptSepPage');
    if (pageSegment) {
      if (appSlug && appSlug !== 'all' && appSlug !== 'vibe-code-arcade') {
        pageSegment.textContent = appSlug;
        pageSegment.style.display = 'inline-block';
        if (pageSep) pageSep.style.display = 'inline';
      } else {
        pageSegment.textContent = '';
        pageSegment.style.display = 'none';
        if (pageSep) pageSep.style.display = 'none';
      }
    }
  }

  /**
   * Initialize Single-Element Sticky Navbar
   * - ZERO new DOM elements created.
   * - Locks navbar cleanly at top of viewport when scrolling past the Hero banner.
   */
  function initStickyNavbarAutoHide() {
    navbarEl = document.querySelector('[data-role="sticky-navbar"]') || document.querySelector('.topbar-container') || document.querySelector('header.view-header');
    if (!navbarEl) return;

    navbarEl.classList.add('sticky-topbar');
    navbarEl.style.position = 'sticky';
    navbarEl.style.top = '8px';
    navbarEl.style.zIndex = '1000';
    navbarEl.style.transform = 'translateY(0)';
    navbarEl.style.transition = 'box-shadow 0.2s ease, background-color 0.2s ease, border-color 0.2s ease';

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY || document.documentElement.scrollTop || 0;

      if (currentScrollY > 140) {
        navbarEl.classList.add('is-stuck');
      } else {
        navbarEl.classList.remove('is-stuck');
      }

      lastScrollY = currentScrollY;
    }, { passive: true });
  }

  /**
   * Toggle Grand Fullscreen Mode
   */
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('[Router] Fullscreen request error:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  /**
   * Initialize routing listeners and buttons
   */
  function init() {
    initStickyNavbarAutoHide();

    // Bind Fullscreen button
    document.querySelectorAll('[data-action="toggle-fullscreen"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleFullscreen();
      });
    });

    const routeInfo = parseCurrentRoute();
    if (routeInfo.route === 'playground' && !routeInfo.appId) {
      // Auto-resume last visited app
      const last = getLastApp();
      if (last) {
        console.log(`[Router] Auto-resuming last visited playground app: ${last}`);
      }
    }
  }

  // Auto-init on script load
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  return {
    parseCurrentRoute: parseCurrentRoute,
    redirectToApps: redirectToApps,
    redirectToPlayground: redirectToPlayground,
    redirectToWinget: redirectToWinget,
    saveLastApp: saveLastApp,
    getLastApp: getLastApp,
    updateBreadcrumb: updateBreadcrumb,
    toggleFullscreen: toggleFullscreen,
    init: init
  };
});


;
// ==========================================
// MODULE: modules/markdown-processor.js
// ==========================================
/**
 * ============================================================================
 * MODULE: Markdown & Frontmatter Processor (src/modules/markdown-processor.js)
 * Purpose: Client-side Markdown parser and YAML Frontmatter extractor.
 *          Parses app metadata, instructions, guided steps, and code blocks
 *          with zero external dependencies.
 * ============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ArcadeMarkdown = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Parse YAML frontmatter from raw Markdown text
   * @param {string} markdownText - Raw markdown document string
   * @returns {Object} Extracted frontmatter key-value pairs
   */
  function parseFrontmatter(markdownText) {
    if (!markdownText || typeof markdownText !== 'string') return {};
    const match = markdownText.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) return {};

    const yamlBlock = match[1];
    const data = {};
    const lines = yamlBlock.split(/\r?\n/);

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      const colonIdx = trimmed.indexOf(':');
      if (colonIdx === -1) return;

      const key = trimmed.slice(0, colonIdx).trim();
      let value = trimmed.slice(colonIdx + 1).trim();

      // Strip enclosing single or double quotes
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      // Handle YAML arrays: ["tag1", "tag2"] or [tag1, tag2]
      if (value.startsWith('[') && value.endsWith(']')) {
        const inner = value.slice(1, -1).trim();
        data[key] = inner ? inner.split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')) : [];
      } else {
        data[key] = value;
      }
    });

    return data;
  }

  /**
   * Extract body content after YAML frontmatter
   * @param {string} markdownText
   * @returns {string}
   */
  function stripFrontmatter(markdownText) {
    if (!markdownText || typeof markdownText !== 'string') return '';
    return markdownText.replace(/^---\r?\n[\s\S]*?\r?\n---(\r?\n)?/, '').trim();
  }

  /**
   * Lightweight markdown-to-HTML parser for guided steps and descriptions
   * @param {string} md
   * @returns {string} HTML string
   */
  function renderMarkdown(md) {
    if (!md) return '';
    const body = stripFrontmatter(md);

    return body
      // Code blocks
      .replace(/```([a-zA-Z0-9_-]*)\r?\n([\s\S]*?)```/g, function (_, lang, code) {
        const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<pre class="code-block" data-lang="${lang}"><code>${escaped}</code></pre>`;
      })
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold & Italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Blockquotes
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      // Unordered lists
      .replace(/^\s*[-*]\s+(.*)$/gim, '<li>$1</li>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Paragraphs (double newlines)
      .replace(/\n\s*\n/g, '</p><p>')
      .replace(/^(?!<[a-z/])([\s\S]+?)(?=(<\/?(h[1-6]|pre|code|ul|ol|li|blockquote|p)|$))/gim, '<p>$1</p>');
  }

  /**
   * Extract and normalize app cartridge metadata
   * @param {string} rawMd
   * @param {string} fallbackSlug
   */
  function extractAppMetadata(rawMd, fallbackSlug) {
    const fm = parseFrontmatter(rawMd);
    const slug = fm.slug || fallbackSlug || 'unknown-app';
    const sector = (fm.category || fm.sector || 'tools').toLowerCase();

    return {
      slug: slug,
      title: fm.title || slug.toUpperCase(),
      desc: fm.desc || fm.description || 'Vintage computing interactive cartridge.',
      category: sector,
      tags: Array.isArray(fm.tags) ? fm.tags : (fm.tags ? [fm.tags] : ['offline', 'retro']),
      icon: fm.icon || '💾',
      author: fm.author || 'Fadhli S Lubis',
      version: fm.version || '1.0.0',
      rawMarkdown: rawMd,
      frontmatter: fm
    };
  }

  return {
    parseFrontmatter: parseFrontmatter,
    stripFrontmatter: stripFrontmatter,
    renderMarkdown: renderMarkdown,
    extractAppMetadata: extractAppMetadata
  };
});


;
// ==========================================
// MODULE: modules/download-module.js
// ==========================================
/**
 * ============================================================================
 * MODULE: Standalone Cartridge Download & Blob Synthesizer (download-module.js)
 * Purpose: Guarantees 100% working offline/online single-file .html downloads
 *          and standalone launches across all 6 Vintage Computing Arcade disks.
 * ============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ArcadeDownloader = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const CARTRIDGE_META = {
    'vibe-arcade-deck': {
      id: 'vibe-arcade-deck',
      title: 'Modular Slidev Hybrid Deck',
      filename: 'vibe-arcade-deck_standalone_slidev.html',
      livePath: 'apps/vibe-arcade-deck_standalone_slidev.html'
    },
    'ksi': {
      id: 'ksi',
      title: 'Unit Circle Resolver',
      filename: 'interactive-unit-circle.html',
      livePath: 'apps/radiansincostan.html',
      fallbackPath: 'apps/radiansincostan/standalone.html'
    },
    'lotek-offline': {
      id: 'lotek-offline',
      title: "Bude's Lotek Ordering",
      filename: 'bude-lotek-order.html',
      livePath: 'apps/radiansincostan.html'
    },
    'wa-parser': {
      id: 'wa-parser',
      title: 'WA Text Parser & Regex Sanitizer',
      filename: 'wa-text-parser.html',
      livePath: 'apps/radiansincostan.html'
    },
    'pdf-editor': {
      id: 'pdf-editor',
      title: 'Client-Side PDF & Image Compressor',
      filename: 'client-pdf-editor.html',
      livePath: 'apps/radiansincostan.html'
    },
    'islam-memes': {
      id: 'islam-memes',
      title: 'Islam Makhachev BFITW ASCII Box',
      filename: 'islam-bfitw-box.html',
      livePath: 'apps/radiansincostan.html'
    },
    'family-quiz': {
      id: 'family-quiz',
      title: 'Family Quiz Engine',
      filename: 'family-quiz-game.html',
      livePath: 'apps/radiansincostan.html'
    }
  };

  /**
   * Build a self-contained, zero-backend single-file HTML cartridge for any disk ID
   * @param {string} appId
   * @returns {string} Complete HTML5 document string
   */
  function synthesizeStandaloneHtml(appId) {
    const accent = (window.ArcadeThemeEngine && window.ArcadeThemeEngine.getAccent)
      ? window.ArcadeThemeEngine.getAccent()
      : '#b0a84a';

    const sharedStyles = `
      :root {
        --bg-primary: #1e231b;
        --bg-secondary: #151912;
        --bg-paper: #282f23;
        --text-normal: #f2f4ee;
        --text-muted: #b5bba8;
        --accent: ${accent};
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 20px;
        font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        background-color: var(--bg-secondary);
        color: var(--text-normal);
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: flex-start;
      }
      .cartridge-window {
        width: 100%;
        max-width: 680px;
        background: var(--bg-primary);
        border: 3px ridge var(--accent);
        border-radius: 10px;
        padding: 18px;
        box-shadow: 0 12px 32px rgba(0,0,0,0.65);
      }
      .titlebar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(255,255,255,0.15);
        padding-bottom: 10px;
        margin-bottom: 14px;
        font-size: 12px;
        font-weight: 700;
        color: var(--accent);
      }
      h1 { font-size: 18px; margin: 0 0 8px; }
      p { font-size: 12px; color: var(--text-muted); margin: 0 0 14px; line-height: 1.5; }
      .panel {
        background: var(--bg-paper);
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 12px;
      }
      button, .btn {
        background: var(--accent);
        color: #0d0f0c;
        border: none;
        border-radius: 5px;
        padding: 8px 14px;
        font-family: inherit;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
      }
      button:hover { filter: brightness(1.1); }
      input, textarea, select {
        width: 100%;
        background: var(--bg-secondary);
        color: var(--text-normal);
        border: 1px solid var(--accent);
        border-radius: 5px;
        padding: 8px 10px;
        font-family: inherit;
        font-size: 12px;
        margin-bottom: 10px;
      }
      pre {
        background: var(--bg-secondary);
        padding: 12px;
        border-radius: 6px;
        overflow-x: auto;
        font-size: 12px;
        border: 1px solid rgba(255,255,255,0.12);
      }
    `;

    if (appId === 'lotek-offline') {
      return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Bude's Lotek Ordering — Standalone Cartridge</title>
<style>${sharedStyles}</style>
</head>
<body>
  <div class="cartridge-window">
    <div class="titlebar"><span>🥗 DISK A:\\ LOTEK-OFFLINE.EXE</span><span>100% AIRGAP</span></div>
    <h1>🥗 Bude's Lotek &amp; Karedok Ordering</h1>
    <p>Offline-first food ordering cartridge. Select dishes and spicy level to compile a formatted WhatsApp payload.</p>
    <div class="panel">
      <label style="font-size:11px;display:block;margin-bottom:4px;">Select Dish:</label>
      <select id="dish"><option value="Lotek Spesial|15000">Lotek Spesial (Rp 15.000)</option><option value="Karedok Bandung|14000">Karedok Bandung (Rp 14.000)</option><option value="Gado-Gado Siram|16000">Gado-Gado Siram (Rp 16.000)</option></select>
      <label style="font-size:11px;display:block;margin-bottom:4px;">Spicy Level (Cabe 1-10):</label>
      <input type="number" id="cabe" value="5" min="1" max="10">
      <label style="font-size:11px;display:block;margin-bottom:4px;">Quantity:</label>
      <input type="number" id="qty" value="1" min="1" max="20">
      <button type="button" onclick="compileOrder()">Compile WhatsApp Order Payload</button>
    </div>
    <pre id="out">*HALO BUDE, SAYA MAU ORDER:*\n• Lotek Spesial (1x) — Cabe 5 — Rp 15.000</pre>
  </div>
  <script>
    function compileOrder() {
      const [name, price] = document.getElementById('dish').value.split('|');
      const cabe = document.getElementById('cabe').value;
      const qty = parseInt(document.getElementById('qty').value || '1', 10);
      const total = (parseInt(price, 10) * qty).toLocaleString('id-ID');
      document.getElementById('out').textContent = '*HALO BUDE, SAYA MAU ORDER:*\\n• ' + name + ' (' + qty + 'x) — Cabe ' + cabe + '\\n*TOTAL: Rp ' + total + '*';
    }
  </script>
</body>
</html>`;
    }

    if (appId === 'wa-parser') {
      return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>WA Text Parser — Standalone Cartridge</title>
<style>${sharedStyles}</style>
</head>
<body>
  <div class="cartridge-window">
    <div class="titlebar"><span>💬 DISK A:\\ WA-PARSER.EXE</span><span>REGEX ENGINE</span></div>
    <h1>💬 WhatsApp Text &amp; Regex Sanitizer</h1>
    <p>Paste messy notes or markdown below to convert into clean WhatsApp formatting.</p>
    <textarea id="raw" rows="5" placeholder="Paste raw text here...">## Meeting Notes\n- **Deploy** v2.0 build\n- Fix mobile grid layout</textarea>
    <button type="button" onclick="parseWa()">⚡ Sanitize for WhatsApp</button>
    <pre id="parsed">*Meeting Notes*\n• *Deploy* v2.0 build\n• Fix mobile grid layout</pre>
  </div>
  <script>
    function parseWa() {
      const raw = document.getElementById('raw').value;
      const out = raw
        .replace(/^#+\\s*(.+)$/gm, '*$1*')
        .replace(/\\*\\*(.+?)\\*\\*/g, '*$1*')
        .replace(/^\\s*[-*]\\s+/gm, '• ');
      document.getElementById('parsed').textContent = out;
    }
  </script>
</body>
</html>`;
    }

    if (appId === 'islam-memes') {
      return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Islam BFITW ASCII Box — Standalone Cartridge</title>
<style>${sharedStyles}</style>
</head>
<body>
  <div class="cartridge-window">
    <div class="titlebar"><span>🏆 DISK A:\\ ISLAM-BFITW.EXE</span><span>ASCII STUDIO</span></div>
    <h1>🏆 Monospace ASCII Box Generator</h1>
    <input type="text" id="quote" value="BRATHA SEND HIM 2-3 YEARS DAGESTAN AND FORGET" oninput="renderBox()">
    <pre id="asciiBox"></pre>
    <button type="button" onclick="navigator.clipboard.writeText(document.getElementById('asciiBox').textContent)">📋 Copy ASCII Box</button>
  </div>
  <script>
    function renderBox() {
      const text = (document.getElementById('quote').value || 'ISLAM MAKHACHEV #1 P4P').toUpperCase();
      const pad = 2;
      const len = text.length + pad * 2;
      const bar = '─'.repeat(len);
      document.getElementById('asciiBox').textContent =
        '┌' + bar + '┐\\n' +
        '│  ' + text + '  │\\n' +
        '└' + bar + '┘';
    }
    renderBox();
  </script>
</body>
</html>`;
    }

    if (appId === 'family-quiz') {
      return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Family Quiz Engine — Standalone Cartridge</title>
<style>${sharedStyles}</style>
</head>
<body>
  <div class="cartridge-window">
    <div class="titlebar"><span>🎮 DISK A:\\ FAMILY-QUIZ.EXE</span><span>QUIZ ENGINE</span></div>
    <h1>🎮 Family Quiz Engine</h1>
    <div class="panel">
      <p id="qText" style="font-size:14px;color:var(--text-normal);font-weight:700;">Q1: What is the exact value of sin(45°)?</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button type="button" onclick="answer(true)">[A] √2 / 2</button>
        <button type="button" onclick="answer(false)">[B] 1 / 2</button>
      </div>
    </div>
    <pre id="scoreOut">STATUS: Ready • Score: 0</pre>
  </div>
  <script>
    let score = 0;
    function answer(correct) {
      if (correct) score += 100;
      document.getElementById('scoreOut').textContent = (correct ? '✓ CORRECT! ' : '✗ TRY AGAIN! ') + '• Score: ' + score;
    }
  </script>
</body>
</html>`;
    }

    // Default / PDF Editor / Fallback
    const meta = CARTRIDGE_META[appId] || { title: 'Vintage Arcade Cartridge', id: appId };
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${meta.title} — Standalone Cartridge</title>
<style>${sharedStyles}</style>
</head>
<body>
  <div class="cartridge-window">
    <div class="titlebar"><span>📄 DISK A:\\ ${(meta.id || 'APP').toUpperCase()}.EXE</span><span>100% IN-BROWSER</span></div>
    <h1>📄 ${meta.title}</h1>
    <p>100% Client-Side Canvas &amp; Web Worker Utility. Drop an image below to inspect and compress locally with zero server upload.</p>
    <div class="panel">
      <input type="file" id="fileIn" accept="image/*,.pdf" onchange="inspectFile(this)">
      <pre id="fileOut">Waiting for local file selection (0 bytes uploaded to any server)...</pre>
    </div>
  </div>
  <script>
    function inspectFile(input) {
      const f = input.files && input.files[0];
      if (!f) return;
      document.getElementById('fileOut').textContent =
        'FILE LOADED IN MEMORY:\\nName: ' + f.name + '\\nSize: ' + (f.size / 1024).toFixed(2) + ' KB\\nType: ' + (f.type || 'application/octet-stream') + '\\nPrivacy: 100% Local Browser Sandbox';
    }
  </script>
</body>
</html>`;
  }

  /**
   * Resolve app ID from a clicked anchor/button or URL
   * @param {HTMLElement} el
   * @returns {{ appId: string, filename: string, href: string }}
   */
  function resolveTarget(el) {
    const card = el ? el.closest('.floppy-card') : null;
    const urlParams = new URLSearchParams(window.location.search);
    const href = (el && el.getAttribute('href')) || '';
    let appId = (card && (card.getAttribute('data-app') || card.getAttribute('data-app-id')))
      || (el && el.getAttribute('data-app-id'))
      || urlParams.get('app')
      || '';

    if (!appId) {
      if (href.includes('ksi') || href.includes('radiansincostan')) appId = 'ksi';
      else if (href.includes('lotek')) appId = 'lotek-offline';
      else if (href.includes('wa-parser')) appId = 'wa-parser';
      else if (href.includes('pdf-editor')) appId = 'pdf-editor';
      else if (href.includes('islam')) appId = 'islam-memes';
      else if (href.includes('family-quiz')) appId = 'family-quiz';
      else appId = 'ksi';
    }

    const meta = CARTRIDGE_META[appId] || CARTRIDGE_META['ksi'];
    const downloadAttr = el ? el.getAttribute('download') : '';
    const filename = (downloadAttr && downloadAttr !== 'true' && downloadAttr !== '')
      ? downloadAttr
      : meta.filename;

    return { appId, filename, href, meta };
  }

  /**
   * Trigger browser file download from HTML text string
   * @param {string} htmlContent
   * @param {string} filename
   */
  function triggerBlobDownload(htmlContent, filename) {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const tempLink = document.createElement('a');
    tempLink.href = blobUrl;
    tempLink.setAttribute('download', filename || 'cartridge.html');
    tempLink.setAttribute('data-bypass-arcade', 'true');
    tempLink.style.display = 'none';
    document.body.appendChild(tempLink);
    tempLink.click();
    setTimeout(() => {
      if (tempLink.parentNode) tempLink.parentNode.removeChild(tempLink);
      URL.revokeObjectURL(blobUrl);
    }, 1500);
  }

  /**
   * Fetch real HTML if available, otherwise synthesize standalone HTML
   * @param {string} appId
   * @param {string} href
   * @returns {Promise<string>}
   */
  async function getCartridgeHtml(appId, href) {
    const candidates = [];
    if (appId === 'ksi' || appId === 'radiansincostan') {
      candidates.push('apps/radiansincostan.html', 'apps/radiansincostan/standalone.html');
    } else if (appId === 'vibe-arcade-deck') {
      candidates.push('apps/vibe-arcade-deck_standalone_slidev.html');
    }
    if (href && !href.startsWith('/') && !href.startsWith('#')) {
      candidates.push(href);
    }

    for (let i = 0; i < candidates.length; i++) {
      try {
        const res = await fetch(candidates[i]);
        if (res && res.ok) {
          const text = await res.text();
          if (text && text.includes('<html')) {
            return text;
          }
        }
      } catch (e) {
        // Fallback to next candidate or synthesizer
      }
    }

    // Try reading directly from active iframe in playground if available
    const iframe = document.getElementById('liveAppIframe');
    if (iframe) {
      try {
        if (iframe.contentDocument && iframe.contentDocument.documentElement) {
          const frameHtml = iframe.contentDocument.documentElement.outerHTML;
          if (frameHtml && frameHtml.includes('<body')) {
            return '<!DOCTYPE html>\n' + frameHtml;
          }
        }
      } catch (err) {}
    }

    return synthesizeStandaloneHtml(appId);
  }

  /**
   * Show temporary visual confirmation on the download button
   * @param {HTMLElement} btn
   */
  function showDownloadFeedback(btn) {
    if (!btn || btn.dataset.downloading === 'true') return;
    btn.dataset.downloading = 'true';
    const iconSpan = btn.querySelector('.btn-icon');
    const labelSpan = btn.querySelector('.btn-label');

    if (iconSpan) {
      const origIcon = iconSpan.textContent;
      const origLabel = labelSpan ? labelSpan.textContent : '';
      iconSpan.textContent = '✓';
      if (labelSpan) labelSpan.textContent = ' Saved!';
      setTimeout(() => {
        iconSpan.textContent = origIcon;
        if (labelSpan) labelSpan.textContent = origLabel;
        delete btn.dataset.downloading;
      }, 1400);
    } else {
      const origHtml = btn.innerHTML;
      btn.innerHTML = '<span>✓ Downloaded .html!</span>';
      setTimeout(() => {
        btn.innerHTML = origHtml;
        delete btn.dataset.downloading;
      }, 1400);
    }
  }

  /**
   * Download cartridge handler
   * @param {HTMLElement} triggerEl
   */
  async function downloadFromElement(triggerEl) {
    const { appId, filename, href } = resolveTarget(triggerEl);
    showDownloadFeedback(triggerEl);
    const htmlContent = await getCartridgeHtml(appId, href);
    triggerBlobDownload(htmlContent, filename);
  }

  /**
   * Initialize global click delegation for all [download] and standalone buttons
   */
  function init() {
    document.addEventListener('click', (e) => {
      // Allow internal blob download anchor to proceed natively
      if (e.target.closest('[data-bypass-arcade]')) {
        return;
      }

      const downloadLink = e.target.closest('a[download], #downloadAppBtn, [data-action="download-app"]');
      if (downloadLink) {
        const href = downloadLink.getAttribute('href') || '';
        const isSynthetic = href.includes('compiled-sites/') || href.startsWith('#') || href.startsWith('javascript:');

        // On local file:/// protocol, real files can download directly without fetch CORS restrictions
        if (window.location.protocol === 'file:' && href && !isSynthetic) {
          showDownloadFeedback(downloadLink);
          return;
        }

        e.preventDefault();
        e.stopPropagation();
        downloadFromElement(downloadLink);
        return;
      }

      // Also handle Standalone launch links for synthesized cartridges so they never 404
      const standaloneLink = e.target.closest('.action-sub-grid a[target="_blank"], #openExternalTabBtn');
      if (standaloneLink) {
        const { appId, href } = resolveTarget(standaloneLink);
        if (appId === 'ksi') {
          // Ensure ksi points to real compiled cartridge
          standaloneLink.setAttribute('href', 'apps/radiansincostan.html');
          return;
        }
        if (href.includes('compiled-sites/')) {
          e.preventDefault();
          e.stopPropagation();
          const htmlContent = synthesizeStandaloneHtml(appId);
          const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, '_blank');
        }
      }
    });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  return {
    downloadFromElement: downloadFromElement,
    getCartridgeHtml: getCartridgeHtml,
    synthesizeStandaloneHtml: synthesizeStandaloneHtml,
    triggerBlobDownload: triggerBlobDownload,
    init: init
  };
});


;
// ==========================================
// MODULE: modules/slidev-engine.js
// ==========================================
/**
 * ============================================================================
 * MODULE: Modular Slidev Hybrid Engine (src/modules/slidev-engine.js)
 * Purpose: Zero-backend MD-to-Slide parser, FNV-1a hash-keyed localStorage
 *          compiled slide cache, Virtual 3-Slide DOM Window (Prev|Active|Next),
 *          Dual-Window Presenter Mode (BroadcastChannel), Runnable JS blocks,
 *          CRT Wireframe highlighter, Laser/Ink Canvas, Overview Grid, and
 *          Standalone HTML Generator (*_standalone_slidev.html).
 * ============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ArcadeSlidev = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const CACHE_PREFIX = 'arcade_slidev_v1_';
  const CHANNEL_NAME = 'arcade_slidev_sync';

  /**
   * 1. Fast 32-bit FNV-1a Hash for Content-Addressed Caching (< 0.1ms)
   * @param {string} str
   * @returns {string} 8-char uppercase hex hash
   */
  function fnv1aHash(str) {
    let h = 0x811c9dc5;
    const s = String(str || '').replace(/\r\n/g, '\n').trim();
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(16).toUpperCase().padStart(8, '0');
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m]);
  }

  /**
   * 2. Parse Simple YAML Block into Object
   */
  function parseYamlBlock(yamlStr) {
    const meta = {};
    if (!yamlStr) return meta;
    yamlStr.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const idx = trimmed.indexOf(':');
      if (idx === -1) return;
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (val.startsWith('[') && val.endsWith(']')) {
        val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
      }
      meta[key] = val;
    });
    return meta;
  }

  function isYamlOnlyBlock(block) {
    const lines = String(block || '').trim().split(/\r?\n/);
    if (lines.length === 0 || lines.length > 12) return false;
    return lines.every(line => {
      const t = line.trim();
      if (!t || t.startsWith('#')) return true;
      return /^[a-zA-Z0-9_-]+\s*:\s*.+$/.test(t);
    });
  }

  /**
   * 3. Highlight CRT Wireframe / ASCII Schematic Box-Drawing Blocks
   */
  function highlightWireframe(code) {
    const escaped = escapeHtml(code);
    return escaped
      .replace(/([┌─┐│└┘├┤┬┴┼╔═╗║╚╝╠╣╦╩╬▲▼◀►➔╲╱]+)/g, '<span class="wf-border">$1</span>')
      .replace(/(\[[^\]\n]{1,28}\])/g, '<span class="wf-badge">$1</span>')
      .replace(/(✓[^\n<]*)/g, '<span class="wf-ok">$1</span>');
  }

  /**
   * 4. Lightweight Slidev Markdown-to-HTML Compiler
   */
  function compileMarkdownFragment(md, slideIdx) {
    if (!md) return '';
    let src = String(md);
    const codeBlocks = [];

    // Extract fenced code blocks first
    src = src.replace(/```([a-zA-Z0-9_-]*)(?:[ \t]+([^\r\n]*))?\r?\n([\s\S]*?)```/g, (_, lang, flags, code) => {
      const token = `@@SLIDEV_CODE_${codeBlocks.length}@@`;
      const l = (lang || 'text').toLowerCase();
      const f = (flags || '').toLowerCase();
      const isRunnable = l === 'js' && (f.includes('run') || f.includes('live'));
      const isWireframe = l === 'wireframe' || l === 'ascii';

      let blockHtml = '';
      if (isWireframe) {
        blockHtml = `<pre class="slidev-wireframe-box"><code>${highlightWireframe(code.replace(/\s+$/, ''))}</code></pre>`;
      } else if (isRunnable) {
        const runId = `run_${slideIdx}_${codeBlocks.length}`;
        const encoded = encodeURIComponent(code.trim());
        blockHtml = `
          <div class="slidev-code-wrap" data-run-id="${runId}">
            <div class="slidev-code-bar">
              <span>⚡ JS SANDBOX (EXECUTABLE)</span>
              <button type="button" class="slidev-run-btn" data-code="${encoded}" data-target="${runId}">▶ Run Code</button>
            </div>
            <pre class="slidev-code-pre"><code>${escapeHtml(code.replace(/\s+$/, ''))}</code></pre>
            <div class="slidev-run-output" id="${runId}" style="display:none;"></div>
          </div>
        `;
      } else {
        blockHtml = `
          <div class="slidev-code-wrap">
            <div class="slidev-code-bar"><span>${escapeHtml(l.toUpperCase())}</span></div>
            <pre class="slidev-code-pre"><code>${escapeHtml(code.replace(/\s+$/, ''))}</code></pre>
          </div>
        `;
      }
      codeBlocks.push(blockHtml);
      return token;
    });

    // Live Arcade Embeds: @[arcade](apps/radiansincostan.html)
    src = src.replace(/@\[arcade\]\(([^)]+)\)/g, (_, url) => {
      const safeUrl = escapeHtml(url.trim());
      return `
        <div class="slidev-embed-frame">
          <div class="slidev-embed-bar">
            <span>🕹️ LIVE CARTRIDGE EMBED: ${safeUrl}</span>
            <a href="${safeUrl}" target="_blank" rel="noopener">↗ Open Tab</a>
          </div>
          <iframe src="${safeUrl}" loading="lazy" title="Embedded Arcade Cartridge"></iframe>
        </div>
      `;
    });

    const lines = src.split(/\r?\n/);
    const out = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const line = rawLine.trim();

      if (!line) {
        if (inList) { out.push('</ul>'); inList = false; }
        continue;
      }

      if (/^@@SLIDEV_CODE_\d+@@$/.test(line)) {
        if (inList) { out.push('</ul>'); inList = false; }
        out.push(line);
        continue;
      }

      if (line.startsWith('# ')) {
        if (inList) { out.push('</ul>'); inList = false; }
        out.push(`<h1 class="slidev-h1">${formatInline(line.slice(2))}</h1>`);
      } else if (line.startsWith('## ')) {
        if (inList) { out.push('</ul>'); inList = false; }
        out.push(`<h2 class="slidev-h2">${formatInline(line.slice(3))}</h2>`);
      } else if (line.startsWith('### ')) {
        if (inList) { out.push('</ul>'); inList = false; }
        out.push(`<h3 class="slidev-h3">${formatInline(line.slice(4))}</h3>`);
      } else if (line.startsWith('> ')) {
        if (inList) { out.push('</ul>'); inList = false; }
        out.push(`<blockquote class="slidev-quote">${formatInline(line.slice(2))}</blockquote>`);
      } else if (/^[-*+]\s+/.test(line)) {
        if (!inList) { out.push('<ul class="slidev-list">'); inList = true; }
        out.push(`<li>${formatInline(line.replace(/^[-*+]\s+/, ''))}</li>`);
      } else if (/^\d+\.\s+/.test(line)) {
        if (!inList) { out.push('<ul class="slidev-list slidev-list-num">'); inList = true; }
        out.push(`<li>${formatInline(line)}</li>`);
      } else {
        if (inList) { out.push('</ul>'); inList = false; }
        out.push(`<p class="slidev-p">${formatInline(line)}</p>`);
      }
    }
    if (inList) out.push('</ul>');

    let html = out.join('\n');
    codeBlocks.forEach((blockHtml, idx) => {
      html = html.replace(`@@SLIDEV_CODE_${idx}@@`, blockHtml);
    });
    return html;
  }

  function formatInline(text) {
    let t = escapeHtml(text);
    t = t.replace(/`([^`]+)`/g, '<code class="slidev-inline-code">$1</code>');
    t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return t;
  }

  /**
   * 5. Parse Full Slidev Markdown into Deck Metadata + Compiled Slides Array
   * @param {string} rawMarkdown
   * @returns {{ hash: string, deckMeta: Object, slides: Array }}
   */
  function parseSlidevDeck(rawMarkdown) {
    const raw = String(rawMarkdown || '').trim();
    const hash = fnv1aHash(raw);
    let body = raw;
    let deckMeta = { title: 'Arcade Slidev Deck', layout: 'cover' };

    // Extract top deck frontmatter if present
    const fmMatch = body.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (fmMatch && isYamlOnlyBlock(fmMatch[1])) {
      deckMeta = Object.assign(deckMeta, parseYamlBlock(fmMatch[1]));
      body = body.slice(fmMatch[0].length);
    }

    // Split remaining content by `\n---\n` outside fenced code blocks
    const segments = [];
    let current = [];
    let inFence = false;
    const lines = body.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (l.trim().startsWith('```')) {
        inFence = !inFence;
      }
      if (!inFence && l.trim() === '---') {
        segments.push(current.join('\n'));
        current = [];
      } else {
        current.push(l);
      }
    }
    if (current.length > 0) {
      segments.push(current.join('\n'));
    }

    // Merge per-slide YAML blocks with their following slide content
    const rawSlides = [];
    let pendingMeta = null;

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i].trim();
      if (!seg) continue;
      if (isYamlOnlyBlock(seg) && i < segments.length - 1) {
        pendingMeta = Object.assign({}, pendingMeta || {}, parseYamlBlock(seg));
      } else {
        rawSlides.push({
          meta: pendingMeta || {},
          content: seg
        });
        pendingMeta = null;
      }
    }

    const slides = rawSlides.map((item, idx) => {
      let content = item.content;
      let notes = '';

      // Extract speaker notes <!-- notes: ... --> or <!-- ... -->
      content = content.replace(/<!--\s*(?:notes\s*:)?\s*([\s\S]*?)-->/gi, (_, noteText) => {
        notes += (notes ? '\n' : '') + noteText.trim();
        return '';
      });

      const layout = item.meta.layout || (idx === 0 ? (deckMeta.layout || 'cover') : (content.includes('::right::') ? 'two-cols' : 'default'));
      let html = '';

      if (content.includes('::right::')) {
        const parts = content.split(/::right::/i);
        const leftHtml = compileMarkdownFragment(parts[0], idx);
        const rightHtml = compileMarkdownFragment(parts.slice(1).join('\n'), idx);
        html = `
          <div class="slidev-two-cols">
            <div class="slidev-col-left">${leftHtml}</div>
            <div class="slidev-col-right">${rightHtml}</div>
          </div>
        `;
      } else {
        html = `<div class="slidev-single-col">${compileMarkdownFragment(content, idx)}</div>`;
      }

      const headingMatch = content.match(/^#{1,2}\s+(.+)$/m);
      const slideTitle = item.meta.title || (headingMatch ? headingMatch[1].replace(/[*`]/g, '').trim() : `Slide ${idx + 1}`);

      return {
        index: idx,
        title: slideTitle,
        layout: layout,
        meta: item.meta,
        notes: notes || 'No speaker notes for this slide.',
        html: html,
        rawText: content.replace(/[#*`>-]/g, ' ').replace(/\s+/g, ' ').trim()
      };
    });

    return {
      hash: hash,
      deckMeta: deckMeta,
      slides: slides
    };
  }

  /**
   * 6. Client-Side Hash Cache (First Open Compiles & Saves; Next Opens < 1ms)
   */
  function getCompiledDeck(deckId, rawMarkdown) {
    const id = deckId || 'default';
    const hash = fnv1aHash(rawMarkdown);
    const cacheKey = `${CACHE_PREFIX}${id}_${hash}`;

    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.hash === hash && Array.isArray(parsed.slides)) {
          parsed.cacheStatus = 'HIT';
          return parsed;
        }
      }
    } catch (e) {}

    // Cache Miss: Parse & Persist, and clean old hashes for this deckId
    const compiled = parseSlidevDeck(rawMarkdown);
    compiled.cacheStatus = 'MISS (Compiled & Cached)';
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith(`${CACHE_PREFIX}${id}_`) && k !== cacheKey) {
          localStorage.removeItem(k);
        }
      }
      localStorage.setItem(cacheKey, JSON.stringify({
        hash: compiled.hash,
        deckMeta: compiled.deckMeta,
        slides: compiled.slides,
        cachedAt: Date.now()
      }));
    } catch (e) {}

    return compiled;
  }

  /**
   * 7. Generate Standalone Self-Contained Slidev HTML (*_standalone_slidev.html)
   */
  function synthesizeStandaloneSlidevHtml(rawMarkdown, deckId, fileName) {
    const compiled = parseSlidevDeck(rawMarkdown);
    const safeTitle = escapeHtml(compiled.deckMeta.title || deckId || 'Arcade Slidev Deck');
    const safeRawMd = String(rawMarkdown || '').replace(/<\/script>/gi, '<\\/script>');
    const srcName = fileName || `${deckId || 'deck'}.md`;

    return `<!-- slidev-source: ${srcName} | md-hash: ${compiled.hash} | generated: ${new Date().toISOString().slice(0, 10)} -->
<!DOCTYPE html>
<html lang="en" class="theme-dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle} — Modular Slidev Deck</title>
  <style>
    :root {
      --bg-main: #141712;
      --bg-card: #1d211a;
      --bg-paper: #272d23;
      --bg-code: #0d0f0c;
      --text-main: #f3f4ef;
      --text-muted: #b2b8aa;
      --accent: #b0a84a;
      --border: #333b2e;
    }
    html.theme-light {
      --bg-main: #e6e9e0;
      --bg-card: #f4f5f0;
      --bg-paper: #faf8f3;
      --bg-code: #181b15;
      --text-main: #141712;
      --text-muted: #464c3f;
      --accent: #7e7724;
      --border: #c8cebe;
    }
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0; padding: 0; width: 100%; height: 100%;
      overflow-x: clip; background: var(--bg-main); color: var(--text-main);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    .slidev-shell {
      display: flex; flex-direction: column; height: 100vh; max-width: 100%; overflow: hidden;
    }
    .slidev-topbar {
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
      padding: 8px 14px; background: var(--bg-card); border-bottom: 2px solid var(--border);
      font-size: 12px; z-index: 30; flex-wrap: wrap;
    }
    .slidev-brand { font-weight: 700; color: var(--accent); display: flex; align-items: center; gap: 8px; }
    .slidev-cache-pill {
      font-size: 10px; padding: 2px 6px; border-radius: 4px;
      background: rgba(176,168,74,0.18); color: var(--accent); border: 1px solid var(--accent);
    }
    .slidev-toolbar { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .slidev-btn {
      background: var(--bg-paper); color: var(--text-main); border: 1px solid var(--border);
      border-radius: 4px; padding: 4px 8px; font-size: 11px; font-family: inherit;
      cursor: pointer; font-weight: 600; transition: all 0.12s ease;
    }
    .slidev-btn:hover, .slidev-btn.is-active {
      background: var(--accent); color: #0d0f0c; border-color: var(--accent);
    }
    .slidev-stage-wrap {
      flex: 1; position: relative; display: flex; align-items: center; justify-content: center;
      padding: 16px; overflow: hidden;
    }
    /* Virtual 3-Slide Window */
    .slidev-slide {
      width: min(100%, 1024px); max-height: 100%; overflow-y: auto;
      background: var(--bg-card); border: 2px solid var(--border); border-radius: 8px;
      padding: clamp(18px, 4vw, 44px); box-shadow: 0 12px 32px rgba(0,0,0,0.45);
      display: none; flex-direction: column; gap: 14px; position: relative;
    }
    .slidev-slide.is-active { display: flex; }
    .slidev-slide.layout-cover, .slidev-slide.layout-center {
      text-align: center; align-items: center; justify-content: center; min-height: 72%;
    }
    .slidev-slide-badge {
      font-size: 10px; font-weight: 700; color: var(--accent); letter-spacing: 0.08em;
      text-transform: uppercase; margin-bottom: 4px;
    }
    .slidev-h1 { font-size: clamp(20px, 3.2vw, 34px); margin: 0 0 8px; color: var(--text-main); line-height: 1.25; }
    .slidev-h2 { font-size: clamp(17px, 2.4vw, 24px); margin: 0 0 8px; color: var(--accent); line-height: 1.3; }
    .slidev-h3 { font-size: 15px; margin: 8px 0 4px; color: var(--text-main); }
    .slidev-p { font-size: clamp(12px, 1.4vw, 15px); line-height: 1.6; color: var(--text-muted); margin: 0 0 8px; }
    .slidev-list { margin: 4px 0 10px; padding-left: 20px; color: var(--text-main); font-size: clamp(12px, 1.35vw, 14px); line-height: 1.65; }
    .slidev-quote {
      margin: 8px 0; padding: 10px 14px; border-left: 4px solid var(--accent);
      background: var(--bg-paper); font-style: italic; color: var(--text-main); border-radius: 0 6px 6px 0;
    }
    .slidev-inline-code {
      background: var(--bg-code); color: var(--accent); padding: 1px 5px; border-radius: 3px; font-size: 0.92em;
    }
    .slidev-two-cols {
      display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; width: 100%; align-items: start;
    }
    .slidev-code-wrap {
      border: 1px solid var(--border); border-radius: 6px; overflow: hidden; background: var(--bg-code); margin: 6px 0; width: 100%; text-align: left;
    }
    .slidev-code-bar {
      display: flex; justify-content: space-between; align-items: center;
      padding: 5px 10px; background: #1a1f16; color: var(--accent); font-size: 10px; font-weight: 700;
    }
    .slidev-run-btn {
      background: var(--accent); color: #0d0f0c; border: none; border-radius: 3px;
      padding: 2px 8px; font-size: 10px; font-weight: 700; cursor: pointer;
    }
    .slidev-code-pre {
      margin: 0; padding: 12px; font-size: 11.5px; line-height: 1.5; color: #e5e7eb; overflow-x: auto;
    }
    .slidev-run-output {
      padding: 8px 12px; border-top: 1px dashed var(--accent); background: #121710;
      color: #4ade80; font-size: 11px; white-space: pre-wrap;
    }
    .slidev-wireframe-box {
      margin: 6px 0; padding: 12px; background: var(--bg-code); border: 1px solid var(--accent);
      border-radius: 6px; font-size: 11px; line-height: 1.45; color: #d4d8ce; overflow-x: auto; text-align: left;
    }
    .wf-border { color: var(--accent); font-weight: 700; }
    .wf-badge { color: #facc15; font-weight: 700; }
    .wf-ok { color: #4ade80; font-weight: 700; }
    .slidev-embed-frame {
      border: 1px solid var(--accent); border-radius: 6px; overflow: hidden; background: #0d0f0c; width: 100%;
    }
    .slidev-embed-bar {
      display: flex; justify-content: space-between; padding: 4px 10px; background: #1a1f16; font-size: 10px; color: var(--accent);
    }
    .slidev-embed-bar a { color: var(--text-main); text-decoration: none; }
    .slidev-embed-frame iframe { width: 100%; height: 240px; border: none; background: #fff; }
    /* Laser & Ink Canvas */
    #slidevInkCanvas {
      position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 20;
    }
    #slidevLaserDot {
      position: fixed; width: 14px; height: 14px; border-radius: 50%;
      background: #ef4444; box-shadow: 0 0 14px 4px #ef4444;
      pointer-events: none; z-index: 50; display: none; transform: translate(-50%, -50%);
    }
    /* Storyboard Overview Modal [O] & Editor Modal [E] */
    .slidev-overlay {
      position: fixed; inset: 0; background: rgba(10,12,9,0.92); z-index: 40;
      display: none; flex-direction: column; padding: 20px; overflow-y: auto;
    }
    .slidev-overlay.is-open { display: flex; }
    .overview-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; margin-top: 12px;
    }
    .overview-card {
      background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px;
      padding: 12px; cursor: pointer; transition: all 0.12s ease;
    }
    .overview-card:hover, .overview-card.is-current { border-color: var(--accent); box-shadow: 0 0 10px rgba(176,168,74,0.35); }
    .slidev-footer {
      display: flex; align-items: center; justify-content: space-between; gap: 10px;
      padding: 8px 14px; background: var(--bg-card); border-top: 2px solid var(--border); font-size: 11px; z-index: 30;
    }
    .slidev-progress-track {
      flex: 1; max-width: 260px; height: 6px; background: var(--bg-code); border-radius: 99px; overflow: hidden;
    }
    .slidev-progress-bar { height: 100%; background: var(--accent); width: 0%; transition: width 0.2s ease; }
    @media (max-width: 640px) {
      .slidev-two-cols { grid-template-columns: minmax(0, 1fr); }
      .slidev-stage-wrap { padding: 8px; }
      .slidev-slide { padding: 14px; }
      .hide-mobile { display: none !important; }
    }
  </style>
</head>
<body>
  <div id="slidevLaserDot"></div>

  <div class="slidev-shell">
    <!-- Top HUD -->
    <header class="slidev-topbar">
      <div class="slidev-brand">
        <span>📑 ${safeTitle}</span>
        <span class="slidev-cache-pill" id="cacheStatusPill">HYBRID CACHE</span>
      </div>
      <div class="slidev-toolbar">
        <button type="button" class="slidev-btn" id="btnOverview" title="Storyboard Overview Grid [O]">⊞ Grid [O]</button>
        <button type="button" class="slidev-btn" id="btnEditMd" title="Live Edit Markdown Source [E]">✏️ Edit [E]</button>
        <button type="button" class="slidev-btn" id="btnLaser" title="Toggle Laser Pointer [L]">🔴 Laser [L]</button>
        <button type="button" class="slidev-btn" id="btnDraw" title="Toggle Live Ink Draw [D]">🖊️ Draw [D]</button>
        <button type="button" class="slidev-btn hide-mobile" id="btnPresenter" title="Open Dual-Screen Presenter Window [P]">🎙️ Presenter [P]</button>
        <button type="button" class="slidev-btn" id="btnTheme" title="Toggle Light/Dark">☀️/🌙</button>
      </div>
    </header>

    <!-- Main Slide Stage (Virtual 3-Slide DOM Window + Ink Canvas) -->
    <main class="slidev-stage-wrap" id="slideStageWrap">
      <canvas id="slidevInkCanvas"></canvas>
      <div id="slideMountNode" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;"></div>
    </main>

    <!-- Bottom Navigation & Download Bar -->
    <footer class="slidev-footer">
      <div style="display:flex;align-items:center;gap:6px;">
        <button type="button" class="slidev-btn" id="btnPrev">◀ Prev</button>
        <button type="button" class="slidev-btn" id="btnNext">Next ▶</button>
      </div>
      <div class="slidev-progress-track"><div class="slidev-progress-bar" id="progressBar"></div></div>
      <div style="display:flex;align-items:center;gap:8px;">
        <span id="slideCounterText">1 / ${compiled.slides.length}</span>
        <button type="button" class="slidev-btn" id="btnDownloadHtml" title="Download Standalone .html">⬇️ .html</button>
        <button type="button" class="slidev-btn hide-mobile" id="btnDownloadMd" title="Download Raw .md">⬇️ .md</button>
      </div>
    </footer>
  </div>

  <!-- Storyboard Overview Overlay [O] -->
  <div class="slidev-overlay" id="overviewOverlay">
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <strong style="color:var(--accent);font-size:14px;">⊞ STORYBOARD OVERVIEW &amp; SEARCH</strong>
      <input type="search" id="slideSearchInput" placeholder="Filter slides by keyword..." style="padding:5px 10px;border-radius:4px;border:1px solid var(--border);background:var(--bg-card);color:var(--text-main);font-family:inherit;font-size:12px;width:240px;">
      <button type="button" class="slidev-btn" id="closeOverviewBtn">✕ Close [ESC]</button>
    </div>
    <div class="overview-grid" id="overviewGrid"></div>
  </div>

  <!-- Live Markdown Editor Overlay [E] -->
  <div class="slidev-overlay" id="editorOverlay">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
      <strong style="color:var(--accent);font-size:14px;">✏️ LIVE SLIDEV MARKDOWN SOURCE EDITOR (Client Re-Compile &amp; Cache)</strong>
      <div style="display:flex;gap:8px;">
        <button type="button" class="slidev-btn" id="applyMdBtn" style="background:var(--accent);color:#0d0f0c;">⚡ Apply &amp; Re-Cache</button>
        <button type="button" class="slidev-btn" id="closeEditorBtn">✕ Close</button>
      </div>
    </div>
    <textarea id="rawMdTextarea" style="flex:1;width:100%;background:var(--bg-code);color:#e5e7eb;border:1px solid var(--accent);border-radius:6px;padding:12px;font-family:monospace;font-size:12px;line-height:1.5;resize:none;"></textarea>
  </div>

  <!-- Embedded Self-Hosting Raw Markdown Source -->
  <script id="slidev-raw-md" type="text/markdown">
${safeRawMd}
  </script>

  <!-- Pre-Compiled Fallback Payload (0ms First Paint) -->
  <script id="slidev-precompiled-json" type="application/json">
${JSON.stringify({ hash: compiled.hash, deckMeta: compiled.deckMeta, slides: compiled.slides }).replace(/<\/script>/gi, '<\\/script>')}
  </script>

  <script>
    (function() {
      const DECK_ID = ${JSON.stringify(deckId || 'vibe-arcade-deck')};
      const CACHE_PREFIX = 'arcade_slidev_v1_';
      const syncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('${CHANNEL_NAME}') : null;

      const rawMdEl = document.getElementById('slidev-raw-md');
      const precompiledEl = document.getElementById('slidev-precompiled-json');
      let currentRawMd = rawMdEl ? rawMdEl.textContent.trim() : '';
      let deck = JSON.parse(precompiledEl.textContent);
      let currentIdx = 0;

      // Check URL hash (#s=2) or presenter mode (?presenter=1)
      const params = new URLSearchParams(location.search);
      const isPresenterWindow = params.get('presenter') === '1';

      function fnv1a(str) {
        let h = 0x811c9dc5;
        for (let i = 0; i < str.length; i++) {
          h ^= str.charCodeAt(i);
          h = Math.imul(h, 0x01000193);
        }
        return (h >>> 0).toString(16).toUpperCase().padStart(8, '0');
      }

      // First-open / Repeat-open Cache Check
      const hash = fnv1a(currentRawMd);
      const cacheKey = CACHE_PREFIX + DECK_ID + '_' + hash;
      const statusPill = document.getElementById('cacheStatusPill');
      try {
        const saved = localStorage.getItem(cacheKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed.slides)) {
            deck = parsed;
            if (typeof parsed.lastSlide === 'number') currentIdx = parsed.lastSlide;
            if (statusPill) statusPill.textContent = '⚡ CACHE HIT (' + hash.slice(0, 6) + ')';
          }
        } else {
          localStorage.setItem(cacheKey, JSON.stringify({
            hash: deck.hash,
            deckMeta: deck.deckMeta,
            slides: deck.slides,
            lastSlide: 0
          }));
          if (statusPill) statusPill.textContent = '💾 CACHED 1ST OPEN (' + hash.slice(0, 6) + ')';
        }
      } catch (e) {}

      // Hash deep-link override (#s=3)
      const hashMatch = location.hash.match(/#s=(\\d+)/);
      if (hashMatch) {
        const reqIdx = parseInt(hashMatch[1], 10) - 1;
        if (reqIdx >= 0 && reqIdx < deck.slides.length) currentIdx = reqIdx;
      }

      const mountNode = document.getElementById('slideMountNode');
      const counterText = document.getElementById('slideCounterText');
      const progressBar = document.getElementById('progressBar');

      // Virtual 3-Slide DOM Window (Mounts only Prev, Active, Next)
      function renderVirtualWindow() {
        const total = deck.slides.length;
        if (currentIdx < 0) currentIdx = 0;
        if (currentIdx >= total) currentIdx = total - 1;

        const windowIndices = [currentIdx - 1, currentIdx, currentIdx + 1].filter(i => i >= 0 && i < total);
        mountNode.innerHTML = windowIndices.map(i => {
          const s = deck.slides[i];
          const activeClass = i === currentIdx ? 'is-active' : '';
          return \`
            <section class="slidev-slide layout-\${s.layout} \${activeClass}" data-slide-index="\${i}">
              <div class="slidev-slide-badge">SLIDE 0\${i + 1} / 0\${total} • LAYOUT: \${String(s.layout).toUpperCase()}</div>
              \${s.html}
            </section>
          \`;
        }).join('');

        counterText.textContent = (currentIdx + 1) + ' / ' + total;
        progressBar.style.width = (((currentIdx + 1) / total) * 100).toFixed(1) + '%';
        history.replaceState(null, '', '#s=' + (currentIdx + 1));

        try {
          const saved = JSON.parse(localStorage.getItem(cacheKey) || '{}');
          saved.lastSlide = currentIdx;
          localStorage.setItem(cacheKey, JSON.stringify(saved));
        } catch (e) {}

        if (syncChannel) {
          syncChannel.postMessage({ type: 'SLIDE_SYNC', index: currentIdx, title: deck.slides[currentIdx].title, notes: deck.slides[currentIdx].notes });
        }

        // Bind Runnable JS Buttons inside active slide
        mountNode.querySelectorAll('.slidev-run-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const code = decodeURIComponent(btn.getAttribute('data-code') || '');
            const targetId = btn.getAttribute('data-target');
            const outBox = document.getElementById(targetId);
            if (!outBox) return;
            const logs = [];
            const customConsole = {
              log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
              info: (...args) => logs.push(args.join(' ')),
              warn: (...args) => logs.push('[WARN] ' + args.join(' ')),
              error: (...args) => logs.push('[ERR] ' + args.join(' '))
            };
            try {
              const fn = new Function('console', code);
              const ret = fn(customConsole);
              if (ret !== undefined) logs.push('➔ Return: ' + (typeof ret === 'object' ? JSON.stringify(ret) : String(ret)));
              outBox.textContent = logs.length ? logs.join('\\n') : '✓ Executed (no console output)';
            } catch (err) {
              outBox.textContent = '✗ Runtime Error: ' + err.message;
            }
            outBox.style.display = 'block';
          });
        });
      }

      function goToSlide(idx) {
        currentIdx = Math.max(0, Math.min(deck.slides.length - 1, idx));
        renderVirtualWindow();
      }

      document.getElementById('btnPrev').addEventListener('click', () => goToSlide(currentIdx - 1));
      document.getElementById('btnNext').addEventListener('click', () => goToSlide(currentIdx + 1));

      if (syncChannel) {
        syncChannel.addEventListener('message', (e) => {
          if (e.data && e.data.type === 'SLIDE_CMD_GOTO' && typeof e.data.index === 'number') {
            currentIdx = e.data.index;
            renderVirtualWindow();
          }
        });
      }

      // Overview Grid [O]
      const overviewOverlay = document.getElementById('overviewOverlay');
      const overviewGrid = document.getElementById('overviewGrid');
      const slideSearchInput = document.getElementById('slideSearchInput');

      function renderOverview(filterQ) {
        const q = (filterQ || '').toLowerCase().trim();
        overviewGrid.innerHTML = deck.slides
          .filter(s => !q || s.title.toLowerCase().includes(q) || (s.rawText && s.rawText.toLowerCase().includes(q)))
          .map(s => \`
            <div class="overview-card \${s.index === currentIdx ? 'is-current' : ''}" data-goto="\${s.index}">
              <div style="font-size:10px;color:var(--accent);font-weight:700;">SLIDE 0\${s.index + 1} • \${s.layout.toUpperCase()}</div>
              <div style="font-size:13px;font-weight:700;margin:4px 0;color:var(--text-main);">\${s.title}</div>
              <div style="font-size:11px;color:var(--text-muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">\${s.notes}</div>
            </div>
          \`).join('');
        overviewGrid.querySelectorAll('.overview-card').forEach(card => {
          card.addEventListener('click', () => {
            goToSlide(parseInt(card.getAttribute('data-goto'), 10));
            overviewOverlay.classList.remove('is-open');
          });
        });
      }

      function toggleOverview() {
        const open = overviewOverlay.classList.toggle('is-open');
        if (open) {
          renderOverview(slideSearchInput.value);
          slideSearchInput.focus();
        }
      }

      document.getElementById('btnOverview').addEventListener('click', toggleOverview);
      document.getElementById('closeOverviewBtn').addEventListener('click', () => overviewOverlay.classList.remove('is-open'));
      slideSearchInput.addEventListener('input', () => renderOverview(slideSearchInput.value));

      // Live Editor [E]
      const editorOverlay = document.getElementById('editorOverlay');
      const rawMdTextarea = document.getElementById('rawMdTextarea');
      document.getElementById('btnEditMd').addEventListener('click', () => {
        rawMdTextarea.value = currentRawMd;
        editorOverlay.classList.add('is-open');
      });
      document.getElementById('closeEditorBtn').addEventListener('click', () => editorOverlay.classList.remove('is-open'));
      document.getElementById('applyMdBtn').addEventListener('click', () => {
        currentRawMd = rawMdTextarea.value.trim();
        if (rawMdEl) rawMdEl.textContent = currentRawMd;
        if (window.ArcadeSlidev && window.ArcadeSlidev.getCompiledDeck) {
          deck = window.ArcadeSlidev.getCompiledDeck(DECK_ID, currentRawMd);
        } else {
          // Simple fallback re-split by ---
          const parts = currentRawMd.split(/\\r?\\n---\\r?\\n/);
          deck.slides = parts.map((p, i) => ({
            index: i,
            title: (p.match(/^#+\\s+(.+)$/m) || [null, 'Slide ' + (i + 1)])[1],
            layout: i === 0 ? 'cover' : 'default',
            notes: 'Updated live in browser.',
            html: '<div class="slidev-single-col"><pre class="slidev-wireframe-box">' + p.replace(/</g, '&lt;') + '</pre></div>'
          }));
        }
        if (statusPill) statusPill.textContent = '⚡ LIVE RE-CACHED (' + fnv1a(currentRawMd).slice(0, 6) + ')';
        editorOverlay.classList.remove('is-open');
        goToSlide(0);
      });

      // Laser [L] & Ink Draw [D]
      const laserDot = document.getElementById('slidevLaserDot');
      const inkCanvas = document.getElementById('slidevInkCanvas');
      const ctx = inkCanvas.getContext('2d');
      let laserOn = false;
      let drawOn = false;
      let painting = false;

      function resizeCanvas() {
        inkCanvas.width = inkCanvas.parentElement.clientWidth;
        inkCanvas.height = inkCanvas.parentElement.clientHeight;
      }
      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();

      document.getElementById('btnLaser').addEventListener('click', (e) => {
        laserOn = !laserOn;
        e.currentTarget.classList.toggle('is-active', laserOn);
        laserDot.style.display = laserOn ? 'block' : 'none';
      });

      document.getElementById('btnDraw').addEventListener('click', (e) => {
        drawOn = !drawOn;
        e.currentTarget.classList.toggle('is-active', drawOn);
        inkCanvas.style.pointerEvents = drawOn ? 'auto' : 'none';
        inkCanvas.style.cursor = drawOn ? 'crosshair' : 'default';
      });

      window.addEventListener('pointermove', (e) => {
        if (laserOn) {
          laserDot.style.left = e.clientX + 'px';
          laserDot.style.top = e.clientY + 'px';
        }
      });

      inkCanvas.addEventListener('pointerdown', (e) => {
        if (!drawOn) return;
        painting = true;
        const r = inkCanvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - r.left, e.clientY - r.top);
      });
      inkCanvas.addEventListener('pointermove', (e) => {
        if (!drawOn || !painting) return;
        const r = inkCanvas.getBoundingClientRect();
        ctx.strokeStyle = '#b0a84a';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineTo(e.clientX - r.left, e.clientY - r.top);
        ctx.stroke();
      });
      window.addEventListener('pointerup', () => { painting = false; });

      // Dual-Window Presenter Mode [P] via BroadcastChannel
      document.getElementById('btnPresenter').addEventListener('click', () => {
        const win = window.open(location.pathname + '?presenter=1#s=' + (currentIdx + 1), 'ArcadeSlidevPresenter', 'width=520,height=420');
        if (!win) alert('Allow popups to open Dual-Screen Presenter View.');
      });

      if (isPresenterWindow) {
        document.body.innerHTML = \`
          <div style="padding:18px;font-family:monospace;background:#141712;color:#f3f4ef;height:100vh;display:flex;flex-direction:column;gap:12px;">
            <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #333b2e;padding-bottom:8px;">
              <strong style="color:#b0a84a;">🎙️ PRESENTER CONSOLE (BroadcastChannel Sync)</strong>
              <span id="presTimer" style="color:#4ade80;font-weight:700;">00:00</span>
            </div>
            <div id="presSlideTitle" style="font-size:16px;font-weight:700;">Slide 1</div>
            <div style="flex:1;background:#1d211a;border:1px solid #333b2e;border-radius:6px;padding:12px;overflow-y:auto;">
              <div style="font-size:10px;color:#b0a84a;margin-bottom:6px;">SPEAKER NOTES:</div>
              <div id="presNotes" style="font-size:13px;line-height:1.55;white-space:pre-wrap;"></div>
            </div>
            <div style="display:flex;gap:8px;">
              <button class="slidev-btn" id="presPrev" style="flex:1;padding:10px;">◀ Prev Slide</button>
              <button class="slidev-btn" id="presNext" style="flex:1;padding:10px;background:#b0a84a;color:#0d0f0c;">Next Slide ▶</button>
            </div>
          </div>
        \`;
        let sec = 0;
        setInterval(() => {
          sec++;
          const m = String(Math.floor(sec / 60)).padStart(2, '0');
          const s = String(sec % 60).padStart(2, '0');
          const tEl = document.getElementById('presTimer');
          if (tEl) tEl.textContent = m + ':' + s;
        }, 1000);
        function updatePresUI() {
          const s = deck.slides[currentIdx] || deck.slides[0];
          document.getElementById('presSlideTitle').textContent = 'Slide ' + (currentIdx + 1) + ' / ' + deck.slides.length + ': ' + s.title;
          document.getElementById('presNotes').textContent = s.notes;
        }
        updatePresUI();
        document.getElementById('presPrev').addEventListener('click', () => {
          currentIdx = Math.max(0, currentIdx - 1);
          updatePresUI();
          if (syncChannel) syncChannel.postMessage({ type: 'SLIDE_CMD_GOTO', index: currentIdx });
        });
        document.getElementById('presNext').addEventListener('click', () => {
          currentIdx = Math.min(deck.slides.length - 1, currentIdx + 1);
          updatePresUI();
          if (syncChannel) syncChannel.postMessage({ type: 'SLIDE_CMD_GOTO', index: currentIdx });
        });
        if (syncChannel) {
          syncChannel.addEventListener('message', (e) => {
            if (e.data && e.data.type === 'SLIDE_SYNC') {
              currentIdx = e.data.index;
              updatePresUI();
            }
          });
        }
        return;
      }

      // Theme Toggle
      document.getElementById('btnTheme').addEventListener('click', () => {
        document.documentElement.classList.toggle('theme-light');
        document.documentElement.classList.toggle('theme-dark');
      });

      // Download Standalone .html & Raw .md
      function triggerBlobDownload(content, filename, mime) {
        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }

      document.getElementById('btnDownloadHtml').addEventListener('click', () => {
        triggerBlobDownload('<!DOCTYPE html>\\n' + document.documentElement.outerHTML, DECK_ID + '_standalone_slidev.html', 'text/html;charset=utf-8');
      });
      document.getElementById('btnDownloadMd').addEventListener('click', () => {
        triggerBlobDownload(currentRawMd, DECK_ID + '.md', 'text/markdown;charset=utf-8');
      });

      // Keyboard Shortcuts
      window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
          if (e.key === 'Escape') {
            overviewOverlay.classList.remove('is-open');
            editorOverlay.classList.remove('is-open');
          }
          return;
        }
        if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goToSlide(currentIdx + 1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); goToSlide(currentIdx - 1); }
        else if (e.key === 'o' || e.key === 'O' || e.key === '/') { e.preventDefault(); toggleOverview(); }
        else if (e.key === 'e' || e.key === 'E') { e.preventDefault(); document.getElementById('btnEditMd').click(); }
        else if (e.key === 'l' || e.key === 'L') { e.preventDefault(); document.getElementById('btnLaser').click(); }
        else if (e.key === 'd' || e.key === 'D') { e.preventDefault(); document.getElementById('btnDraw').click(); }
        else if (e.key === 'c' || e.key === 'C') { ctx.clearRect(0, 0, inkCanvas.width, inkCanvas.height); }
        else if (e.key === 'p' || e.key === 'P') { e.preventDefault(); document.getElementById('btnPresenter').click(); }
        else if (e.key === 'Escape') {
          overviewOverlay.classList.remove('is-open');
          editorOverlay.classList.remove('is-open');
        }
      });

      renderVirtualWindow();
    })();
  </script>
</body>
</html>`;
  }

  return {
    fnv1aHash: fnv1aHash,
    parseSlidevDeck: parseSlidevDeck,
    getCompiledDeck: getCompiledDeck,
    synthesizeStandaloneSlidevHtml: synthesizeStandaloneSlidevHtml
  };
});


;
// ==========================================
// MODULE: modules/speech-engine.js
// ==========================================
/**
 * ============================================================================
 * MODULE: Language-Aware Text-to-Speech Engine (src/modules/speech-engine.js)
 * Milestone: v01-03_bento-layout-playground
 * Purpose: Fault-tolerant, zero-dependency Web Speech API wrapper with:
 *   1. Feature-Detection Guard (zero crashes on unsupported browsers)
 *   2. Sentence-Chunk Queue (prevents Chrome 15-second utterance freeze)
 *   3. Async Voice Resolver (id-ID Bahasa Indonesia & en-US English)
 *   4. Code & ASCII Wireframe Sanitizer (skips code blocks & box chars)
 *   5. Lifecycle Auto-Cancel (stops ghost audio on navigation/hide)
 * ============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ArcadeSpeech = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEY_LANG = 'arcade_tts_lang';
  const ID_STOPWORDS = /\b(yang|dan|untuk|dengan|pada|adalah|dari|ini|itu|bisa|tanpa|atau|dalam|ke|di|oleh|akan|dapat|secara|langsung|halaman|tombol|klik|geser|layar|aplikasi|kode|langkah)\b/gi;
  const EN_STOPWORDS = /\b(the|and|for|with|from|this|that|without|using|into|click|drag|screen|button|slide|code|step|live|browser|offline|pure|native)\b/gi;

  let cachedVoices = [];
  let isPlaying = false;
  let currentLang = 'en-US'; // 'id-ID' or 'en-US'
  let chunkQueue = [];
  let activeUtterance = null;
  let stateListeners = [];

  /**
   * 1. Feature-Detection Guard
   */
  function isSupported() {
    try {
      return typeof window !== 'undefined' &&
        'speechSynthesis' in window &&
        typeof window.SpeechSynthesisUtterance === 'function';
    } catch (e) {
      return false;
    }
  }

  /**
   * Load persisted language preference ('id-ID' or 'en-US')
   */
  function loadSavedLang() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANG);
      if (saved === 'id-ID' || saved === 'en-US') {
        currentLang = saved;
      }
    } catch (e) {}
    return currentLang;
  }

  function saveLang(langCode) {
    currentLang = langCode === 'id-ID' ? 'id-ID' : 'en-US';
    try {
      localStorage.setItem(STORAGE_KEY_LANG, currentLang);
    } catch (e) {}
    notifyStateChange();
  }

  /**
   * 3. Async Voice Resolver (id-ID & en-US)
   */
  function refreshVoices() {
    if (!isSupported()) return [];
    try {
      const list = window.speechSynthesis.getVoices();
      if (Array.isArray(list) && list.length > 0) {
        cachedVoices = list;
      }
    } catch (e) {}
    return cachedVoices;
  }

  function pickBestVoice(langCode) {
    const voices = cachedVoices.length > 0 ? cachedVoices : refreshVoices();
    if (!voices || voices.length === 0) return null;

    const targetPrefix = (langCode || 'en-US').toLowerCase().slice(0, 2); // 'id' or 'en'
    const matching = voices.filter(v => (v.lang || '').toLowerCase().replace('_', '-').startsWith(targetPrefix));
    if (matching.length === 0) return null;

    // Prefer natural / Google / Microsoft neural voices
    const scored = matching.slice().sort((a, b) => {
      const score = (v) => {
        const name = (v.name || '').toLowerCase();
        let s = 0;
        if (name.includes('natural') || name.includes('online')) s += 5;
        if (name.includes('google') || name.includes('gadis') || name.includes('ardi') || name.includes('aria') || name.includes('guy')) s += 4;
        if (v.localService) s += 2;
        if (v.default) s += 1;
        return s;
      };
      return score(b) - score(a);
    });

    return scored[0] || matching[0];
  }

  /**
   * 4. Code & ASCII Sanitizer
   */
  function sanitizeForSpeech(rawInput) {
    if (!rawInput) return '';
    let text = String(rawInput);

    // Strip <pre>...</pre> and <code>...</code> blocks
    text = text.replace(/<pre[\s\S]*?<\/pre>/gi, ' ');
    text = text.replace(/```[\s\S]*?```/g, ' ');
    // Keep inline <code> text readable but remove tags
    text = text.replace(/<\/?[^>]+(>|$)/g, ' ');
    // Strip URLs
    text = text.replace(/https?:\/\/\S+/gi, ' ');
    // Strip ASCII box-drawing, arrows, and decorative symbols
    text = text.replace(/[\u2500-\u257F\u2580-\u259F═━│┃┌┐└┘├┤┬┴┼▸▾◀▶●★⚡📺🔬📋⬇️↗🐙🔊⏹🌐]/g, ' ');
    // Strip markdown formatting chars
    text = text.replace(/[#*_`~>|]/g, ' ');
    // Collapse whitespace
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  }

  /**
   * Lexical Language Auto-Detector ('id-ID' vs 'en-US')
   */
  function detectLanguage(text, explicitHint) {
    if (explicitHint) {
      const h = String(explicitHint).toLowerCase().trim();
      if (h.startsWith('id') || h === 'indonesian' || h === 'bahasa') return 'id-ID';
      if (h.startsWith('en') || h === 'english') return 'en-US';
    }
    const clean = sanitizeForSpeech(text);
    if (!clean) return currentLang;

    const idMatches = (clean.match(ID_STOPWORDS) || []).length;
    const enMatches = (clean.match(EN_STOPWORDS) || []).length;

    if (idMatches > enMatches && idMatches >= 2) return 'id-ID';
    if (enMatches > idMatches && enMatches >= 2) return 'en-US';
    return currentLang;
  }

  /**
   * 2. Sentence-Chunk Splitter (<= 160 chars per chunk to prevent Chrome freeze)
   */
  function splitIntoChunks(text, maxLen) {
    const limit = maxLen || 160;
    const clean = sanitizeForSpeech(text);
    if (!clean) return [];

    const rawSentences = clean.split(/(?<=[.!?।])\s+|\n+/);
    const chunks = [];

    rawSentences.forEach(sentence => {
      const trimmed = sentence.trim();
      if (!trimmed) return;
      if (trimmed.length <= limit) {
        chunks.push(trimmed);
      } else {
        // Split long sentence by comma or space
        const words = trimmed.split(/\s+/);
        let buf = '';
        words.forEach(w => {
          if ((buf + ' ' + w).trim().length > limit) {
            if (buf.trim()) chunks.push(buf.trim());
            buf = w;
          } else {
            buf = (buf ? buf + ' ' : '') + w;
          }
        });
        if (buf.trim()) chunks.push(buf.trim());
      }
    });

    return chunks;
  }

  let activeOptionsCallback = null;
  let cancelTimer = null;

  function notifyStateChange() {
    const stateStr = isPlaying ? 'speaking' : 'idle';
    const payload = {
      state: stateStr,
      isPlaying: isPlaying,
      lang: currentLang,
      shortLang: currentLang.startsWith('id') ? 'ID' : 'EN',
      supported: isSupported()
    };
    if (typeof activeOptionsCallback === 'function') {
      try { activeOptionsCallback(stateStr, currentLang, payload); } catch (e) {}
    }
    stateListeners.forEach(fn => {
      try { fn(payload, stateStr, currentLang); } catch (e) {}
    });
  }

  function playNextChunk() {
    if (!isSupported() || !isPlaying || chunkQueue.length === 0) {
      isPlaying = false;
      activeUtterance = null;
      notifyStateChange();
      return;
    }

    const nextText = chunkQueue.shift();
    try {
      const synth = window.speechSynthesis;
      if (synth.paused) {
        try { synth.resume(); } catch (e) {}
      }

      const utter = new window.SpeechSynthesisUtterance(nextText);
      utter.lang = currentLang;
      utter.rate = 1.0;
      utter.pitch = 1.0;
      utter.volume = 1.0;

      const voice = pickBestVoice(currentLang);
      if (voice) {
        try { utter.voice = voice; } catch (e) {}
      }

      utter.onend = function () {
        if (isPlaying) {
          playNextChunk();
        }
      };

      utter.onerror = function (ev) {
        // Ignore 'interrupted' or 'canceled' events triggered by prior cancel()
        if (ev && (ev.error === 'interrupted' || ev.error === 'canceled')) {
          return;
        }
        if (isPlaying && chunkQueue.length > 0) {
          playNextChunk();
          return;
        }
        isPlaying = false;
        chunkQueue = [];
        activeUtterance = null;
        notifyStateChange();
      };

      activeUtterance = utter;
      synth.speak(utter);
    } catch (e) {
      isPlaying = false;
      chunkQueue = [];
      activeUtterance = null;
      notifyStateChange();
    }
  }

  /**
   * Speak text in current or detected language
   */
  function speak(rawText, options) {
    if (!isSupported()) return false;
    const opts = options || {};
    if (typeof opts.onStateChange === 'function') {
      activeOptionsCallback = opts.onStateChange;
    }

    if (cancelTimer) {
      clearTimeout(cancelTimer);
      cancelTimer = null;
    }

    const synth = window.speechSynthesis;
    const hadActiveSpeech = Boolean(synth && (synth.speaking || synth.pending));
    if (hadActiveSpeech) {
      try { synth.cancel(); } catch (e) {}
    }

    if (opts.lang) {
      currentLang = String(opts.lang).toLowerCase().startsWith('id') ? 'id-ID' : 'en-US';
    } else if (opts.autoDetect) {
      currentLang = detectLanguage(rawText, opts.hintLang);
    }

    chunkQueue = splitIntoChunks(rawText, 160);
    if (chunkQueue.length === 0) {
      isPlaying = false;
      notifyStateChange();
      return false;
    }

    isPlaying = true;
    notifyStateChange();

    // Chromium Windows bug workaround: if synth.cancel() was just called,
    // wait 45ms before calling synth.speak() so Chromium doesn't cancel the new utterance.
    if (hadActiveSpeech) {
      cancelTimer = setTimeout(function () {
        cancelTimer = null;
        if (isPlaying) playNextChunk();
      }, 45);
    } else {
      playNextChunk();
    }
    return true;
  }

  /**
   * 5. Stop / Cancel Active Speech Safely
   */
  function stop() {
    if (cancelTimer) {
      clearTimeout(cancelTimer);
      cancelTimer = null;
    }
    chunkQueue = [];
    isPlaying = false;
    activeUtterance = null;
    if (isSupported()) {
      try {
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
          window.speechSynthesis.cancel();
        }
      } catch (e) {}
    }
    notifyStateChange();
  }

  function toggleSpeak(rawText, options) {
    if (options && typeof options.onStateChange === 'function') {
      activeOptionsCallback = options.onStateChange;
    }
    if (isPlaying) {
      stop();
      return false;
    }
    return speak(rawText, options);
  }

  function toggleLanguage(rawTextIfRestart) {
    const next = currentLang.startsWith('id') ? 'en-US' : 'id-ID';
    const wasPlaying = isPlaying;
    saveLang(next);
    if (wasPlaying && rawTextIfRestart) {
      speak(rawTextIfRestart, { lang: next });
    }
    return currentLang;
  }

  function onStateChange(callback) {
    if (typeof callback === 'function') {
      stateListeners.push(callback);
    }
  }

  // Initialize Voices & Lifecycle Auto-Cancel
  if (typeof window !== 'undefined') {
    loadSavedLang();
    if (isSupported()) {
      refreshVoices();
      try {
        if ('onvoiceschanged' in window.speechSynthesis) {
          window.speechSynthesis.addEventListener('voiceschanged', refreshVoices);
        }
      } catch (e) {}
    }
    window.addEventListener('pagehide', stop);
    window.addEventListener('beforeunload', stop);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && isPlaying) stop();
    });
  }

  return {
    isSupported: isSupported,
    speak: speak,
    stop: stop,
    toggle: toggleSpeak,
    toggleSpeak: toggleSpeak,
    toggleLanguage: toggleLanguage,
    detectLanguage: detectLanguage,
    sanitizeForSpeech: sanitizeForSpeech,
    getLanguage: function () { return currentLang; },
    getLang: function () { return currentLang; },
    setLanguage: saveLang,
    setLang: saveLang,
    isSpeaking: function () { return isPlaying; },
    onStateChange: onStateChange
  };
});


;
// ==========================================
// MODULE: modules/tts.js
// ==========================================
/**
 * ============================================================================
 * MODULE: Hybrid Compiled Text-to-Speech Engine (src/modules/tts.js)
 * Milestone: v01-03_bento-layout-playground
 * Architecture (Mirrors Hybrid Slidev Compiled Pipeline):
 *   1. PUBLIC PRE-COMPILED (Play Compiled in public/):
 *      Uses pre-compiled TTS chunks embedded at build time (0ms parse).
 *   2. CLIENT LOCALSTORAGE CACHE (Play Compiled Client Local Stored):
 *      Checks FNV-1a hash key `arcade_tts_v1_<hash>_<lang>` in localStorage.
 *   3. CLIENT-SIDE COMPILER (Play Compile Client-Side First):
 *      Compiles raw slide text -> strips code/ASCII -> expands math symbols ->
 *      splits into <=160-char chunks -> caches in localStorage -> plays!
 * ============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const instance = factory();
    root.ArcadeTTS = instance;
    root.ArcadeSpeech = instance;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const CACHE_PREFIX = 'arcade_tts_v1_';
  const STORAGE_KEY_LANG = 'arcade_tts_lang';

  const ID_STOPWORDS = /\b(yang|dan|untuk|dengan|pada|adalah|dari|ini|itu|bisa|tanpa|atau|dalam|ke|di|oleh|akan|dapat|secara|langsung|halaman|tombol|klik|geser|layar|aplikasi|kode|langkah|halo|saya|mau|catatan)\b/gi;
  const EN_STOPWORDS = /\b(the|and|for|with|from|this|that|without|using|into|click|drag|screen|button|slide|code|step|live|browser|offline|pure|native|calculates|transforms|renders)\b/gi;

  let cachedVoices = [];
  let isPlaying = false;
  let currentLang = 'en-US';
  let lastCacheSource = 'NONE'; // 'PUBLIC' | 'LOCAL_CACHE' | 'CLIENT_COMPILED'
  let chunkQueue = [];
  let activeUtterance = null;
  let activeOptionsCallback = null;
  let stateListeners = [];
  let cancelTimer = null;
  let watchdogTimer = null;

  /**
   * 1. Fast 32-bit FNV-1a Hash for Content-Addressed TTS Caching (< 0.1ms)
   */
  function fnv1aHash(str) {
    let h = 0x811c9dc5;
    const s = String(str || '').replace(/\r\n/g, '\n').trim();
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(16).toUpperCase().padStart(8, '0');
  }

  function normalizeLang(langCode) {
    return String(langCode || 'en-US').toLowerCase().startsWith('id') ? 'id-ID' : 'en-US';
  }

  /**
   * 2. Feature-Detection Guard
   */
  function isSupported() {
    try {
      return typeof window !== 'undefined' &&
        'speechSynthesis' in window &&
        typeof window.SpeechSynthesisUtterance === 'function';
    } catch (e) {
      return false;
    }
  }

  /**
   * 3. Sanitize Raw Slide Content & Expand Math Symbols for Speech
   */
  function sanitizeForSpeech(rawInput, langCode) {
    if (!rawInput) return '';
    const isId = normalizeLang(langCode) === 'id-ID';
    let text = String(rawInput);

    // Strip <pre>...</pre> and fenced code blocks
    text = text.replace(/<pre[\s\S]*?<\/pre>/gi, ' ');
    text = text.replace(/```[\s\S]*?```/g, ' ');
    // Strip HTML tags
    text = text.replace(/<\/?[^>]+(>|$)/g, ' ');
    // Strip URLs
    text = text.replace(/https?:\/\/\S+/gi, ' ');

    // Expand common mathematical & technical symbols into natural spoken words
    text = text.replace(/√(\d+)\s*\/\s*(\d+)/g, isId ? 'akar $1 per $2' : 'square root of $1 over $2');
    text = text.replace(/√(\d+)/g, isId ? 'akar $1' : 'square root of $1');
    text = text.replace(/(\d+)\s*\/\s*(\d+)/g, isId ? '$1 per $2' : '$1 over $2');
    text = text.replace(/π/g, 'pi');
    text = text.replace(/θ/g, 'theta');
    text = text.replace(/°/g, isId ? ' derajat ' : ' degrees ');

    // Strip ASCII wireframe box-drawing characters and UI icons
    text = text.replace(/[\u2500-\u257F\u2580-\u259F═━│┃┌┐└┘├┤┬┴┼▸▾◀▶●★⚡📺🔬📋⬇️↗🐙🔊⏹🌐📐]/g, ' ');
    text = text.replace(/[#*_`~>|]/g, ' ');

    return text.replace(/\s+/g, ' ').trim();
  }

  /**
   * 4. Lexical Language Detector ('id-ID' vs 'en-US')
   */
  function detectLanguage(text, explicitHint) {
    if (explicitHint) {
      const h = String(explicitHint).toLowerCase().trim();
      if (h.startsWith('id') || h === 'indonesian' || h === 'bahasa') return 'id-ID';
      if (h.startsWith('en') || h === 'english') return 'en-US';
    }
    const clean = sanitizeForSpeech(text, 'en-US');
    if (!clean) return currentLang;

    const idMatches = (clean.match(ID_STOPWORDS) || []).length;
    const enMatches = (clean.match(EN_STOPWORDS) || []).length;

    if (idMatches > enMatches && idMatches >= 1) return 'id-ID';
    if (enMatches >= idMatches && enMatches >= 1) return 'en-US';
    return currentLang;
  }

  /**
   * 5. Sentence-Chunk Compiler (<= 160 chars per chunk to prevent Chromium freeze)
   */
  function splitIntoChunks(text, langCode, maxLen) {
    const limit = maxLen || 160;
    const clean = sanitizeForSpeech(text, langCode);
    if (!clean) return [];

    const rawSentences = clean.split(/(?<=[.!?])\s+|\n+/);
    const chunks = [];

    rawSentences.forEach(sentence => {
      const trimmed = sentence.trim();
      if (!trimmed) return;
      if (trimmed.length <= limit) {
        chunks.push(trimmed);
      } else {
        const words = trimmed.split(/\s+/);
        let buf = '';
        words.forEach(w => {
          if ((buf + ' ' + w).trim().length > limit) {
            if (buf.trim()) chunks.push(buf.trim());
            buf = w;
          } else {
            buf = (buf ? buf + ' ' : '') + w;
          }
        });
        if (buf.trim()) chunks.push(buf.trim());
      }
    });

    return chunks;
  }

  /**
   * 6. Compile TTS Payload (Used at Build Time for public/ AND Client-Side on 1st Play)
   */
  function compileTtsPayload(rawText, langCode) {
    const lang = normalizeLang(langCode || detectLanguage(rawText));
    const hash = fnv1aHash(rawText);
    const chunksEn = splitIntoChunks(rawText, 'en-US', 160);
    const chunksId = splitIntoChunks(rawText, 'id-ID', 160);
    return {
      hash: hash,
      defaultLang: lang,
      chunks: {
        'en-US': chunksEn,
        'id-ID': chunksId
      },
      compiledAt: Date.now()
    };
  }

  /**
   * 7. 3-STAGE HYBRID TTS RESOLVER:
   *    Stage 1: Play Compiled in public/ (precompiledPayload or window.__ARCADE_PRECOMPILED_TTS__)
   *    Stage 2: Play Compiled from Client localStorage (`arcade_tts_v1_<hash>_<lang>`)
   *    Stage 3: Compile Client-Side First -> Save to localStorage -> Return Chunks
   */
  function resolveCompiledChunks(rawText, langCode, precompiledPayload) {
    const lang = normalizeLang(langCode);
    const hash = fnv1aHash(rawText);
    const storageKey = `${CACHE_PREFIX}${hash}`;

    // STAGE 1: Check Pre-Compiled Payload from public/ build
    if (precompiledPayload && precompiledPayload.hash === hash && precompiledPayload.chunks && Array.isArray(precompiledPayload.chunks[lang])) {
      lastCacheSource = 'PUBLIC';
      return precompiledPayload.chunks[lang].slice();
    }
    if (typeof window !== 'undefined' && window.__ARCADE_PRECOMPILED_TTS__ && window.__ARCADE_PRECOMPILED_TTS__[hash]) {
      const pubEntry = window.__ARCADE_PRECOMPILED_TTS__[hash];
      if (pubEntry && pubEntry.chunks && Array.isArray(pubEntry.chunks[lang])) {
        lastCacheSource = 'PUBLIC';
        return pubEntry.chunks[lang].slice();
      }
    }

    // STAGE 2: Check Client localStorage Compiled Cache
    if (typeof localStorage !== 'undefined') {
      try {
        const rawSaved = localStorage.getItem(storageKey);
        if (rawSaved) {
          const parsed = JSON.parse(rawSaved);
          if (parsed && parsed.hash === hash && parsed.chunks && Array.isArray(parsed.chunks[lang])) {
            lastCacheSource = 'LOCAL_CACHE';
            return parsed.chunks[lang].slice();
          }
        }
      } catch (e) {}
    }

    // STAGE 3: Compile Client-Side First & Store in Client localStorage
    const compiled = compileTtsPayload(rawText, lang);
    lastCacheSource = 'CLIENT_COMPILED';
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(compiled));
      } catch (e) {}
    }
    return (compiled.chunks[lang] || []).slice();
  }

  /**
   * 8. Voice Resolver & Playback Engine
   */
  function refreshVoices() {
    if (!isSupported()) return [];
    try {
      const list = window.speechSynthesis.getVoices();
      if (Array.isArray(list) && list.length > 0) {
        cachedVoices = list;
      }
    } catch (e) {}
    return cachedVoices;
  }

  function pickBestVoice(langCode) {
    const voices = cachedVoices.length > 0 ? cachedVoices : refreshVoices();
    if (!voices || voices.length === 0) return null;

    const targetPrefix = normalizeLang(langCode).slice(0, 2); // 'id' or 'en'
    const matching = voices.filter(v => String(v.lang || '').toLowerCase().replace('_', '-').startsWith(targetPrefix));
    if (matching.length === 0) return null;

    // Prefer reliable local OS voices first so offline/isolated profiles never stall
    const scored = matching.slice().sort((a, b) => {
      const score = (v) => {
        const name = String(v.name || '').toLowerCase();
        let s = 0;
        if (v.localService) s += 5;
        if (name.includes('natural') || name.includes('google') || name.includes('gadis') || name.includes('ardi') || name.includes('david') || name.includes('zira') || name.includes('aria')) s += 3;
        if (v.default) s += 1;
        return s;
      };
      return score(b) - score(a);
    });

    return scored[0] || matching[0];
  }

  function notifyStateChange() {
    const stateStr = isPlaying ? 'speaking' : 'idle';
    const payload = {
      state: stateStr,
      isPlaying: isPlaying,
      lang: currentLang,
      shortLang: currentLang.startsWith('id') ? 'ID' : 'EN',
      source: lastCacheSource,
      supported: isSupported()
    };
    if (typeof activeOptionsCallback === 'function') {
      try { activeOptionsCallback(stateStr, currentLang, payload); } catch (e) {}
    }
    stateListeners.forEach(fn => {
      try { fn(payload, stateStr, currentLang); } catch (e) {}
    });
  }

  function clearTimers() {
    if (cancelTimer) {
      clearTimeout(cancelTimer);
      cancelTimer = null;
    }
    if (watchdogTimer) {
      clearTimeout(watchdogTimer);
      watchdogTimer = null;
    }
  }

  function playNextChunk(useFallbackDefaultVoice) {
    if (!isSupported() || !isPlaying || chunkQueue.length === 0) {
      isPlaying = false;
      activeUtterance = null;
      notifyStateChange();
      return;
    }

    const nextText = chunkQueue.shift();
    try {
      const synth = window.speechSynthesis;
      if (synth.paused) {
        try { synth.resume(); } catch (e) {}
      }

      const utter = new window.SpeechSynthesisUtterance(nextText);
      utter.lang = currentLang;
      utter.rate = 1.0;
      utter.pitch = 1.0;
      utter.volume = 1.0;

      if (!useFallbackDefaultVoice) {
        const voice = pickBestVoice(currentLang);
        if (voice) {
          try { utter.voice = voice; } catch (e) {}
        }
      }

      let hasStarted = false;
      utter.onstart = function () {
        hasStarted = true;
        if (watchdogTimer) {
          clearTimeout(watchdogTimer);
          watchdogTimer = null;
        }
      };

      utter.onend = function () {
        if (watchdogTimer) {
          clearTimeout(watchdogTimer);
          watchdogTimer = null;
        }
        if (isPlaying) {
          playNextChunk(useFallbackDefaultVoice);
        }
      };

      utter.onerror = function (ev) {
        if (watchdogTimer) {
          clearTimeout(watchdogTimer);
          watchdogTimer = null;
        }
        if (ev && (ev.error === 'interrupted' || ev.error === 'canceled')) {
          return;
        }
        // If custom voice failed, retry this chunk once with browser default voice
        if (!useFallbackDefaultVoice && isPlaying) {
          chunkQueue.unshift(nextText);
          playNextChunk(true);
          return;
        }
        if (isPlaying && chunkQueue.length > 0) {
          playNextChunk(true);
          return;
        }
        isPlaying = false;
        chunkQueue = [];
        activeUtterance = null;
        notifyStateChange();
      };

      activeUtterance = utter;
      synth.speak(utter);

      // Watchdog: if Chromium speech queue is paused/stuck after 700ms, kick resume()
      watchdogTimer = setTimeout(function () {
        if (isPlaying && !hasStarted && isSupported()) {
          try {
            window.speechSynthesis.resume();
          } catch (e) {}
        }
      }, 700);
    } catch (e) {
      isPlaying = false;
      chunkQueue = [];
      activeUtterance = null;
      notifyStateChange();
    }
  }

  function speak(rawText, options) {
    if (!isSupported()) return false;
    const opts = options || {};
    if (typeof opts.onStateChange === 'function') {
      activeOptionsCallback = opts.onStateChange;
    }

    clearTimers();

    const synth = window.speechSynthesis;
    const hadActiveSpeech = Boolean(synth && (synth.speaking || synth.pending));
    if (hadActiveSpeech) {
      try { synth.cancel(); } catch (e) {}
    }

    if (opts.lang) {
      currentLang = normalizeLang(opts.lang);
    } else if (opts.autoDetect) {
      currentLang = detectLanguage(rawText, opts.hintLang);
    }

    // 3-Stage Hybrid Resolution: 1. Public Pre-Compiled -> 2. Client LocalStorage -> 3. Client Compile First
    chunkQueue = resolveCompiledChunks(rawText, currentLang, opts.precompiled);
    if (chunkQueue.length === 0) {
      isPlaying = false;
      notifyStateChange();
      return false;
    }

    isPlaying = true;
    notifyStateChange();

    if (hadActiveSpeech) {
      cancelTimer = setTimeout(function () {
        cancelTimer = null;
        if (isPlaying) playNextChunk(false);
      }, 50);
    } else {
      playNextChunk(false);
    }
    return true;
  }

  function stop() {
    clearTimers();
    chunkQueue = [];
    isPlaying = false;
    activeUtterance = null;
    if (isSupported()) {
      try {
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
          window.speechSynthesis.cancel();
        }
      } catch (e) {}
    }
    notifyStateChange();
  }

  function toggleSpeak(rawText, options) {
    if (options && typeof options.onStateChange === 'function') {
      activeOptionsCallback = options.onStateChange;
    }
    if (isPlaying) {
      stop();
      return false;
    }
    return speak(rawText, options);
  }

  function saveLang(langCode) {
    currentLang = normalizeLang(langCode);
    if (typeof localStorage !== 'undefined') {
      try { localStorage.setItem(STORAGE_KEY_LANG, currentLang); } catch (e) {}
    }
    notifyStateChange();
  }

  function toggleLanguage(rawTextIfRestart, precompiled) {
    const next = currentLang.startsWith('id') ? 'en-US' : 'id-ID';
    const wasPlaying = isPlaying;
    saveLang(next);
    if (wasPlaying && rawTextIfRestart) {
      speak(rawTextIfRestart, { lang: next, precompiled: precompiled });
    }
    return currentLang;
  }

  function onStateChange(callback) {
    if (typeof callback === 'function') {
      stateListeners.push(callback);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANG);
      if (saved === 'id-ID' || saved === 'en-US') currentLang = saved;
    } catch (e) {}

    if (isSupported()) {
      refreshVoices();
      try {
        if ('onvoiceschanged' in window.speechSynthesis) {
          window.speechSynthesis.addEventListener('voiceschanged', refreshVoices);
        }
      } catch (e) {}
    }
    window.addEventListener('pagehide', stop);
    window.addEventListener('beforeunload', stop);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && isPlaying) stop();
    });
  }

  return {
    fnv1aHash: fnv1aHash,
    compileTtsPayload: compileTtsPayload,
    resolveCompiledChunks: resolveCompiledChunks,
    isSupported: isSupported,
    speak: speak,
    stop: stop,
    toggle: toggleSpeak,
    toggleSpeak: toggleSpeak,
    toggleLanguage: toggleLanguage,
    detectLanguage: detectLanguage,
    sanitizeForSpeech: sanitizeForSpeech,
    getLanguage: function () { return currentLang; },
    getLang: function () { return currentLang; },
    setLanguage: saveLang,
    setLang: saveLang,
    getCacheSource: function () { return lastCacheSource; },
    isSpeaking: function () { return isPlaying; },
    onStateChange: onStateChange
  };
});


;
// ==========================================
// MODULE: modules/pipeline-optimizer.js
// ==========================================
/**
 * ============================================================================
 * MODULE: Pipeline Optimizer & In-Browser Code Compactor
 * Purpose: Provides high-speed CSS, HTML, and JS regex compaction routines
 *          for zero-dependency environments and browser staging.
 * ============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ArcadeOptimizer = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Compact CSS code by stripping comments, collapsing whitespace & operators
   * @param {string} css
   * @returns {string}
   */
  function compactCSS(css) {
    if (!css) return '';
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '')       // Strip all comments
      .replace(/\s*([{};:,>+~])\s*/g, '$1')   // Remove spaces around syntax delimiters
      .replace(/;\}/g, '}')                   // Remove redundant trailing semicolons
      .replace(/\s+/g, ' ')                   // Collapse multiple spaces to single
      .trim();
  }

  /**
   * Compact HTML code while preserving preformatted tags
   * @param {string} html
   * @returns {string}
   */
  function compactHTML(html) {
    if (!html) return '';
    return html
      .replace(/<!--(?!\[if)[\s\S]*?-->/g, '') // Strip standard HTML comments
      .replace(/>\s+</g, '><')                // Remove whitespace between tags
      .replace(/\s{2,}/g, ' ')                // Collapse excess spaces
      .trim();
  }

  /**
   * Calculate size savings and return formatted metric
   * @param {number} beforeBytes
   * @param {number} afterBytes
   */
  function calculateSavings(beforeBytes, afterBytes) {
    const saved = beforeBytes - afterBytes;
    const percent = beforeBytes > 0 ? ((saved / beforeBytes) * 100).toFixed(1) : '0.0';
    return {
      beforeKb: (beforeBytes / 1024).toFixed(2),
      afterKb: (afterBytes / 1024).toFixed(2),
      savedKb: (saved / 1024).toFixed(2),
      percent: percent + '%'
    };
  }

  return {
    compactCSS: compactCSS,
    compactHTML: compactHTML,
    calculateSavings: calculateSavings
  };
});


;
// ==========================================
// MODULE: modules/playground.js
// ==========================================
/**
 * ============================================================================
 * MODULE: Dual-Panel Interactive Playground Engine (src/modules/playground.js)
 * Purpose: Powers the split-screen sandbox, bento layout, live iframe runner,
 *          Slidev component deck, and keyboard shortcuts.
 * ============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ArcadePlayground = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // --------------------------------------------------------------------------
  // MODULAR APPS DATASET (7 COMPLETE APPLICATIONS)
  // --------------------------------------------------------------------------
  const APPS_REGISTRY = {
    'vibe-arcade-deck': {
      id: 'vibe-arcade-deck',
      name: 'Modular Slidev Hybrid Deck',
      slug: 'vibe-arcade-deck',
      scope: 'Slidev & Presentation',
      srcUrl: 'apps/vibe-arcade-deck/index.html',
      downloadName: 'vibe-arcade-deck.html',
      externalUrl: 'apps/vibe-arcade-deck/index.html',
      githubUrl: 'https://github.com/pakcli/fadhlisl-my-id',
      lang: 'en-US',
      tutorials: [
        {
          step: 'STEP 1 OF 3: HYBRID CACHE & NAV',
          title: '1. Navigate & Verify FNV-1a Cache Hit',
          text: 'Use Next/Prev or Arrow Keys inside the stage. Notice the top badge showing FNV-1a Hash Cache Hit on repeat opens with automatic slide resume.'
        },
        {
          step: 'STEP 2 OF 3: LIVE EDIT & RUN JS',
          title: '2. Click [✏️ Edit] or [▶ Run Code]',
          text: 'Go to Slide 3 and click "▶ Run Code" to execute live JS inside the slide, or click "✏️ Edit [E]" to live-edit raw Slidev Markdown in the browser.'
        },
        {
          step: 'STEP 3 OF 3: PRESENTER & LASER',
          title: '3. Presenter Console [P], Laser [L] & Draw [D]',
          text: 'Click "⊞ Grid [O]" for Storyboard Overview, "🔴 Laser [L]" / "🖊️ Draw [D]" for live annotations, or "🎙️ Presenter [P]" for Dual-Screen BroadcastChannel sync.'
        }
      ],
      components: [
        {
          tag: 'COMPONENT: FNV1A_HASH_CACHE',
          title: '1. FNV-1a 32-Bit Hash & First-Open Cache',
          desc: 'Computes a fast 32-bit FNV-1a hash of the raw Markdown deck. On first open, it compiles and stores the slides in localStorage; repeat visits skip parsing (< 1ms).',
          filename: 'slidev-engine.js',
          code: `function fnv1aHash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).toUpperCase().padStart(8, '0');
}`
        },
        {
          tag: 'COMPONENT: VIRTUAL_3SLIDE_DOM',
          title: '2. Virtual 3-Slide DOM Window (Prev | Active | Next)',
          desc: 'Instead of mounting all slides at once, only the previous, current, and next slide nodes are mounted in the DOM for locked 60 FPS on Mobile Portrait.',
          filename: 'virtual_stage.js',
          code: `const windowIndices = [currentIdx - 1, currentIdx, currentIdx + 1]
  .filter(i => i >= 0 && i < total);
mountNode.innerHTML = windowIndices.map(i => renderSlide(deck.slides[i])).join('');`
        },
        {
          tag: 'COMPONENT: BROADCAST_PRESENTER',
          title: '3. Dual-Screen Presenter Sync via BroadcastChannel',
          desc: 'Synchronizes the Audience Stage and Presenter Console (Speaker Notes + Timer) across browser tabs with zero backend or WebSockets.',
          filename: 'presenter_sync.js',
          code: `const syncChannel = new BroadcastChannel('arcade_slidev_sync');
syncChannel.postMessage({
  type: 'SLIDE_SYNC',
  index: currentIdx,
  notes: deck.slides[currentIdx].notes
});`
        }
      ]
    },
    'ksi': {
      id: 'ksi',
      name: 'Unit Circle Resolver',
      slug: 'unit-circle',
      scope: 'Math & Visualization',
      srcUrl: 'apps/radiansincostan/index.html',
      downloadName: 'interactive-unit-circle.html',
      externalUrl: 'apps/radiansincostan/index.html',
      githubUrl: 'https://github.com/pakcli/fadhlisl-my-id',
      lang: 'en-US',
      tutorials: [
        {
          step: 'STEP 1 OF 3: TEST DRIVE',
          title: '1. Drag the Angle Point',
          text: 'Click and drag the circular control point around the perimeter. Watch the degree angle update along with the live π radian conversion.'
        },
        {
          step: 'STEP 2 OF 3: RADICAL SNAP',
          title: '2. Special Angle Snapping',
          text: 'When "Snap: on" is active, dragging near 30°, 45°, 60°, or 90° locks precisely to exact radical values like √2/2 and √3/2 rather than decimal approximations.'
        },
        {
          step: 'STEP 3 OF 3: PLAYBACK LOOP',
          title: '3. Animation Loop',
          text: 'Click "▶ Play" and "⟲ Loop" on the vertical slider to see the unit circle run continuous periodic waveforms through all 4 quadrants.'
        }
      ],
      components: [
        {
          tag: 'COMPONENT: SVG_WEDGE_ENGINE',
          title: '1. Dynamic SVG Arc & Wedge Geometry',
          desc: 'Instead of heavy canvas rendering libraries, the arc wedge is calculated with native SVG Arc Path commands (M, L, A) dynamically tracking the angle theta.',
          filename: 'wedge_calculator.js',
          code: `// Calculating dynamic SVG path
const r = ang * Math.PI / 180;
const x = cx + R * Math.cos(r);
const y = cy - R * Math.sin(r);

// Generate SVG Arc wedge
const wr = 44;
wedge.setAttribute("d", 
  \`M\${cx},\${cy} L\${cx+wr},\${cy} A\${wr},\${wr} 0 \${ang>180?1:0} 0 \${cx+wr*Math.cos(r)},\${cy-wr*Math.sin(r)}Z\`
);`
        },
        {
          tag: 'COMPONENT: RADICAL_SOLVER',
          title: '2. Exact Fraction & Radical Simplifier',
          desc: 'A lookup map resolves exact mathematical radical strings (e.g. √3/2, √2/2) for standard trigonometric milestones without floating point precision jitter.',
          filename: 'radical_table.js',
          code: `const T = {0:[0], 30:[1,2], 45:["√2",2], 60:["√3",2], 90:[1,1]};

function sinRef(d) {
  d = ((d % 360) + 360) % 360;
  let r = d % 180;
  if (r > 90) r = 180 - r;
  if (!(r in T)) return null;
  return { r, neg: d > 180 };
}`
        },
        {
          tag: 'COMPONENT: POINTER_EVENT_CAPTURE',
          title: '3. High-Precision Pointer Event Matrix',
          desc: 'Pointer events are transformed through SVG screen CTM (Current Transformation Matrix) to guarantee zero-lag drag response on mobile touch and desktop mice.',
          filename: 'pointer_math.js',
          code: `function move(e) {
  const p = svg.createSVGPoint();
  p.x = e.clientX; p.y = e.clientY;
  const q = p.matrixTransform(svg.getScreenCTM().inverse());
  let a = Math.atan2(cy - q.y, q.x - cx) * 180 / Math.PI;
  if (a < 0) a += 360;
  ang = snap ? snapToSpecial(a) : Math.round(a * 10) / 10;
  upd();
}`
        },
        {
          tag: 'COMPONENT: SINGLE_FILE_COMPILATION',
          title: '4. Zero-Dependency Standalone Runtime',
          desc: 'CSS custom properties, SVG DOM generator, and math engine bundled in under 7 KB without React, Vue, or Webpack overhead.',
          filename: 'build_manifest.json',
          code: `{
  "app": "interactive-unit-circle",
  "version": "1.0.0",
  "bundle_size": "6.8 KB",
  "dependencies": 0,
  "offline_ready": true,
  "tested_browsers": ["Chrome", "Safari iOS", "Firefox", "Edge"]
}`
        }
      ]
    },
    'lotek-offline': {
      id: 'lotek-offline',
      name: "Bude's Lotek Order",
      slug: 'lotek-ordering',
      scope: 'Web & WhatsApp CRM',
      srcUrl: 'apps/lotek-offline.html',
      downloadName: 'bude-lotek-order.html',
      externalUrl: 'apps/lotek-offline.html',
      githubUrl: 'https://github.com/pakcli/fadhlisl-my-id',
      lang: 'id-ID',
      tutorials: [
        {
          step: 'STEP 1 OF 3: SELECT DISHES',
          title: '1. Select Menu & Customizations',
          text: 'Pick portions of Lotek, Gado-Gado, or Karedok. Configure spicy level (Cabe 1 s/d 10).'
        },
        {
          step: 'STEP 2 OF 3: CART CALCULATION',
          title: '2. Client-Side Subtotal',
          text: 'Item quantities and prices calculate locally using LocalStorage persistence with zero server database calls.'
        },
        {
          step: 'STEP 3 OF 3: WHATSAPP CHECKOUT',
          title: '3. Direct WhatsApp Checkout',
          text: 'Clicking order compiles all cart items into a clean, sanitized WhatsApp URI payload ready to send directly to the merchant.'
        }
      ],
      components: [
        {
          tag: 'COMPONENT: WA_PAYLOAD_COMPILER',
          title: '1. URL-Encoded WhatsApp Payload Engine',
          desc: 'Transforms the JSON order cart into structured WhatsApp formatting with bold headers, bullet items, and total pricing.',
          filename: 'wa_compiler.js',
          code: `function compileWaPayload(cart, customer) {
  let msg = \`*HALO BUDE, SAYA MAU ORDER:*\\n\\n\`;
  cart.forEach(item => {
    msg += \`• \${item.name} (\${item.qty}x) - Rp \${item.total}\\n\`;
    if (item.notes) msg += \`  _Catatan: \${item.notes}_\\n\`;
  });
  msg += \`\\n*TOTAL: Rp \${calculateTotal(cart)}*\`;
  return \`https://wa.me/\${MERCHANT_PHONE}?text=\${encodeURIComponent(msg)}\`;
}`
        },
        {
          tag: 'COMPONENT: LOCALSTORAGE_PERSIST',
          title: '2. Zero-Database LocalStorage State',
          desc: 'Preserves cart items across accidental refreshes or mobile network drops without requiring a login or session cookie.',
          filename: 'cart_store.js',
          code: `const CartStore = {
  get: () => JSON.parse(localStorage.getItem('bude_cart') || '[]'),
  save: (data) => localStorage.setItem('bude_cart', JSON.stringify(data)),
  clear: () => localStorage.removeItem('bude_cart')
};`
        }
      ]
    },
    'wa-parser': {
      id: 'wa-parser',
      name: 'WA Text & Regex Sanitizer',
      slug: 'wa-text-parser',
      scope: 'Utility & Text',
      srcUrl: 'apps/wa-parser.html',
      downloadName: 'wa-text-parser.html',
      externalUrl: 'apps/wa-parser.html',
      tutorials: [
        {
          step: 'STEP 1 OF 3: PASTE RAW TEXT',
          title: '1. Input Unstructured Notes',
          text: 'Paste any unstructured notes, meeting minutes, or bullet lists into the raw editor pane.'
        },
        {
          step: 'STEP 2 OF 3: REGEX CLEANSE',
          title: '2. Automatic Format & Sanitize',
          text: 'Regex passes strip excess linebreaks, format numbers into bold WhatsApp markdown, and convert bullet dashes to clean emoji points.'
        },
        {
          step: 'STEP 3 OF 3: 1-CLICK CLIPBOARD',
          title: '3. Instant Copy & WhatsApp Link',
          text: 'Click copy to grab the formatted clipboard content or generate a direct wa.me deep-link ready to paste into any chat.'
        }
      ],
      components: [
        {
          tag: 'COMPONENT: REGEX_CLEANSER',
          title: '1. Multi-Stage Regex Pipeline',
          desc: 'Executes chained regular expressions to sanitize raw clipboard text into standard WhatsApp Markdown syntax in sub-millisecond execution time.',
          filename: 'regex_pipeline.js',
          code: `function sanitizeText(raw) {
  return raw
    .replace(/^[•\\-\\*]\\s+/gm, '• ')
    .replace(/(\\d+)\\.\\s+/g, '*$1.* ')
    .replace(/\\n{3,}/g, '\\n\\n')
    .trim();
}`
        },
        {
          tag: 'COMPONENT: CLIPBOARD_API',
          title: '2. Native Async Clipboard Bridge',
          desc: 'Uses modern Navigator Clipboard API with instant visual feedback and legacy fallback for maximum device compatibility.',
          filename: 'clipboard_bridge.js',
          code: `async function copyOutput(text) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();
  return true;
}`
        }
      ]
    },
    'pdf-editor': {
      id: 'pdf-editor',
      name: 'Client PDF Editor & Compress',
      slug: 'client-pdf-editor',
      scope: 'Tools & Privacy',
      srcUrl: 'apps/pdf-editor.html',
      downloadName: 'client-pdf-editor.html',
      externalUrl: 'apps/pdf-editor.html',
      tutorials: [
        {
          step: 'STEP 1 OF 3: LOAD LOCAL FILE',
          title: '1. Drag & Drop PDF',
          text: 'Drop any PDF into the browser viewport. The file stays 100% in local memory and is never uploaded to any remote server.'
        },
        {
          step: 'STEP 2 OF 3: CANVAS RASTERIZE',
          title: '2. Client-Side Page Rendering',
          text: 'PDF pages are rasterized onto HTML5 Canvas elements for fast browser-native preview and thumbnail inspection.'
        },
        {
          step: 'STEP 3 OF 3: WEBP COMPRESSION',
          title: '3. Web Worker Image Compression',
          text: 'A client-side worker recompresses embedded bitmaps into WebP/JPEG, reducing overall file size by up to 85%.'
        }
      ],
      components: [
        {
          tag: 'COMPONENT: CANVAS_RASTERIZER',
          title: '1. Client-Side Page Renderer',
          desc: 'Renders PDF pages directly into offscreen HTML5 canvas elements for private, in-browser document processing without server roundtrips.',
          filename: 'canvas_renderer.js',
          code: `async function renderPageToCanvas(page, scale = 1.5) {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
  return canvas;
}`
        },
        {
          tag: 'COMPONENT: PRIVACY_SANDBOX',
          title: '2. 100% Airgap Execution Sandbox',
          desc: 'Guarantees zero network calls (fetch and XMLHttpRequest disabled in worker scope) ensuring full GDPR and confidential file privacy.',
          filename: 'security_policy.json',
          code: `{
  "network_access": false,
  "server_upload": null,
  "encryption": "in-memory only",
  "offline_capable": true
}`
        }
      ]
    },
    'islam-memes': {
      id: 'islam-memes',
      name: 'Islam BFITW Box Generator',
      slug: 'islam-bfitw-box',
      scope: 'Retro & ASCII',
      srcUrl: 'apps/islam-memes.html',
      downloadName: 'islam-bfitw-box.html',
      externalUrl: 'apps/islam-memes.html',
      tutorials: [
        {
          step: 'STEP 1 OF 3: SELECT QUOTE',
          title: '1. Pick Champion Quote',
          text: 'Select iconic quotes from lightweight king Islam Makhachev ("Who give him belt?", "We have to check this", "Best in the world").'
        },
        {
          step: 'STEP 2 OF 3: MONOSPACE MATRIX',
          title: '2. ASCII Frame Generator',
          text: 'The engine dynamically calculates string byte length and pads clean Unicode box-drawing characters (┌─┐, │ │, └─┘).'
        },
        {
          step: 'STEP 3 OF 3: TERMINAL EXPORT',
          title: '3. 1-Click Terminal Copy',
          text: 'Copy formatted text directly to clipboard for instant pasting into Discord, Twitter/X, or GitHub commit messages.'
        }
      ],
      components: [
        {
          tag: 'COMPONENT: BOX_DRAWING_ALGORITHM',
          title: '1. Dynamic ASCII Box-Drawing Engine',
          desc: 'Calculates string width across multi-line strings to draw pixel-perfect monospace borders with aligned corner joints.',
          filename: 'ascii_box.js',
          code: `function drawBox(text) {
  const lines = text.split('\\n');
  const width = Math.max(...lines.map(l => l.length));
  const top = '┌' + '─'.repeat(width + 2) + '┐';
  const bot = '└' + '─'.repeat(width + 2) + '┘';
  const body = lines.map(l => '│ ' + l.padEnd(width) + ' │').join('\\n');
  return \`\${top}\\n\${body}\\n\${bot}\`;
}`
        }
      ]
    },
    'family-quiz': {
      id: 'family-quiz',
      name: 'Family Quiz Engine',
      slug: 'family-quiz-game',
      scope: 'Game & Audio',
      srcUrl: 'apps/family-quiz.html',
      downloadName: 'family-quiz-game.html',
      externalUrl: 'apps/family-quiz.html',
      tutorials: [
        {
          step: 'STEP 1 OF 3: ROUND COUNTDOWN',
          title: '1. Dynamic Timer Loop',
          text: 'Each question starts a high-tension 15-second countdown loop driven by requestAnimationFrame.'
        },
        {
          step: 'STEP 2 OF 3: SYNTH AUDIO FX',
          title: '2. Web Audio Synthesizer',
          text: 'Zero MP3 or WAV audio assets. All sound effects (correct buzzer, wrong chord, tick countdown) are generated with native Web Audio oscillators.'
        },
        {
          step: 'STEP 3 OF 3: LOCAL LEADERBOARD',
          title: '3. Offline High-Score Board',
          text: 'Scores are recorded in LocalStorage with player names and timestamps without needing any server database.'
        }
      ],
      components: [
        {
          tag: 'COMPONENT: WEB_AUDIO_SYNTH',
          title: '1. Zero-Asset Audio Oscillator Synthesizer',
          desc: 'Synthesizes retro chiptune sound effects entirely with native Web Audio API oscillators and gain nodes without loading external audio files.',
          filename: 'audio_synth.js',
          code: `function playTone(freq, type = 'sine', duration = 0.15) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}`
        }
      ]
    }
  };

  // Explicit Aliases for Trigonometric Unit Circle
  APPS_REGISTRY['radiansincostan'] = APPS_REGISTRY['ksi'];
  APPS_REGISTRY['unit-circle'] = APPS_REGISTRY['ksi'];

  // Constants & Storage
  const STORAGE_KEY_HISTORY = 'arcade_search_history';
  const STORAGE_KEY_SPLIT = 'arcade_bento_split_pct';
  const STORAGE_KEY_STEPS_COLLAPSED = 'arcade_steps_collapsed';

  let activeAppKey = 'ksi';
  let appData = APPS_REGISTRY['ksi'];
  let currentTutorialIdx = 0;
  let currentSlidevIdx = 0;
  const ZOOM_STEPS = [0.5, 0.65, 0.75, 0.85, 0.9, 1.0, 1.1, 1.25, 1.5];
  let currentZoomIdx = ZOOM_STEPS.indexOf(1.0);
  let currentTtsLang = 'en-US';

  function resolveRootBase() {
    if (typeof window === 'undefined') return '/';
    const p = window.location.pathname;
    const pgIdx = p.indexOf('/playground');
    if (pgIdx !== -1) {
      return p.slice(0, pgIdx + 1);
    }
    return p.replace(/[^/]*$/, '');
  }

  function resolveRootUrl(relPath) {
    const rootBase = resolveRootBase();
    if (!relPath) return rootBase;
    if (/^(https?:\/\/|data:|blob:)/i.test(relPath)) return relPath;
    if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
      return relPath.replace(/^\.?\//, '');
    }
    if (relPath.startsWith('/')) return relPath;
    return rootBase + relPath.replace(/^\.?\//, '');
  }

  function resolveAppKeyFromLocation() {
    if (typeof window !== 'undefined' && window.__ARCADE_CURRENT_SLUG__) {
      return window.__ARCADE_CURRENT_SLUG__;
    }
    if (typeof window === 'undefined') return 'radiansincostan';
    const path = window.location.pathname.replace(/\/+$/, '');
    const match = path.match(/\/playground\/([^/?#]+)/i);
    const rawKey = (match && match[1] && !match[1].endsWith('.html'))
      ? decodeURIComponent(match[1])
      : (new URLSearchParams(window.location.search).get('app') || window.location.hash.replace(/^#\/?/, '') || 'radiansincostan');
    if (APPS_REGISTRY[rawKey]) return rawKey;
    if (rawKey === 'radiansincostan' || rawKey === 'unit-circle') return 'radiansincostan';
    const bySlug = Object.values(APPS_REGISTRY).find(a => a.slug === rawKey || a.id === rawKey);
    return bySlug ? bySlug.id : 'radiansincostan';
  }

  function syncCleanPlaygroundUrl(push = false) {
    if (typeof window === 'undefined' || window.location.protocol === 'file:') return;
    try {
      const cleanPath = `${resolveRootBase()}playground/${activeAppKey}`;
      if (window.location.pathname !== cleanPath || window.location.search) {
        if (push) {
          window.history.pushState({ app: activeAppKey }, '', cleanPath);
        } else {
          window.history.replaceState({ app: activeAppKey }, '', cleanPath);
        }
      }
    } catch (e) { }
  }

  function getTtsEngine() {
    if (typeof window === 'undefined') return null;
    return window.ArcadeTTS || window.ArcadeSpeech || null;
  }

  function stopSlideSpeech() {
    const engine = getTtsEngine();
    if (engine && typeof engine.stop === 'function') {
      engine.stop();
    }
    updateTtsButtonUI('idle', currentTtsLang);
  }

  function updateTtsButtonUI(state, lang, meta) {
    if (lang) currentTtsLang = lang;
    const ttsLangBtn = document.getElementById('ttsLangBtn');
    const ttsSpeakBtn = document.getElementById('ttsSpeakBtn');

    if (ttsLangBtn) {
      const isId = String(currentTtsLang).toLowerCase().startsWith('id');
      ttsLangBtn.textContent = isId ? '🌐 ID' : '🌐 EN';
      ttsLangBtn.title = isId ? 'Bahasa Indonesia (Click to switch to English)' : 'English (Click to switch to Bahasa Indonesia)';
    }
    if (ttsSpeakBtn) {
      const isSpeaking = state === 'speaking';
      ttsSpeakBtn.classList.toggle('is-speaking', isSpeaking);
      ttsSpeakBtn.textContent = isSpeaking ? '⏹ Stop' : '🔊 Speak';
      const engine = getTtsEngine();
      const src = (meta && meta.source) || (engine && engine.getCacheSource ? engine.getCacheSource() : '');
      if (src && src !== 'NONE') {
        ttsSpeakBtn.title = `Read Slide Aloud [${src}]`;
      }
    }
  }

  function getActiveSlideSpeechText() {
    const comp = appData.components && appData.components[currentSlidevIdx];
    if (!comp) return '';
    return `${comp.title}. ${comp.desc}`;
  }

  function applyScreenZoom() {
    const frameWrapper = document.getElementById('frameWrapper');
    const zoomResetBtn = document.getElementById('zoomResetBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const scale = ZOOM_STEPS[currentZoomIdx] || 1.0;

    if (frameWrapper) {
      frameWrapper.style.setProperty('--stage-zoom', String(scale));
    }
    if (zoomResetBtn) zoomResetBtn.textContent = Math.round(scale * 100) + '%';
    if (zoomOutBtn) zoomOutBtn.disabled = currentZoomIdx <= 0;
    if (zoomInBtn) zoomInBtn.disabled = currentZoomIdx >= ZOOM_STEPS.length - 1;
  }

  function syncGithubRepoButton() {
    const githubRepoBtn = document.getElementById('githubRepoBtn');
    const cartridgeActionGrid = document.getElementById('cartridgeActionGrid');
    const comp = appData.components && appData.components[currentSlidevIdx];
    const ghUrl = (comp && comp.githubUrl) || appData.githubUrl || '';
    if (githubRepoBtn && cartridgeActionGrid) {
      if (ghUrl) {
        githubRepoBtn.href = ghUrl;
        githubRepoBtn.style.display = 'inline-flex';
        cartridgeActionGrid.classList.remove('no-github');
      } else {
        githubRepoBtn.removeAttribute('href');
        githubRepoBtn.style.display = 'none';
        cartridgeActionGrid.classList.add('no-github');
      }
    }
  }

  function renderTutorial() {
    const tutorialStepLabel = document.getElementById('tutorialStepLabel');
    const tutorialTitle = document.getElementById('tutorialTitle');
    const tutorialText = document.getElementById('tutorialText');
    const tutorialCollapsedPreview = document.getElementById('tutorialCollapsedPreview');
    const prevTutorialBtn = document.getElementById('prevTutorialBtn');
    const nextTutorialBtn = document.getElementById('nextTutorialBtn');

    const tut = appData.tutorials[currentTutorialIdx];
    if (!tut) return;

    if (tutorialStepLabel) tutorialStepLabel.textContent = tut.step;
    if (tutorialTitle) tutorialTitle.textContent = tut.title;
    if (tutorialText) tutorialText.textContent = tut.text;
    if (tutorialCollapsedPreview) tutorialCollapsedPreview.textContent = `— ${tut.title}`;

    if (prevTutorialBtn) prevTutorialBtn.disabled = currentTutorialIdx === 0;
    if (nextTutorialBtn) {
      nextTutorialBtn.textContent = (currentTutorialIdx === appData.tutorials.length - 1) ? '✓ Done' : 'Next ▶';
    }
  }

  function renderSlidev() {
    stopSlideSpeech();
    const comp = appData.components && appData.components[currentSlidevIdx];
    if (!comp) return;

    const slidevCounterPill = document.getElementById('slidevCounterPill');
    const slidevIndicatorText = document.getElementById('slidevIndicatorText');
    const slidevElementTag = document.getElementById('slidevElementTag');
    const slidevHeading = document.getElementById('slidevHeading');
    const slidevDescription = document.getElementById('slidevDescription');
    const codeFilename = document.getElementById('codeFilename');
    const codeSnippetBody = document.getElementById('codeSnippetBody');
    const prevSlidevBtn = document.getElementById('prevSlidevBtn');
    const nextSlidevBtn = document.getElementById('nextSlidevBtn');

    const total = appData.components.length;
    if (slidevCounterPill) slidevCounterPill.textContent = `0${currentSlidevIdx + 1} / 0${total}`;
    if (slidevIndicatorText) slidevIndicatorText.textContent = `${currentSlidevIdx + 1} / ${total}`;

    if (slidevElementTag) slidevElementTag.textContent = comp.tag;
    if (slidevHeading) slidevHeading.textContent = comp.title;
    if (slidevDescription) slidevDescription.innerHTML = comp.desc;
    if (codeFilename) codeFilename.textContent = comp.filename;
    if (codeSnippetBody) codeSnippetBody.textContent = comp.code;

    if (prevSlidevBtn) prevSlidevBtn.disabled = currentSlidevIdx === 0;
    if (nextSlidevBtn) nextSlidevBtn.disabled = currentSlidevIdx === total - 1;

    syncGithubRepoButton();

    const ttsEng = getTtsEngine();
    const detectedLang = comp.lang || appData.lang || (ttsEng && typeof ttsEng.detectLanguage === 'function'
      ? ttsEng.detectLanguage(`${comp.title} ${comp.desc}`)
      : 'en-US');
    if (ttsEng) {
      const setLangFn = ttsEng.setLang || ttsEng.setLanguage;
      if (typeof setLangFn === 'function') setLangFn.call(ttsEng, detectedLang);
    }
    updateTtsButtonUI('idle', detectedLang);
  }

  function initApp() {
    stopSlideSpeech();
    const isInSubfolderApp = typeof window !== 'undefined' && /\/apps\/[^/]+\//.test(window.location.pathname);
    const isInAppsDir = typeof window !== 'undefined' && (
      window.location.pathname.includes('/apps/') || 
      Boolean(window.__ARCADE_CURRENT_SLUG__) ||
      (document.body && document.body.getAttribute('data-app-slug'))
    );

    const defaultAppFile = isInSubfolderApp ? 'index.html' : `${appData.slug || activeAppKey}.html`;
    const resolvedSrc = isInAppsDir ? defaultAppFile : resolveRootUrl(appData.srcUrl);
    const resolvedExt = isInAppsDir ? defaultAppFile : resolveRootUrl(appData.externalUrl);
    const resolvedLib = isInSubfolderApp ? '../../page-apps.html' : (isInAppsDir ? '../page-apps.html' : resolveRootUrl('page-apps.html'));

    const breadcrumbAppName = document.getElementById('breadcrumbAppName');
    const bentoCartridgeTitle = document.getElementById('bentoCartridgeTitle');
    const downloadAppBtn = document.getElementById('downloadAppBtn');
    const openExternalTabBtn = document.getElementById('openExternalTabBtn');
    const liveAppIframe = document.getElementById('liveAppIframe');

    if (breadcrumbAppName) breadcrumbAppName.textContent = appData.slug || activeAppKey;
    if (bentoCartridgeTitle) bentoCartridgeTitle.textContent = `📐 ${(appData.name || activeAppKey).toUpperCase()}`;
    if (downloadAppBtn) {
      downloadAppBtn.href = resolvedSrc;
      downloadAppBtn.setAttribute('download', appData.downloadName || `${activeAppKey}.html`);
    }
    if (openExternalTabBtn) openExternalTabBtn.href = resolvedExt;

    document.querySelectorAll('a[href="library.html"], a[href="apps.html"], a[href="page-apps.html"]').forEach(link => {
      link.href = resolvedLib;
    });

    if (liveAppIframe) {
      if (appData.srcUrl && appData.srcUrl.includes('compiled-sites/') && window.ArcadeDownloader) {
        liveAppIframe.removeAttribute('src');
        liveAppIframe.srcdoc = window.ArcadeDownloader.synthesizeStandaloneHtml(appData.id);
      } else {
        liveAppIframe.removeAttribute('srcdoc');
        liveAppIframe.src = resolvedSrc;
      }
    }

    syncCleanPlaygroundUrl(false);
    applyScreenZoom();
    renderTutorial();
    renderSlidev();
  }

  function switchActiveApp(newAppKey) {
    if (!APPS_REGISTRY[newAppKey]) return;
    stopSlideSpeech();
    activeAppKey = newAppKey;
    appData = APPS_REGISTRY[activeAppKey];
    currentTutorialIdx = 0;
    currentSlidevIdx = 0;
    syncCleanPlaygroundUrl(true);
    initApp();
  }

  function init() {
    if (typeof document === 'undefined') return;
    activeAppKey = resolveAppKeyFromLocation();

    if (typeof window !== 'undefined' && window.__ARCADE_APP_META__) {
      const meta = window.__ARCADE_APP_META__;
      const key = meta.slug || meta.id || activeAppKey;
      if (!APPS_REGISTRY[key] || APPS_REGISTRY[key] === APPS_REGISTRY['ksi']) {
        APPS_REGISTRY[key] = {
          id: key,
          name: meta.title || key,
          slug: key,
          scope: meta.category || meta.sector || 'App',
          srcUrl: `${key}.html`,
          downloadName: `${key}.html`,
          externalUrl: `${key}.html`,
          githubUrl: meta.linkGithub || '',
          lang: 'en-US',
          tutorials: meta.tutorials || (APPS_REGISTRY['ksi'] ? APPS_REGISTRY['ksi'].tutorials : []),
          components: meta.components || (APPS_REGISTRY['ksi'] ? APPS_REGISTRY['ksi'].components : [])
        };
      }
      activeAppKey = key;
    }

    appData = APPS_REGISTRY[activeAppKey] || APPS_REGISTRY['radiansincostan'] || APPS_REGISTRY['ksi'];
    initApp();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  return {
    APPS_REGISTRY: APPS_REGISTRY,
    init: init,
    initApp: initApp,
    switchActiveApp: switchActiveApp,
    renderTutorial: renderTutorial,
    renderSlidev: renderSlidev,
    applyScreenZoom: applyScreenZoom,
    stopSlideSpeech: stopSlideSpeech
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

