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
