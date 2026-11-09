/**
 * Atomic UI Component: Card Detailed Item (Mode 1: 3:4 Aspect Ratio)
 */
export function renderCardDetailed(item, options = {}) {
  const isSubdir = typeof window !== 'undefined' && window.location && (
    window.location.pathname.includes('/apps') ||
    window.location.pathname.includes('/skills') ||
    window.location.pathname.includes('/combos') ||
    window.location.pathname.includes('/scripts')
  );
  const pfx = isSubdir ? '../' : '';
  const slug = item.slug || item.id;
  const category = (item.category || item.sector || 'tools').toUpperCase();
  const title = item.title || 'Untitled Cartridge';
  const purpose = item.overview || item.description || item.purpose || '';
  const fileSize = item.fileSize || item.size || '12.4 KB';
  const loc = item.loc || 320;
  const tokens = item.tokens ? `~${item.tokens} tok` : '~1.2k tok';
  const tags = Array.isArray(item.tags) ? item.tags : [];
  const tagsHtml = tags.slice(0, 3).map(t => `<span class="tag-badge">#${t.replace(/^#/, '')}</span>`).join(' ');

  const previewSrc = item.img ? (item.img.startsWith('http') || item.img.startsWith('../') ? item.img : `${pfx}${item.img}`) : `${pfx}data/apps/${slug}/img.webp`;
  const playgroundUrl = `${pfx}data/apps/${slug}/index_detailed.html`;
  const downloadUrl = `${pfx}data/apps/${slug}/index.html`;
  const standaloneUrl = `${pfx}data/apps/${slug}/index.html`;

  return `
    <article class="floppy-card card-detailed mod-triad" data-app-slug="${slug}" data-tags="${tags.join(',')}" data-category="${category}">
      <div class="floppy-header-row">
        <span class="category-chip">${category}</span>
        <button class="pin-btn" data-pin-target="${slug}" title="Pin Cartridge" aria-label="Pin Cartridge">
          <span class="pin-icon">☆</span>
        </button>
      </div>
      <div class="media-slot-16-9">
        <div class="screen-preview-slot">
          <img src="${previewSrc}" alt="${title}" class="thumb-img" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'preview-not-found-box\\'><span class=\\'not-found-icon\\'>📺</span><span class=\\'not-found-text\\'>[preview not found]</span></div><div class=\\'launch-prompt\\'>▶</div>';" />
          <div class="launch-prompt">▶</div>
        </div>
      </div>
      <div class="card-content-body">
        <h3 class="card-title">${title}</h3>
        <p class="card-purpose">${purpose}</p>
      </div>
      <div class="telemetry-bar">
        <span class="tele-item">${fileSize}</span>
        <span class="tele-sep">│</span>
        <span class="tele-item">${loc} LOC</span>
        <span class="tele-sep">│</span>
        <span class="tele-item">${tokens}</span>
        <div class="tags-cluster">${tagsHtml}</div>
      </div>
      <div class="card-actions-detailed">
        <a href="${playgroundUrl}" class="button-link mod-cta btn-primary-action" title="Open in Playground">
          <span>&gt;_ Open in Playground</span>
        </a>
        <div class="action-sub-grid secondary-dual-row">
          <a href="${downloadUrl}" download class="button-link btn-download btn-sub-action btn-dl" title="Download Standalone">
            <span>⬇ Download</span>
          </a>
          <a href="${standaloneUrl}" target="_blank" rel="noopener noreferrer" class="button-link btn-standalone btn-sub-action" title="Open Standalone">
            <span>Standalone ↗</span>
          </a>
        </div>
      </div>
    </article>
  `;
}
