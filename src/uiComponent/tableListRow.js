/**
 * Atomic UI Component: Table List Row (Mode 3: Mobile 60 / Desktop 72 Cols)
 */
export function renderTableListRow(item, options = {}) {
  const isSubdir = typeof window !== 'undefined' && window.location && (
    window.location.pathname.includes('/apps') ||
    window.location.pathname.includes('/skills') ||
    window.location.pathname.includes('/combos') ||
    window.location.pathname.includes('/scripts')
  );
  const pfx = isSubdir ? '../' : '';
  const slug = item.slug || item.id;
  const rawCat = (item.category || item.sector || 'tools').toLowerCase();
  const categoryTruncated = rawCat.length > 8 ? rawCat.substring(0, 8) : rawCat;
  const playgroundUrl = `${pfx}data/apps/${slug}/index_detailed.html`;
  const downloadUrl = `${pfx}data/apps/${slug}/index.html`;

  return `
    <tr class="table-list-row" data-app-slug="${slug}" data-tags="${(item.tags || []).join(',')}" data-category="${rawCat}">
      <td class="col-name">
        <a href="${playgroundUrl}" class="table-item-link" title="${item.title}">
          <span class="prompt-sym">&gt;_</span>
          <span class="item-filename">${slug}.html</span>
        </a>
      </td>
      <td class="col-category">
        <span class="cat-pill">${categoryTruncated}</span>
      </td>
      <td class="col-actions">
        <div class="row-action-btns">
          <a href="${playgroundUrl}" class="btn-micro" title="Play">Play</a>
          <a href="${downloadUrl}" download class="btn-micro" title="Download">DL</a>
        </div>
      </td>
    </tr>
  `;
}
