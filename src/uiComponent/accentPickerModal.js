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
