/**
 * ============================================================================
 * MODULE: Catalog Core Engine (Floppy Cards, Frontmatter Engine, 5 Sectors)
 * Purpose: Curates retro 3.5" diskettes, parses YAML frontmatter, renders
 *          dynamic adaptive action stacks for all cartridge cases (Airgap Triad,
 *          Pure Markdown Doc, External Live Bookmark, Minimal/Draft).
 * ============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ArcadeCatalog = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEY_PINS = 'arcade_pinned_apps';
  const STORAGE_KEY_SEARCH = 'arcade_search_history';

  // 5 Sektor Kategori Final (Clean Typography without Emojis)
  const SECTOR_META = {
    all: { label: 'All', title: 'ALL SECTORS' },
    edu: { label: 'Edu', title: 'EDUCATION & SCIENCE' },
    fnb: { label: 'FnB', title: 'FOOD & BEVERAGE' },
    tools: { label: 'Tools', title: 'TOOLS & UTILITIES' },
    games: { label: 'Games', title: 'ARCADE & GAMES' },
    electron: { label: 'Electron', title: 'ELECTRON & OBSIDIAN' }
  };

  /**
   * Parse YAML frontmatter from raw Markdown text (Zero-Backend Client Engine)
   * @param {string} markdownText
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
   * Harmonize and normalize raw disk properties against Frontmatter standard
   * Supports: title, img, overview, tags, file-size, link-github, link-subpage, link-live
   * @param {Object} raw
   * @returns {Object} Normalized disk definition
   */
  function normalizeDisk(raw) {
    const slug = raw.slug || raw.id || (raw.title ? raw.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'cartridge');
    const id = slug; // Single source of truth: slug
    const title = raw.title || 'Untitled Cartridge';
    const overview = raw.overview || raw.description || '';
    const tags = Array.isArray(raw.tags) ? raw.tags : (typeof raw.tags === 'string' ? [raw.tags] : []);
    const fileSize = raw['file-size'] || raw.fileSize || raw.size || '12.4 KB';
    const linkGithub = raw['link-github'] || raw.linkGithub || raw.githubUrl || 'https://github.com/fadhlisl/fadhlisl-my-id';
    const linkSubpage = raw['link-subpage'] || raw.linkSubpage || raw.playgroundUrl || `page-playground.html?app=${slug}`;
    const linkLive = raw['link-live'] || raw.linkLive || raw.demoUrl || `apps/${slug}.html`;
    const img = raw.img || '';
    const sector = raw.sector || 'tools';
    const sectorMeta = SECTOR_META[sector] || { label: '💾 System', title: 'SYSTEM' };

    // Determine Case: 1 (Triad), 2 (Pure MD), 3 (External), 4 (Draft)
    const hasLive = Boolean(linkLive && linkLive.trim());
    const hasSub = Boolean(linkSubpage && linkSubpage.trim());
    const isExternal = hasLive && (linkLive.startsWith('http://') || linkLive.startsWith('https://'));

    let diskCase = 'draft';
    if (isExternal) {
      diskCase = 'external';
    } else if (hasLive && hasSub) {
      diskCase = 'triad';
    } else if (!hasLive && hasSub) {
      diskCase = 'markdown';
    } else if (hasLive && !hasSub) {
      diskCase = 'triad';
    } else {
      diskCase = 'draft';
    }

    return {
      id: id,
      slug: slug,
      title: title,
      img: img,
      overview: overview,
      description: overview,
      tags: tags,
      fileSize: fileSize,
      size: fileSize,
      linkGithub: linkGithub,
      linkSubpage: linkSubpage,
      playgroundUrl: linkSubpage,
      linkLive: linkLive,
      demoUrl: linkLive,
      sector: sector,
      scope: Array.isArray(raw.scope) ? raw.scope.join(' ') : (raw.scope || sector),
      sectorLabel: raw.category || raw.sectorLabel || sectorMeta.label,
      badge: raw.badge || fileSize,
      diskCase: diskCase
    };
  }

  // Dynamic Client-Side Rendered Cartridge Registry (Zero hardcoding)
  let CATALOG_DISKS = [];

  /**
  /**
   * Extract baseline cards directly from static HTML DOM if present
   */
  function parseCardsFromDom() {
    if (typeof document === 'undefined') return [];
    const cards = document.querySelectorAll('#appsGrid .floppy-card, .bases-cards-item.floppy-card');
    if (!cards || cards.length === 0) return [];
    const list = [];
    cards.forEach(card => {
      const slug = card.getAttribute('data-app') || card.getAttribute('data-app-id') || '';
      if (!slug) return;
      const titleEl = card.querySelector('.floppy-title');
      const title = titleEl ? titleEl.textContent.trim() : slug;
      const descEl = card.querySelector('.floppy-overview');
      const overview = descEl ? descEl.textContent.trim() : '';
      const catBadge = card.querySelector('.floppy-cat-badge');
      const sectorLabel = catBadge ? catBadge.textContent.trim() : '';
      const sizePill = card.querySelector('.size-pill') || card.querySelector('.card-filesize-top');
      const fileSize = sizePill ? sizePill.textContent.trim() : '12.4 KB';
      const scopeAttr = card.getAttribute('data-scope') || '';
      const scope = scopeAttr.split(/\s+/).filter(Boolean);
      const sector = scope[0] || 'tools';
      const imgEl = card.querySelector('.thumb-img');
      const img = imgEl ? imgEl.getAttribute('src') : '';
      const ctaLink = card.querySelector('.mod-cta');
      const linkSubpage = ctaLink ? ctaLink.getAttribute('href') : '';
      const standaloneLink = card.querySelector('.btn-standalone') || card.querySelector('.btn-download');
      const linkLive = standaloneLink ? standaloneLink.getAttribute('href') : '';
      const tagEls = card.querySelectorAll('.tags-group .tag');
      const tags = Array.from(tagEls).map(t => t.textContent.trim().replace(/^#/, ''));

      list.push(normalizeDisk({
        id: slug,
        slug: slug,
        title: title,
        overview: overview,
        description: overview,
        sectorLabel: sectorLabel,
        sector: sector,
        scope: scope,
        fileSize: fileSize,
        size: fileSize,
        img: img,
        linkSubpage: linkSubpage,
        playgroundUrl: linkSubpage,
        linkLive: linkLive,
        demoUrl: linkLive,
        tags: tags,
        badge: fileSize
      }));
    });
    return list;
  }

  /**
   * Client-Side Rendering: Load catalog dynamically from injected JSON or apps/_catalog.json
   */
  async function loadCatalog() {
    // 0. Seed from statically rendered DOM cards first (Baseline protection against 0-card wipe)
    const domCards = parseCardsFromDom();
    if (domCards.length > 0 && CATALOG_DISKS.length === 0) {
      CATALOG_DISKS = domCards;
      syncCategoryTabsUI();
      syncDomPins();
      fitCardTagsByLetterCount();
    }

    // 1. Injected catalog support
    if (typeof window !== 'undefined' && window.__ARCADE_MARKDOWN_CATALOG__) {
      const injected = window.__ARCADE_MARKDOWN_CATALOG__;
      const list = Array.isArray(injected) ? injected : Object.values(injected);
      if (list.length > 0) {
        const normalized = list.map(item => normalizeDisk(item));
        if (normalized.length >= CATALOG_DISKS.length) {
          CATALOG_DISKS = normalized;
          renderCards();
        } else {
          // Merge by slug so rich data is updated without dropping DOM cards
          const map = new Map();
          CATALOG_DISKS.forEach(d => map.set(d.slug, d));
          normalized.forEach(d => map.set(d.slug, Object.assign({}, map.get(d.slug), d)));
          CATALOG_DISKS = Array.from(map.values());
        }
        syncCategoryTabsUI();
        syncDomPins();
        fitCardTagsByLetterCount();
        return;
      }
    }

    // 2. Fetch runtime apps/_catalog.json
    try {
      const res = await fetch('apps/_catalog.json');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const normalized = data.map(item => normalizeDisk(item));
          if (normalized.length >= CATALOG_DISKS.length) {
            CATALOG_DISKS = normalized;
            renderCards();
          } else {
            const map = new Map();
            CATALOG_DISKS.forEach(d => map.set(d.slug, d));
            normalized.forEach(d => map.set(d.slug, Object.assign({}, map.get(d.slug), d)));
            CATALOG_DISKS = Array.from(map.values());
          }
          syncCategoryTabsUI();
          syncDomPins();
          fitCardTagsByLetterCount();
          return;
        }
      }
    } catch (err) {
      console.warn('[ArcadeCatalog] Dynamic fetch apps/_catalog.json failed (using DOM baseline):', err);
    }
  }

  /**
   * Client-Side Category Detection Engine:
   * Dynamically inspects all parsed MD frontmatters and counts cartridges per sector.
   */
  function detectCategoryCounts() {
    const counts = { all: CATALOG_DISKS.length, edu: 0, fnb: 0, tools: 0, games: 0, electron: 0 };
    CATALOG_DISKS.forEach(d => {
      const scopeArr = Array.isArray(d.scope) ? d.scope.map(s => String(s).toLowerCase()) : [String(d.scope || '').toLowerCase()];
      const sector = String(d.sector || '').toLowerCase();
      ['edu', 'fnb', 'tools', 'games', 'electron'].forEach(s => {
        if (sector === s || scopeArr.includes(s) || scopeArr.some(sc => sc.includes(s))) {
          counts[s] = (counts[s] || 0) + 1;
        }
      });
    });
    return counts;
  }

  /**
   * Synchronize category tabs UI with detected counts from parsed frontmatters
   */
  function syncCategoryTabsUI() {
    const counts = detectCategoryCounts();
    document.querySelectorAll('.workspace-tab-header').forEach(btn => {
      const sc = btn.getAttribute('data-scope') || btn.dataset.scope;
      if (!sc) return;
      const meta = SECTOR_META[sc];
      const count = counts[sc] !== undefined ? counts[sc] : 0;
      const baseLabel = meta ? meta.label : sc.toUpperCase();
      btn.textContent = baseLabel + ' (' + count + ')';
    });

    const heroVal = document.getElementById('heroAppsLoadedVal');
    if (heroVal) {
      heroVal.textContent = counts.all + ' Disks';
    }

    const badge = document.getElementById('diskCounterBadge');
    if (badge) {
      badge.textContent = '💾 ' + counts.all + '/' + counts.all;
    }
  }
  let currentSector = 'all';
  let searchQuery = '';
  let pinnedIds = [];
  let pinOnlyMode = false;

  /**
   * Load pinned apps from localStorage
   */
  function loadPins() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PINS);
      pinnedIds = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(pinnedIds)) pinnedIds = [];
    } catch (e) {
      pinnedIds = [];
    }
  }

  /**
   * Toggle Pin-Only Mode (Filter all categories to show only pinned cartridges)
   */
  function togglePinOnly() {
    pinOnlyMode = !pinOnlyMode;
    const btn = document.getElementById('pinOnlyToggleBtn');
    if (btn) btn.classList.toggle('is-active', pinOnlyMode);
    const gridEl = document.getElementById('appsGrid');
    if (gridEl && gridEl.children.length > 0 && !gridEl.hasAttribute('data-dynamic-rendered')) {
      const cards = Array.from(document.querySelectorAll('.floppy-card'));
      let visible = 0;
      cards.forEach(c => {
        const appId = c.getAttribute('data-app') || c.getAttribute('data-app-id');
        const isP = isPinned(appId);
        if (pinOnlyMode && !isP) {
          c.style.display = 'none';
        } else if (c.style.display === 'none' && (!pinOnlyMode || isP)) {
          // Check other filters
          const matchesQuery = !searchQuery || c.textContent.toLowerCase().includes(searchQuery.toLowerCase());
          const scope = c.getAttribute('data-scope') || '';
          const matchesScope = currentSector === 'all' || scope.includes(currentSector);
          if (matchesQuery && matchesScope) {
            c.style.display = 'flex';
            visible++;
          }
        } else if (c.style.display !== 'none') {
          visible++;
        }
      });
      updateCounterBadge(visible, cards.length);
    } else {
      renderCards();
    }
    return pinOnlyMode;
  }

  function setPinOnly(val) {
    if (pinOnlyMode !== Boolean(val)) {
      togglePinOnly();
    }
  }

  /**
   * Toggle pin state for an app
   * @param {string} appId
   */
  function togglePin(appId) {
    const idx = pinnedIds.indexOf(appId);
    if (idx > -1) {
      pinnedIds.splice(idx, 1);
    } else {
      pinnedIds.unshift(appId); // Add to beginning
    }

    try {
      localStorage.setItem(STORAGE_KEY_PINS, JSON.stringify(pinnedIds));
    } catch (e) {
      // Ignore
    }

    syncDomPins();
  }

  /**
   * Check if an app is currently pinned
   * @param {string} appId
   * @returns {boolean}
   */
  function isPinned(appId) {
    return pinnedIds.includes(appId);
  }

  /**
   * Synchronize pin state across DOM elements without rebuilding innerHTML
   */
  function syncDomPins() {
    const pins = pinnedIds;
    const cards = Array.from(document.querySelectorAll('.floppy-card'));
    if (cards.length === 0) return;

    cards.forEach(card => {
      const appId = card.getAttribute('data-app') || card.getAttribute('data-app-id');
      const isP = pins.includes(appId);
      const pinBtn = card.querySelector('.floppy-pin-btn');
      const pinLabel = card.querySelector('.pin-label');
      const pinIcon = card.querySelector('.pin-icon');

      if (isP) {
        card.classList.add('is-pinned');
        if (pinBtn) pinBtn.classList.add('is-pinned');
        if (pinLabel) pinLabel.textContent = 'PINNED';
        if (pinIcon) pinIcon.textContent = '★';
      } else {
        card.classList.remove('is-pinned');
        if (pinBtn) pinBtn.classList.remove('is-pinned');
        if (pinLabel) pinLabel.textContent = 'PIN';
        if (pinIcon) pinIcon.textContent = '📌';
      }
    });

    // Re-sort cards in DOM: pinned cards moved to top
    const gridEl = document.getElementById('appsGrid') || document.querySelector('[data-role="floppy-grid"]');
    if (gridEl) {
      cards.sort((a, b) => {
        const aPinned = pins.includes(a.getAttribute('data-app') || a.getAttribute('data-app-id'));
        const bPinned = pins.includes(b.getAttribute('data-app') || b.getAttribute('data-app-id'));
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        return 0;
      });
      cards.forEach(c => gridEl.appendChild(c));
    }
  }

  /**
   * Filter and sort disks:
   */
  function getFilteredDisks() {
    return CATALOG_DISKS.filter(disk => {
      if (pinOnlyMode && !isPinned(disk.id)) {
        return false;
      }
      if (currentSector !== 'all') {
        const sec = String(disk.sector || '').toLowerCase();
        const scopeArr = Array.isArray(disk.scope)
          ? disk.scope.map(s => String(s).toLowerCase())
          : String(disk.scope || '').toLowerCase().split(/\s+/).filter(Boolean);
        if (sec !== currentSector && !scopeArr.includes(currentSector) && !scopeArr.some(sc => sc.includes(currentSector))) {
          return false;
        }
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = disk.title.toLowerCase().includes(q);
        const matchDesc = disk.overview.toLowerCase().includes(q);
        const matchTags = disk.tags.some(t => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchTags) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      const aPinned = isPinned(a.id);
      const bPinned = isPinned(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
    });
  }

  /**
   * Render CRT Media Screen Bezel (Build-time Desktop Screenshots with Dark/Light mode awareness + [preview not found] fallback)
   */
  function renderMediaWindow(disk) {
    const isLight = typeof document !== 'undefined' && document.documentElement.classList.contains('theme-light');
    const slug = disk.slug || disk.id;
    const defaultModeSrc = isLight ? (disk.imgLight || `apps/${slug}/img-lightmode.webp`) : (disk.imgDark || `apps/${slug}/img-darkmode.webp`);
    const fallbackSrc = disk.img || `apps/${slug}/img.webp`;

    return `
      <div class="screen-preview-slot">
        <img src="${defaultModeSrc}"
             data-thumb-slug="${slug}"
             data-thumb-fallback="${fallbackSrc}"
             class="thumb-img"
             alt="${disk.title}"
             loading="lazy"
             onerror="if(!this.dataset.fallbackTried){this.dataset.fallbackTried='true';this.src='${fallbackSrc}';}else{this.onerror=null;this.parentElement.innerHTML='<div class=\\'preview-not-found-box\\'><span class=\\'not-found-icon\\'>📺</span><span class=\\'not-found-text\\'>[preview not found]</span></div><div class=\\'launch-prompt\\'>▶</div>';}" />
        <div class="launch-prompt">▶</div>
      </div>
    `;
  }

  /**
   * Render Action Buttons Stack based on Disk Case (Same-Domain vs External Live)
   */
  function renderActions(disk) {
    const isExt = disk.diskCase === 'external' || (disk.linkLive && /^https?:\/\//i.test(disk.linkLive));
    const liveLabel = isExt ? ' Open Live ↗' : ' Standalone';
    const liveIcon = isExt ? '🌐' : '↗';

    return `
      <a href="${disk.linkSubpage || disk.linkLive}" class="button-link mod-cta" title="Open in Playground">
        <span>🚀 Open in Playground</span>
      </a>
      <div class="action-sub-grid">
        <a href="${disk.linkLive || '#'}" download class="button-link btn-download" title="Download Standalone HTML">
          <span class="btn-icon">⬇️</span><span class="btn-label"> Download</span>
        </a>
        <a href="${disk.linkLive || disk.linkSubpage}" target="_blank" rel="noopener noreferrer" class="button-link btn-standalone" title="${liveLabel.trim()}">
          <span class="btn-icon">${liveIcon}</span><span class="btn-label">${liveLabel}</span>
        </a>
      </div>
    `;
  }

  /**
   * Update disk counter badge & Hero APPS LOADED metric while preserving symbol/number/text spans
   */
  function updateCounterBadge(visibleCount, totalCount) {
    const counterEl = document.querySelector('[data-role="disks-counter"]') || document.getElementById('diskCounterBadge');
    if (counterEl) {
      counterEl.innerHTML = `<span class="counter-icon">💾</span> <span class="counter-nums">${visibleCount}/${totalCount}</span> <span class="counter-text">DISKS VISIBLE</span>`;
    }
    const heroAppsLoadedVal = document.getElementById('heroAppsLoadedVal');
    if (heroAppsLoadedVal) {
      heroAppsLoadedVal.textContent = visibleCount === totalCount
        ? `${totalCount} Disks`
        : `${visibleCount}/${totalCount} Disks`;
    }
  }

  /**
   * Fit 2-3 tags by letter count
   */
  function buildFittedTagsHtml(tags) {
    let charSum = 0;
    return (tags || []).map((rawTag, idx) => {
      const t = rawTag.startsWith('#') ? rawTag : `#${rawTag}`;
      charSum += t.length;
      const hide = idx >= 3 || (idx === 2 && charSum > 26);
      return `<span class="tag"${hide ? ' style="display:none;"' : ''}>${t}</span>`;
    }).join(' ');
  }

  /**
   * Render Rectangular Catalog Cards Grid into DOM container
   */
  function renderCards() {
    const gridEl = document.querySelector('[data-role="floppy-grid"]') || document.getElementById('appsGrid');
    if (!gridEl) return;

    gridEl.setAttribute('data-dynamic-rendered', 'true');

    const filtered = getFilteredDisks();

    updateCounterBadge(filtered.length, CATALOG_DISKS.length);

    if (filtered.length === 0) {
      gridEl.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 40px 20px; text-align: center; color: var(--text-muted); background: var(--background-secondary); border: 2px dashed var(--interactive-accent); border-radius: 8px;">
          <p style="font-size: 16px; margin: 0 0 8px 0;">💾 DRIVE A:\\ NO DISKETTES MATCHING FILTER</p>
          <p style="font-size: 12px; margin: 0; color: var(--text-faint);">Try selecting "All" or resetting your search prompt.</p>
        </div>
      `;
      return;
    }

    gridEl.innerHTML = filtered.map(disk => {
      const pinned = isPinned(disk.id);
      const pinClass = pinned ? 'is-pinned' : '';
      const tagsHtml = buildFittedTagsHtml(disk.tags);

      return `
        <article class="bases-cards-item floppy-card ${pinClass}" data-app="${disk.id}" data-scope="${Array.isArray(disk.scope) ? disk.scope.join(' ') : (disk.scope || disk.sector)}" data-name="${disk.title}">
          <!-- 1. Top Header Row (Desktop/Detail: Left Category | Mobile Grid: Left FileSize | Right: Pin) -->
          <div class="floppy-header-row">
            <div class="floppy-header-meta">
              <span class="card-filesize-top">${disk.fileSize}</span>
              <span class="floppy-cat-badge">${disk.sectorLabel}</span>
              <button type="button" class="floppy-pin-btn ${pinned ? 'is-pinned' : ''}" onclick="ArcadeCatalog.togglePin('${disk.id}')" title="Pin / Favorite to local storage" data-pin-target="${disk.id}">
                <span class="pin-icon">${pinned ? '★' : '📌'}</span> <span class="pin-label">${pinned ? 'PINNED' : 'PIN'}</span>
              </button>
            </div>
          </div>

          <!-- 2. CRT Media Screen (Clickable Thumbnail -> Playground, Top-Left [▶]) -->
          <a href="${disk.linkSubpage || disk.linkLive}" class="floppy-media-screen view-content" title="Click to launch ${disk.title}">
            ${renderMediaWindow(disk)}
          </a>

          <!-- 3. Paper Label (Title + 2-Line Overview) -->
          <div class="floppy-paper-label">
            <h3 class="floppy-title">${disk.title}</h3>
            <p class="floppy-overview">${disk.overview}</p>
          </div>

          <!-- 4. Inverted Meta Row (Left: File Size | Right: 2-3 Fitted Tags) -->
          <div class="floppy-tags-row">
            <span class="size-pill">${disk.fileSize}</span>
            <div class="tags-group">
              ${tagsHtml}
            </div>
          </div>

          <!-- 5. Action Stack -->
          <div class="floppy-action-stack">
            ${renderActions(disk)}
          </div>
        </article>
      `;
    }).join('');
  }

  /**
   * Set active sector filter
   */
  function setSector(sector) {
    currentSector = sector || 'all';

    document.querySelectorAll('[data-sector-filter], .workspace-tab-header').forEach(btn => {
      const bScope = btn.dataset.sectorFilter || btn.dataset.scope || btn.getAttribute('data-scope');
      if (bScope === currentSector) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    });

    const gridEl = document.getElementById('appsGrid');
    if (gridEl && gridEl.children.length > 0 && !gridEl.hasAttribute('data-dynamic-rendered')) {
      // Use existing cards show/hide filter
      const cards = Array.from(document.querySelectorAll('.floppy-card'));
      let visible = 0;
      cards.forEach(c => {
        const cScope = (c.getAttribute('data-scope') || '').toLowerCase();
        if (currentSector === 'all' || cScope.includes(currentSector)) {
          c.style.display = 'flex';
          visible++;
        } else {
          c.style.display = 'none';
        }
      });
      updateCounterBadge(visible, cards.length);
    } else {
      renderCards();
    }
  }

  /**
   * Set search query
   */
  function setSearch(query) {
    searchQuery = (query || '').trim();
    const gridEl = document.getElementById('appsGrid');
    if (gridEl && gridEl.children.length > 0 && !gridEl.hasAttribute('data-dynamic-rendered')) {
      const q = searchQuery.toLowerCase();
      const cards = Array.from(document.querySelectorAll('.floppy-card'));
      let visible = 0;
      cards.forEach(c => {
        const text = c.textContent.toLowerCase();
        if (!q || text.includes(q)) {
          c.style.display = 'flex';
          visible++;
        } else {
          c.style.display = 'none';
        }
      });
      updateCounterBadge(visible, cards.length);
    } else {
      renderCards();
    }
  }

  // --------------------------------------------------------------------------
  // LIVE WIB CLOCK & TAG LETTER-COUNT FITTER
  // --------------------------------------------------------------------------
  function updateWibClock() {
    const heroWibClockVal = document.getElementById('heroWibClockVal');
    if (!heroWibClockVal) return;
    try {
      const now = new Date();
      const wibStr = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(now);
      heroWibClockVal.textContent = `${wibStr} WIB`;
    } catch (e) {
      const d = new Date(Date.now() + 7 * 3600 * 1000);
      heroWibClockVal.textContent = d.toISOString().slice(11, 19) + ' WIB';
    }
  }

  function fitCardTagsByLetterCount() {
    const heroAppsLoadedVal = document.getElementById('heroAppsLoadedVal');
    const totalCards = document.querySelectorAll('.floppy-card').length || CATALOG_DISKS.length;
    if (heroAppsLoadedVal && (!heroAppsLoadedVal.textContent || !heroAppsLoadedVal.textContent.includes('/'))) {
      heroAppsLoadedVal.textContent = `${totalCards} Disks`;
    }
    document.querySelectorAll('.floppy-card .tags-group').forEach(group => {
      const tags = Array.from(group.querySelectorAll('.tag'));
      let charSum = 0;
      tags.forEach((tagEl, idx) => {
        const len = (tagEl.textContent || '').trim().length;
        charSum += len;
        if (idx < 2) {
          tagEl.style.display = 'inline-block';
        } else if (idx === 2 && charSum <= 26) {
          tagEl.style.display = 'inline-block';
        } else {
          tagEl.style.display = 'none';
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // SEARCH TERMINAL, POPUP SUGGESTIONS & SEARCH HISTORY
  // --------------------------------------------------------------------------
  const SEARCH_HISTORY_KEY = 'arcade_search_history';

  function getSearchHistory() {
    try {
      const data = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
      return Array.isArray(data) ? data.slice(0, 4) : [];
    } catch (e) {
      return [];
    }
  }

  function addSearchHistory(type, name, query) {
    const trimmedQuery = (query || '').trim();
    const trimmedName = (name || trimmedQuery).trim();
    if (!trimmedQuery && !trimmedName) return;

    let history = getSearchHistory();
    history = history.filter(item => {
      const itemQ = (item.query || item.name || '').toLowerCase();
      return itemQ !== trimmedQuery.toLowerCase() && itemQ !== trimmedName.toLowerCase();
    });

    history.unshift({
      type: type === 'found' ? 'found' : 'not found',
      name: trimmedName,
      query: trimmedQuery
    });

    if (history.length > 4) history = history.slice(0, 4);
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
    } catch (e) {}
  }

  function clearSearchHistory() {
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (e) {}
  }

  function escapeHtml(str) {
    return (str || '').replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m]);
  }

  function highlightMatch(text, query) {
    if (!query) return escapeHtml(text);
    const escaped = escapeHtml(text);
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return escaped.replace(regex, '<span class="suggestion-highlight">$1</span>');
  }

  function initSearchTerminal() {
    const topSearchInput = document.getElementById('topSearchInput');
    const terminalTypedText = document.getElementById('terminalTypedText');
    const terminalCursor = document.getElementById('terminalCursor');
    const searchActionBtn = document.getElementById('searchActionBtn');
    const suggestionBox = document.getElementById('suggestionBox');
    const cliPromptLine = document.getElementById('cliPromptLine');
    const stickyNavbar = document.getElementById('stickyNavbar');

    if (!topSearchInput) return;

    function setTypingMode(active) {
      if (stickyNavbar) {
        if (active) stickyNavbar.classList.add('is-typing');
        else stickyNavbar.classList.remove('is-typing');
      }
    }

    function syncTerminalDisplay() {
      if (terminalTypedText) {
        terminalTypedText.textContent = topSearchInput.value;
      }
    }

    function closeSearchPopover() {
      if (suggestionBox) suggestionBox.style.display = 'none';
      setTypingMode(false);
      if (document.activeElement === topSearchInput) {
        topSearchInput.blur();
      }
    }

    function renderPopover() {
      if (!suggestionBox) return;
      const query = topSearchInput.value.trim();
      const history = getSearchHistory();
      setTypingMode(true);

      // Mode 1: Query is empty -> show recent history
      if (!query) {
        let html = `
          <div class="ps-section-label">
            <span>PS &gt; RECENT SEARCH HISTORY (${history.length}/4)</span>
            ${history.length > 0 ? `<button type="button" id="clearHistoryBtn" style="background:none; border:none; padding:2px 4px; color:var(--text-faint); font-size:10px; cursor:pointer;" title="Clear Search History">CLEAR ✕</button>` : ''}
          </div>
        `;

        if (history.length === 0) {
          html += `
            <div style="padding: 8px 12px; font-size: 11px; color: var(--text-muted); text-align: left; border-bottom: 1px solid oklch(from var(--text-normal) l c h / 8%);">
              PS &gt; No recent search history. Tap a disk below:
            </div>
          `;
          const quickCards = CATALOG_DISKS.slice(0, 3);
          quickCards.forEach((app, idx) => {
            html += `
              <div class="suggestion-item" data-nav-index="${idx}" data-app-id="${app.id}" data-app-title="${escapeHtml(app.title)}">
                <div class="suggestion-left">
                  <span class="suggestion-title">${escapeHtml(app.title)}</span>
                </div>
                <div class="suggestion-meta">
                  <span class="size-pill">${escapeHtml(app.fileSize || app.size)}</span>
                </div>
              </div>
            `;
          });
        } else {
          history.forEach((item, idx) => {
            const isFound = item.type === 'found';
            html += `
              <div class="suggestion-item" data-nav-index="${idx}" data-history-query="${escapeHtml(item.query || item.name)}">
                <div class="suggestion-left">
                  <span class="${isFound ? 'ps-badge-found' : 'ps-badge-not-found'}">
                    ${isFound ? '✓ found:' : '✗ not found:'}
                  </span>
                  <span class="suggestion-title">${escapeHtml(item.name)}</span>
                </div>
                <div class="suggestion-meta">
                  <span style="font-size: 10px; color: var(--text-faint);">Tap to search</span>
                </div>
              </div>
            `;
          });
        }

        html += `
          <div class="suggestion-footer">
            <span>↑↓ Navigate • ↵ Select</span>
            <button type="button" id="closeSuggestionBtn" style="background:none; border:none; padding:2px 6px; color:var(--interactive-accent); font-size:10px; font-weight:700; cursor:pointer;">CLOSE [ESC] ✕</button>
          </div>
        `;

        suggestionBox.innerHTML = html;
        suggestionBox.style.display = 'block';
        attachListeners();
        return;
      }

      // Mode 2: User is typing -> filter matching cards
      const qLower = query.toLowerCase();
      const matches = CATALOG_DISKS.filter(item => {
        const title = (item.title || '').toLowerCase();
        const overview = (item.overview || '').toLowerCase();
        const tags = (item.tags || []).join(' ').toLowerCase();
        return title.includes(qLower) || overview.includes(qLower) || tags.includes(qLower);
      });

      let html = `
        <div class="ps-section-label">
          <span>PS &gt; TOP SUGGESTIONS (${Math.min(matches.length, 5)})</span>
          <button type="button" id="clearTypedQueryBtn" style="background:none; border:none; padding:2px 4px; color:var(--text-faint); font-size:10px; cursor:pointer;">CLEAR ⌫</button>
        </div>
      `;

      let navIdx = 0;
      if (matches.length > 0) {
        matches.slice(0, 5).forEach(app => {
          html += `
            <div class="suggestion-item" data-nav-index="${navIdx}" data-app-id="${app.id}" data-app-title="${escapeHtml(app.title)}">
              <div class="suggestion-left">
                <span class="suggestion-title">${highlightMatch(app.title, query)}</span>
              </div>
              <div class="suggestion-meta">
                <span class="floppy-cat-badge">${escapeHtml(app.sectorLabel)}</span>
                <span class="size-pill">${escapeHtml(app.fileSize || app.size)}</span>
              </div>
            </div>
          `;
          navIdx++;
        });
      } else {
        html += `
          <div class="suggestion-item" data-nav-index="${navIdx}" data-not-found-query="${escapeHtml(query)}">
            <div class="suggestion-left">
              <span class="ps-badge-not-found">✗ not found:</span>
              <span>"${escapeHtml(query)}"</span>
            </div>
            <div class="suggestion-meta">
              <span style="font-size: 10px; color: var(--text-faint);">tap / ↵ to save</span>
            </div>
          </div>
        `;
        navIdx++;
      }

      if (history.length > 0) {
        html += `
          <div class="ps-section-label">
            <span>PS &gt; RECENT HISTORY (${Math.min(history.length, 2)} LATEST)</span>
            <button type="button" id="clearHistoryBtn" style="background:none; border:none; padding:2px 4px; color:var(--text-faint); font-size:10px; cursor:pointer;" title="Clear Search History">CLEAR ✕</button>
          </div>
        `;
        history.slice(0, 2).forEach(item => {
          const isFound = item.type === 'found';
          html += `
            <div class="suggestion-item" data-nav-index="${navIdx}" data-history-query="${escapeHtml(item.query || item.name)}">
              <div class="suggestion-left">
                <span class="${isFound ? 'ps-badge-found' : 'ps-badge-not-found'}">
                  ${isFound ? '✓ found:' : '✗ not found:'}
                </span>
                <span>${escapeHtml(item.name)}</span>
              </div>
              <div class="suggestion-meta">
                <span style="font-size: 10px; color: var(--text-faint);">Tap to search</span>
              </div>
            </div>
          `;
          navIdx++;
        });
      }

      html += `
        <div class="suggestion-footer">
          <span>↑↓ Navigate • ↵ Select</span>
          <button type="button" id="closeSuggestionBtn" style="background:none; border:none; padding:2px 6px; color:var(--interactive-accent); font-size:10px; font-weight:700; cursor:pointer;">DONE / CLOSE ✕</button>
        </div>
      `;

      suggestionBox.innerHTML = html;
      suggestionBox.style.display = 'block';
      attachListeners();
    }

    function attachListeners() {
      const clearBtn = document.getElementById('clearHistoryBtn');
      if (clearBtn) {
        clearBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          clearSearchHistory();
          renderPopover();
        });
      }

      const clearTypedBtn = document.getElementById('clearTypedQueryBtn');
      if (clearTypedBtn) {
        clearTypedBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          topSearchInput.value = '';
          syncTerminalDisplay();
          setSearch('');
          renderPopover();
          topSearchInput.focus();
        });
      }

      const closeBtn = document.getElementById('closeSuggestionBtn');
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          closeSearchPopover();
          topSearchInput.blur();
        });
      }

      suggestionBox.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const appId = item.getAttribute('data-app-id');
          const appTitle = item.getAttribute('data-app-title');
          if (appId) {
            addSearchHistory('found', appTitle, topSearchInput.value.trim() || appTitle);
            closeSearchPopover();
            window.location.href = `page-playground.html?app=${encodeURIComponent(appId)}`;
            return;
          }
          const historyQuery = item.getAttribute('data-history-query');
          if (historyQuery) {
            topSearchInput.value = historyQuery;
            syncTerminalDisplay();
            setSearch(historyQuery);
            renderPopover();
            topSearchInput.focus();
            return;
          }
          const notFoundQ = item.getAttribute('data-not-found-query');
          if (notFoundQ) {
            addSearchHistory('not found', notFoundQ, notFoundQ);
            renderPopover();
          }
        });
      });
    }

    function openOrToggleSearch(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (suggestionBox && suggestionBox.style.display === 'block' && !topSearchInput.value.trim()) {
        closeSearchPopover();
        topSearchInput.blur();
      } else {
        setTypingMode(true);
        renderPopover();
        topSearchInput.focus();
      }
    }

    // Attach Click Handlers
    if (searchActionBtn && !searchActionBtn.dataset.searchBound) {
      searchActionBtn.dataset.searchBound = 'true';
      searchActionBtn.addEventListener('click', openOrToggleSearch);
    }
    if (terminalCursor && !terminalCursor.dataset.cursorBound) {
      terminalCursor.dataset.cursorBound = 'true';
      terminalCursor.addEventListener('click', openOrToggleSearch);
    }
    if (cliPromptLine && !cliPromptLine.dataset.promptBound) {
      cliPromptLine.dataset.promptBound = 'true';
      cliPromptLine.addEventListener('click', (e) => {
        if (!e.target.closest('.suggestion-container') && !e.target.closest('a')) {
          setTypingMode(true);
          renderPopover();
          topSearchInput.focus();
        }
      });
    }

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#stickyNavbar') && !e.target.closest('#cliPromptLine') && !e.target.closest('#searchActionBtn')) {
        closeSearchPopover();
      }
    });

    topSearchInput.addEventListener('input', () => {
      syncTerminalDisplay();
      setSearch(topSearchInput.value);
      renderPopover();
    });

    topSearchInput.addEventListener('focus', () => {
      renderPopover();
    });

    topSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeSearchPopover();
        if (topSearchInput.value) {
          topSearchInput.value = '';
          syncTerminalDisplay();
          setSearch('');
        }
        topSearchInput.blur();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const q = topSearchInput.value.trim();
        if (q) {
          const match = CATALOG_DISKS.find(d => (d.title || '').toLowerCase().includes(q.toLowerCase()));
          if (match) {
            addSearchHistory('found', match.title, q);
            closeSearchPopover();
            window.location.href = `page-playground.html?app=${encodeURIComponent(match.id)}`;
          } else {
            addSearchHistory('not found', q, q);
            renderPopover();
          }
        }
      }
    });

    // Global hotkey '/'
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== topSearchInput) {
        e.preventDefault();
        openOrToggleSearch();
      }
    });
  }

  // --------------------------------------------------------------------------
  // MOBILE VIEW MODE (GRIDVIEW ⊞ vs DETAILVIEW ▤)
  // --------------------------------------------------------------------------
  const VIEW_MODE_KEY = 'arcade_mobile_view_mode';

  function initMobileViewMode() {
    const gridEl = document.getElementById('appsGrid') || document.querySelector('[data-role="floppy-grid"]');
    const gridViewBtn = document.getElementById('gridViewBtn');
    const detailViewBtn = document.getElementById('detailViewBtn');

    function setMode(mode) {
      const target = mode === 'detail' ? 'detail' : 'grid';
      if (gridEl) {
        gridEl.classList.remove('mobile-view-grid', 'mobile-view-detail');
        gridEl.classList.add(target === 'detail' ? 'mobile-view-detail' : 'mobile-view-grid');
      }
      if (gridViewBtn) gridViewBtn.classList.toggle('is-active', target === 'grid');
      if (detailViewBtn) detailViewBtn.classList.toggle('is-active', target === 'detail');
      try { localStorage.setItem(VIEW_MODE_KEY, target); } catch (e) {}
    }

    if (gridViewBtn && !gridViewBtn.dataset.viewBound) {
      gridViewBtn.dataset.viewBound = 'true';
      gridViewBtn.addEventListener('click', () => setMode('grid'));
    }
    if (detailViewBtn && !detailViewBtn.dataset.viewBound) {
      detailViewBtn.dataset.viewBound = 'true';
      detailViewBtn.addEventListener('click', () => setMode('detail'));
    }

    try {
      const saved = localStorage.getItem(VIEW_MODE_KEY) || 'grid';
      setMode(saved);
    } catch (e) {
      setMode('grid');
    }
  }

  /**
   * Initialize Catalog Core
   */
  function init() {
    loadPins();
    syncCategoryTabsUI();
    updateWibClock();
    setInterval(updateWibClock, 1000);
    fitCardTagsByLetterCount();
    initSearchTerminal();
    initMobileViewMode();

    window.addEventListener('resize', () => {
      fitCardTagsByLetterCount();
    });

    const gridEl = document.getElementById('appsGrid') || document.querySelector('[data-role="floppy-grid"]');

    // Bind Pin-Only Toggle Button
    const pinOnlyBtn = document.getElementById('pinOnlyToggleBtn');
    if (pinOnlyBtn && !pinOnlyBtn.dataset.pinOnlyBound) {
      pinOnlyBtn.dataset.pinOnlyBound = 'true';
      pinOnlyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        togglePinOnly();
      });
    }

    // Bind Category / Sector Filter Tabs (.workspace-tab-header)
    document.querySelectorAll('.workspace-tab-header, [data-sector-filter]').forEach(tab => {
      if (tab.dataset.tabBound) return;
      tab.dataset.tabBound = 'true';
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const sc = tab.dataset.scope || tab.getAttribute('data-scope') || tab.dataset.sectorFilter;
        if (sc) setSector(sc);
      });
    });

    // Bind static card pin click listeners (if static cards exist initially)
    if (gridEl && gridEl.children.length > 0 && !gridEl.hasAttribute('data-dynamic-rendered')) {
      syncDomPins();

      document.querySelectorAll('.floppy-corner-cut, .floppy-pin-btn').forEach(btn => {
        if (btn.dataset.pinBound) return;
        btn.dataset.pinBound = 'true';
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const card = btn.closest('.floppy-card');
          if (card) {
            const appId = card.getAttribute('data-app') || card.getAttribute('data-app-id');
            if (appId) togglePin(appId);
          }
        });
      });
    }

    // Trigger instant CSR from apps/_catalog.json
    loadCatalog();
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
    disks: CATALOG_DISKS,
    togglePin: togglePin,
    isPinned: isPinned,
    togglePinOnly: togglePinOnly,
    setPinOnly: setPinOnly,
    isPinOnly: function () { return pinOnlyMode; },
    setSector: setSector,
    setSearch: setSearch,
    renderCards: renderCards,
    syncDomPins: syncDomPins,
    parseFrontmatter: parseFrontmatter,
    normalizeDisk: normalizeDisk,
    detectCategoryCounts: detectCategoryCounts,
    syncCategoryTabsUI: syncCategoryTabsUI,
    init: init
  };
});
