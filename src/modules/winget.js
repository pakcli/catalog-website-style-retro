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
