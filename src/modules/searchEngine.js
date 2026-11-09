/**
 * Pure Business Logic: Instant Title Substring Search Engine
 */
export function filterItemsByQuery(items, query) {
  if (!query || !query.trim()) return items;
  const q = query.trim().toLowerCase();

  return items.filter(item => {
    const title = (item.title || '').toLowerCase();
    const slug = (item.slug || item.id || '').toLowerCase();
    const desc = (item.overview || item.description || item.purpose || '').toLowerCase();
    const tags = Array.isArray(item.tags) ? item.tags.map(t => t.toLowerCase()) : [];
    
    return title.includes(q) || slug.includes(q) || desc.includes(q) || tags.some(t => t.includes(q));
  });
}
