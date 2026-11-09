window.__ARCADE_OMNI_CATALOG__ = [{"id":"plumbing-arcitecture-inventory","title":"Plumbing Architecture & Inventory","displayTitle":"Plumbing Architecture & Inventory","subsystem":"apps","subsystemIcon":"","category":"TOOLS & UTILITY","size":"22.5 KB","tags":["Plumbing","Architecture","BOM Calculator","Zero-Backend"],"overview":"Interactive plumbing architecture, flow topology, part inventory, and automated procurement Bill of Materials (BOM) engine.","url":"apps/plumbing-arcitecture-inventory/index.html"},{"id":"radiansincostan","title":"Unit Circle Resolver","displayTitle":"Unit Circle Resolver","subsystem":"apps","subsystemIcon":"","category":"MATH & CANVAS","size":"6.8 KB","tags":["SVG Arc","Math Engine","Zero-Backend"],"overview":"Interactive trigonometric unit circle calculator. Drag dynamic angle point to solve real-time sin, cos, and tan with exact radical fractions.","url":"apps/radiansincostan/index.html"},{"id":"prompt-engineering-protocol","title":"Prompt Engineering Directives","displayTitle":"Prompt Engineering Directives","subsystem":"skills","subsystemIcon":"","category":"AGENTIC PROMPTS","size":"4.2 KB","tags":["Directives","Standard","Agentic"],"overview":"Standardized prompt directives, AI agent behaviors, and portable development standards.","url":"skills/"},{"id":"git-workflow-guard","title":"Git Rebase & Branching Guard","displayTitle":"Git Rebase & Branching Guard","subsystem":"skills","subsystemIcon":"","category":"DEV WORKFLOW","size":"3.1 KB","tags":["Git","Lifecycle","Workflow"],"overview":"Non-destructive Git branching conventions, rebase safety gates, and atomic PR guidelines.","url":"skills/"},{"id":"code-quarantine-rules","title":"Code Quarantine Standards","displayTitle":"Code Quarantine Standards","subsystem":"skills","subsystemIcon":"","category":"SECURITY & ARCH","size":"2.9 KB","tags":["Architecture","Safety","Brief-First"],"overview":"Strict pre-coding quarantine freezing executable code until architectural brief approval.","url":"skills/"},{"id":"ci-cd-bundler-pipeline","title":"Static App Bundler Pipeline","displayTitle":"Static App Bundler Pipeline","subsystem":"combos","subsystemIcon":"","category":"CI/CD PIPELINES","size":"5.5 KB","tags":["Bundler","Compaction","Pipeline"],"overview":"Multi-stage meta-skill workflow orchestration pipelines and release gates.","url":"combos/"},{"id":"multi-agent-orchestrator","title":"Agentic Workflow Orchestrator","displayTitle":"Agentic Workflow Orchestrator","subsystem":"combos","subsystemIcon":"","category":"META-PIPELINES","size":"6.2 KB","tags":["Multi-Agent","Autonomous","Gates"],"overview":"Coordinates handoffs between researcher, architectural planner, coder, and verifier agents.","url":"combos/"},{"id":"powershell-context-cleaner","title":"Context Ops PowerShell Cleaner","displayTitle":"Context Ops PowerShell Cleaner","subsystem":"scripts","subsystemIcon":"","category":"CLI AUTOMATION","size":"2.8 KB","tags":["PowerShell","Sanitizer","Cross-Platform"],"overview":"Portable cross-platform PowerShell, Python, and Bash automation tools with standalone export.","url":"scripts/"},{"id":"cross-platform-deploy","title":"Multi-Cloud Deploy Runner","displayTitle":"Multi-Cloud Deploy Runner","subsystem":"scripts","subsystemIcon":"","category":"DEVOPS SCRIPTS","size":"3.4 KB","tags":["Deploy","Cloud","Script"],"overview":"Deterministic deployment script for zero-backend static arcade distributions.","url":"scripts/"}];
;
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
// =============================================================================
// MAIN CATALOG CONTROLLER (Master Clean Architecture Client Engine)
// =============================================================================
(function () {
  'use strict';

  const STORAGE_KEY_PINNED = 'arcade_pinned_disks';

  // 2. Clock in WIB
  function updateWibClock() {
    const el = document.getElementById('heroWibClockVal');
    if (!el) return;
    try {
      const now = new Date();
      const options = { timeZone: 'Asia/Jakarta', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
      el.textContent = now.toLocaleTimeString('en-GB', options) + ' WIB';
    } catch (_) {}
  }
  updateWibClock();
  setInterval(updateWibClock, 1000);

  // 3. Category & Pin Filter State
  let activeScope = 'all';
  let pinOnly = false;
  let activeQuery = '';

  function getPinnedList() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_PINNED) || '[]');
    } catch (_) {
      return [];
    }
  }

  function setPinnedList(list) {
    localStorage.setItem(STORAGE_KEY_PINNED, JSON.stringify(list));
  }

  function updateCards() {
    const cards = document.querySelectorAll('.app-cards-grid article.floppy-card, .bases-cards-item');
    const pinned = getPinnedList();
    let visibleCount = 0;
    const totalCount = cards.length;

    cards.forEach(card => {
      const app = card.getAttribute('data-app') || card.getAttribute('data-app-slug') || '';
      const scope = (card.getAttribute('data-scope') || card.getAttribute('data-category') || '').toLowerCase();
      const name = (card.getAttribute('data-name') || card.querySelector('.floppy-title, .card-title')?.textContent || '').toLowerCase();
      const isPinned = pinned.includes(app);

      // Pin button visual state
      const pinBtn = card.querySelector('.floppy-pin-btn, .pin-btn');
      if (pinBtn) {
        pinBtn.classList.toggle('is-pinned', isPinned);
        const icon = pinBtn.querySelector('.pin-icon');
        if (icon) icon.textContent = isPinned ? '★' : '📌';
      }

      // Filter logic
      const matchesScope = (activeScope === 'all') || scope.includes(activeScope);
      const matchesPin = !pinOnly || isPinned;
      const matchesQuery = !activeQuery || name.includes(activeQuery) || app.includes(activeQuery) || scope.includes(activeQuery);

      if (matchesScope && matchesPin && matchesQuery) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    const badge = document.getElementById('diskCounterBadge');
    if (badge) {
      badge.textContent = '💾 ' + visibleCount + '/' + totalCount;
    }
    const heroLoaded = document.getElementById('heroAppsLoadedVal');
    if (heroLoaded && document.body.getAttribute('data-page') !== 'home') {
      heroLoaded.textContent = totalCount + ' Disks';
    }
  }

  // 4. Tab Listeners
  document.querySelectorAll('.workspace-tab-header').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.workspace-tab-header').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      activeScope = (btn.getAttribute('data-scope') || 'all').toLowerCase();
      updateCards();
    });
  });

  // 5. Pin Only Toggle
  const pinToggleBtn = document.getElementById('pinOnlyToggleBtn');
  if (pinToggleBtn) {
    pinToggleBtn.addEventListener('click', () => {
      pinOnly = !pinOnly;
      pinToggleBtn.classList.toggle('is-active', pinOnly);
      updateCards();
    });
  }

  // 6. Card Pin Action
  document.addEventListener('click', (e) => {
    const pinBtn = e.target.closest('.floppy-pin-btn, .pin-btn');
    if (!pinBtn) return;
    const target = pinBtn.getAttribute('data-pin-target');
    if (!target) return;
    e.preventDefault();
    e.stopPropagation();

    let pinned = getPinnedList();
    if (pinned.includes(target)) {
      pinned = pinned.filter(x => x !== target);
    } else {
      pinned.push(target);
    }
    setPinnedList(pinned);
    updateCards();
  });

  // 7. View Mode Switcher (Simple Card | Detail Card | List Table)
  const STORAGE_KEY_VIEW_MODE = 'arcade_catalog_view_mode';
  const btnViewSimple = document.getElementById('btnViewSimple') || document.getElementById('gridViewBtn');
  const btnViewDetail = document.getElementById('btnViewDetail') || document.getElementById('detailViewBtn');
  const btnViewTable = document.getElementById('btnViewTable');
  const appsGrid = document.getElementById('appsGrid');

  function applyViewMode(mode) {
    if (!appsGrid) return;
    appsGrid.classList.remove('view-simple', 'view-detail', 'view-table', 'mobile-view-grid', 'mobile-view-detail');
    
    if (btnViewSimple) btnViewSimple.classList.toggle('is-active', mode === 'simple');
    if (btnViewDetail) btnViewDetail.classList.toggle('is-active', mode === 'detail');
    if (btnViewTable) btnViewTable.classList.toggle('is-active', mode === 'table');

    if (mode === 'detail') {
      appsGrid.classList.add('view-detail', 'mobile-view-detail');
    } else if (mode === 'table') {
      appsGrid.classList.add('view-table');
    } else {
      appsGrid.classList.add('view-simple', 'mobile-view-grid');
    }

    try {
      localStorage.setItem(STORAGE_KEY_VIEW_MODE, mode);
    } catch (_) {}
  }

  if (appsGrid) {
    const savedMode = localStorage.getItem(STORAGE_KEY_VIEW_MODE) || 'simple';
    applyViewMode(savedMode);

    if (btnViewSimple) btnViewSimple.addEventListener('click', () => applyViewMode('simple'));
    if (btnViewDetail) btnViewDetail.addEventListener('click', () => applyViewMode('detail'));
    if (btnViewTable) btnViewTable.addEventListener('click', () => applyViewMode('table'));
  }

  // 8. INTERACTIVE CLI PROMPT & OMNI-SUGGESTIONS ENGINE
  const searchInput = document.getElementById('topSearchInput');
  const typedText = document.getElementById('terminalTypedText');
  const suggestionBox = document.getElementById('suggestionBox');
  const promptFolder = document.getElementById('promptFolderSegment');
  const promptCaret = document.getElementById('promptTerminalCaret');

  const omniData = (typeof window !== 'undefined' && window.__ARCADE_OMNI_CATALOG__) || [];

  const isHome = document.body && document.body.getAttribute('data-page') === 'home';
  const currentSubsystem = isHome ? 'home' : (promptFolder ? (promptFolder.textContent || '').trim().toLowerCase() : 'apps');
  const relPrefix = isHome ? '' : '../';

  const NAV_DESTINATIONS = [
    { key: 'apps', name: 'apps', label: 'apps/ - Standalone Web Cartridges', path: relPrefix + 'apps/', badge: 'NAV', meta: 'Cartridges' },
    { key: 'skills', name: 'skills', label: 'skills/ - Modular Agent Directives', path: relPrefix + 'skills/', badge: 'NAV', meta: 'Directives' },
    { key: 'combos', name: 'combos', label: 'combos/ - Workflow Pipelines', path: relPrefix + 'combos/', badge: 'NAV', meta: 'Pipelines' },
    { key: 'scripts', name: 'scripts', label: 'scripts/ - Context Ops & CLI Automations', path: relPrefix + 'scripts/', badge: 'NAV', meta: 'Automations' },
    { key: 'home', name: 'home', label: 'home/ - Retro Arcade Master Hub', path: relPrefix + 'index.html', badge: 'NAV', meta: 'Hub' }
  ];

  let selectedSuggestionIndex = -1;
  let currentSuggestions = [];
  let isBackspacedMode = false;

  function highlightMatches(text, query) {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return text.slice(0, idx) + '<span class="suggestion-highlight">' + text.slice(idx, idx + query.length) + '</span>' + text.slice(idx + query.length);
  }

  function renderSuggestions(list, query) {
    currentSuggestions = list;
    selectedSuggestionIndex = -1;
    if (!suggestionBox) return;

    if (!list || list.length === 0) {
      suggestionBox.style.display = 'none';
      suggestionBox.innerHTML = '';
      return;
    }

    let html = '<div class="suggestion-list">';
    list.forEach((item, idx) => {
      const isNav = !!item.isNav;
      const badgeClass = isNav ? 'badge-nav' : ('badge-' + (item.subsystem || 'app'));
      const badgeText = item.badge || (item.subsystem ? item.subsystem.slice(0, 4).toUpperCase() : 'APP');
      const title = item.displayTitle || item.label || item.title || item.name;
      const metaText = item.meta || item.size || item.category || '';

      html += '<div class="suggestion-item" data-index="' + idx + '" data-url="' + (item.path || item.url || '') + '">' +
        '<div class="suggestion-left">' +
          '<span class="suggestion-badge ' + badgeClass + '">' + badgeText + '</span>' +
          '<span class="suggestion-title">' + highlightMatches(title, query) + '</span>' +
        '</div>' +
        '<div class="suggestion-meta">' +
          '<span class="size-pill">' + metaText + '</span>' +
        '</div>' +
      '</div>';
    });
    html += '</div>';
    html += '<div class="suggestion-footer">' +
      '<span>[↑↓] Navigate</span>' +
      '<span>[ENTER] Select / Open</span>' +
      '<span>[TAB] Complete</span>' +
      '<span>[ESC] Close</span>' +
    '</div>';

    suggestionBox.innerHTML = html;
    suggestionBox.style.display = 'block';

    suggestionBox.querySelectorAll('.suggestion-item').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.getAttribute('data-index'), 10);
        executeSuggestion(currentSuggestions[idx]);
      });
    });
  }

  function executeSuggestion(item) {
    if (!item) return;
    if (item.isNav && item.path) {
      window.location.href = item.path;
      return;
    }
    if (item.url) {
      if (item.subsystem === currentSubsystem) {
        activeQuery = (item.title || item.id || '').toLowerCase();
        if (searchInput) searchInput.value = item.title || item.id;
        if (typedText) typedText.textContent = item.title || item.id;
        canonicalizePrompt();
        updateCards();
      } else {
        const targetUrl = relPrefix + item.url;
        window.location.href = targetUrl;
      }
    }
  }

  function canonicalizePrompt() {
    isBackspacedMode = false;
    if (promptFolder) promptFolder.style.display = '';
    if (promptCaret) {
      promptCaret.style.display = '';
      promptCaret.textContent = '>';
    }
    if (suggestionBox) {
      suggestionBox.style.display = 'none';
      suggestionBox.innerHTML = '';
    }
  }

  function handleQuery(raw) {
    const val = raw.trim();
    if (!val) {
      renderSuggestions([], '');
      activeQuery = '';
      updateCards();
      return;
    }

    let targetSubsystem = '';
    let searchQuery = val;
    let delim = val.includes('/') ? '/' : (val.includes('>') ? '>' : null);
    if (delim) {
      const parts = val.split(delim);
      const possibleSub = parts[0].trim().toLowerCase();
      if (['apps', 'skills', 'combos', 'scripts', 'home'].includes(possibleSub)) {
        targetSubsystem = possibleSub;
        searchQuery = parts.slice(1).join(delim).trim();
      }
    }

    const suggestions = [];

    // 1. Subsystem navigation quick jump (or typing "/" alone)
    if (val === '/' || val === '>' || isBackspacedMode || (!delim && ['app', 'apps', 'skill', 'skills', 'combo', 'combos', 'script', 'scripts', 'home'].some(s => s.startsWith(val.toLowerCase())))) {
      const qLower = val === '/' || val === '>' ? '' : val.toLowerCase();
      NAV_DESTINATIONS.forEach(dest => {
        if (!qLower || dest.key.startsWith(qLower) || dest.name.startsWith(qLower)) {
          suggestions.push({
            isNav: true,
            badge: 'NAV',
            label: dest.label,
            path: dest.path,
            meta: dest.meta
          });
        }
      });
    }

    // 2. Right after "/" or ">" with empty search query (e.g. "apps/", "skills/", "combos/", "scripts/")
    const searchTarget = searchQuery.toLowerCase();
    if (targetSubsystem && searchTarget.length === 0) {
      omniData.forEach(item => {
        if (item.subsystem === targetSubsystem) {
          suggestions.push({
            isNav: false,
            badge: item.subsystem ? item.subsystem.slice(0, 4).toUpperCase() : 'APP',
            subsystem: item.subsystem,
            displayTitle: item.displayTitle || item.title,
            title: item.title,
            id: item.id,
            meta: item.category + ' • ' + item.size,
            url: item.url
          });
        }
      });
    }

    // 3. Cross-Subsystem Item Matching ("atitlefromaskillorapp")
    if (searchTarget.length > 0) {
      omniData.forEach(item => {
        if (targetSubsystem && item.subsystem !== targetSubsystem) return;
        const title = (item.title || item.displayTitle || '').toLowerCase();
        const overview = (item.overview || '').toLowerCase();
        const tags = Array.isArray(item.tags) ? item.tags.map(t => t.toLowerCase()) : [];
        const id = (item.id || item.slug || '').toLowerCase();

        if (title.includes(searchTarget) || id.includes(searchTarget) || overview.includes(searchTarget) || tags.some(t => t.includes(searchTarget))) {
          suggestions.push({
            isNav: false,
            badge: item.subsystem ? item.subsystem.slice(0, 4).toUpperCase() : 'APP',
            subsystem: item.subsystem,
            displayTitle: item.displayTitle || item.title,
            title: item.title,
            id: item.id,
            meta: item.category + ' • ' + item.size,
            url: item.url
          });
        }
      });
    }

    renderSuggestions(suggestions.slice(0, 8), searchQuery);

    if (!targetSubsystem || targetSubsystem === currentSubsystem) {
      activeQuery = searchQuery.toLowerCase();
      updateCards();
    }
  }

  function updateSelectedSuggestion() {
    if (!suggestionBox) return;
    const items = suggestionBox.querySelectorAll('.suggestion-item');
    items.forEach((el, idx) => {
      if (idx === selectedSuggestionIndex) {
        el.classList.add('is-selected');
        el.scrollIntoView({ block: 'nearest' });
      } else {
        el.classList.remove('is-selected');
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const raw = e.target.value;
      if (typedText) typedText.textContent = raw;
      handleQuery(raw);
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace') {
        const atStart = searchInput.selectionStart === 0 && searchInput.selectionEnd === 0;
        if (!isBackspacedMode && (searchInput.value === '' || atStart)) {
          e.preventDefault();
          isBackspacedMode = true;
          if (promptFolder) promptFolder.style.display = 'none';
          if (promptCaret) promptCaret.style.display = 'none';
          const curFolder = currentSubsystem === 'home' ? '' : currentSubsystem;
          const backspaced = curFolder.length > 0 ? curFolder.slice(0, -1) : '';
          searchInput.value = backspaced;
          if (typedText) typedText.textContent = backspaced;
          handleQuery(backspaced);
          return;
        }
      }

      if (currentSuggestions.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          selectedSuggestionIndex = (selectedSuggestionIndex + 1) % currentSuggestions.length;
          updateSelectedSuggestion();
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          selectedSuggestionIndex = (selectedSuggestionIndex - 1 + currentSuggestions.length) % currentSuggestions.length;
          updateSelectedSuggestion();
          return;
        }
        if (e.key === 'Tab') {
          e.preventDefault();
          if (selectedSuggestionIndex >= 0 && currentSuggestions[selectedSuggestionIndex]) {
            const item = currentSuggestions[selectedSuggestionIndex];
            const fillText = item.isNav ? (item.key || item.name) : (item.displayTitle || item.title);
            searchInput.value = fillText;
            if (typedText) typedText.textContent = fillText;
            handleQuery(fillText);
          }
          return;
        }
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && currentSuggestions[selectedSuggestionIndex]) {
          executeSuggestion(currentSuggestions[selectedSuggestionIndex]);
          return;
        }
        const raw = searchInput.value.trim();
        const navMatch = NAV_DESTINATIONS.find(d => d.key === raw.toLowerCase() || d.name === raw.toLowerCase());
        if (navMatch) {
          window.location.href = navMatch.path;
          return;
        }
        let delim = raw.includes('/') ? '/' : (raw.includes('>') ? '>' : null);
        if (delim) {
          const parts = raw.split(delim);
          const sub = parts[0].trim().toLowerCase();
          const q = parts.slice(1).join(delim).trim();
          if (sub !== currentSubsystem && ['apps', 'skills', 'combos', 'scripts', 'home'].includes(sub)) {
            const dest = NAV_DESTINATIONS.find(d => d.key === sub);
            if (dest) {
              window.location.href = dest.path + (q ? '?q=' + encodeURIComponent(q) : '');
              return;
            }
          }
          searchInput.value = q;
          if (typedText) typedText.textContent = q;
          activeQuery = q.toLowerCase();
          canonicalizePrompt();
          updateCards();
          return;
        }

        canonicalizePrompt();
      }

      if (e.key === 'Escape') {
        canonicalizePrompt();
        searchInput.blur();
      }
    });

    searchInput.addEventListener('blur', () => {
      setTimeout(() => {
        if (!suggestionBox || !suggestionBox.matches(':hover')) {
          canonicalizePrompt();
        }
      }, 200);
    });

    const searchBtn = document.getElementById('searchActionBtn');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        searchInput.focus();
      });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const qParam = urlParams.get('q');
    if (qParam) {
      searchInput.value = qParam;
      if (typedText) typedText.textContent = qParam;
      activeQuery = qParam.toLowerCase();
      updateCards();
    }
  }

  // 9-10. Theme toggle + accent picker are handled by themeEngine.js / accentPickerModal.js (legacy UI preserved)

  // 11. Fullscreen Toggle
  document.querySelectorAll('[data-action="toggle-fullscreen"]').forEach(el => {
    el.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });
  });

  // 12. 4-Tier URL Router Parameter Parsing
  const fullSearch = window.location.href;
  if (fullSearch.includes('=?playground') || fullSearch.includes('?app=')) {
    let appSlug = new URLSearchParams(window.location.search).get('app');
    if (!appSlug && fullSearch.includes('=?playground')) {
      const segs = fullSearch.split('=?playground')[0].split('/').filter(Boolean);
      appSlug = segs[segs.length - 1] || null;
    }
    if (appSlug) {
      window.location.replace('../data/apps/' + appSlug + '/index_detailed.html');
      return;
    }
  }

  // 13. Retro Toast Notification Helper
  function showRetroToast(message) {
    let toast = document.getElementById('retroToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'retroToast';
      toast.className = 'retro-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = '[ 📋 ' + message + ' ]';
    toast.classList.add('show');
    clearTimeout(toast.__timer);
    toast.__timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }

  // 14. 1-Tap Share Button Handler
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-share');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const relUrl = btn.getAttribute('data-share-url') || '';
    const fullUrl = new URL(relUrl, window.location.href).href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(fullUrl).then(() => {
        showRetroToast('Link copied to clipboard!');
      }).catch(() => {
        showRetroToast(fullUrl);
      });
    } else {
      showRetroToast(fullUrl);
    }
  });

  // 13. Global Keyboard Shortcuts Listener
  window.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea') {
      if (e.key === 'Escape') e.target.blur();
      return;
    }
    const isHome = document.body && document.body.getAttribute('data-page') === 'home';
    if (isHome) {
      if (e.key === '1') window.location.href = 'apps/';
      else if (e.key === '2') window.location.href = 'skills/';
      else if (e.key === '3') window.location.href = 'combos/';
      else if (e.key === '4') window.location.href = 'scripts/';
    }
    if (e.key === '*' || (e.shiftKey && e.key === '8')) {
      const s = document.getElementById('topSearchInput');
      if (s) { e.preventDefault(); s.focus(); }
    }
  });

  // Initial update
  updateCards();
})();
