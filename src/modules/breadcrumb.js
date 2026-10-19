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
