/**
 * Pure Business Logic: Slide-over Drawer & Modal Controller
 */
export function openDrawer(drawerId, title, contentHtml) {
  const drawer = document.getElementById(drawerId);
  if (!drawer) return;

  const titleEl = drawer.querySelector('.drawer-title');
  if (titleEl && title) titleEl.textContent = title;

  const bodyEl = drawer.querySelector('.drawer-body');
  if (bodyEl && contentHtml) bodyEl.innerHTML = contentHtml;

  drawer.classList.remove('hidden');
}

export function closeDrawer(drawerId) {
  const drawer = document.getElementById(drawerId);
  if (drawer) drawer.classList.add('hidden');
}
