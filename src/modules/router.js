/**
 * Pure Business Logic: 4-Tier Client-Side URL Router
 * Parses:
 *  0. Default Catalog Overview: domain.com/<context>/
 *  1. Detailed Spec Drawer: domain.com/<context>/<title>
 *  2. Standalone Artifact: domain.com/<context>/<title>=?standalone
 *  3. Dual-Panel Playground: domain.com/<context>/<title>=?playground (or ?app=<title>)
 *  4. Fullscreen Zen Play: domain.com/<context>/<title>=?play
 */
export function parseRoute() {
  const path = window.location.pathname;
  const search = window.location.search;
  const hash = window.location.hash;

  // Detect context
  let context = 'apps';
  if (path.includes('/skills')) context = 'skills';
  else if (path.includes('/combos')) context = 'combos';
  else if (path.includes('/scripts')) context = 'scripts';
  else if (path.includes('/playground')) context = 'playground';

  // Check URL suffixes or query params
  const fullSearch = window.location.href;
  let mode = 'catalog'; // default
  let title = '';

  const searchParams = new URLSearchParams(search);
  if (searchParams.has('app')) {
    title = searchParams.get('app');
    mode = 'playground';
  }

  if (fullSearch.includes('=?play')) {
    mode = 'play';
    const match = fullSearch.match(/\/([^/?#=]+)=\?play/);
    if (match) title = match[1];
  } else if (fullSearch.includes('=?playground')) {
    mode = 'playground';
    const match = fullSearch.match(/\/([^/?#=]+)=\?playground/);
    if (match) title = match[1];
  } else if (fullSearch.includes('=?standalone')) {
    mode = 'standalone';
    const match = fullSearch.match(/\/([^/?#=]+)=\?standalone/);
    if (match) title = match[1];
  }

  return { context, mode, title };
}

export function setRouteMode(mode, title) {
  if (mode === 'play') {
    const cleanUrl = title ? `${title}=?play` : '=?play';
    window.history.replaceState({}, '', cleanUrl);
  } else if (mode === 'playground') {
    const cleanUrl = title ? `${title}=?playground` : '=?playground';
    window.history.replaceState({}, '', cleanUrl);
  }
}
