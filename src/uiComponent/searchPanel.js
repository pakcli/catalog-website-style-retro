/**
 * Atomic UI Component: Instant Title Search Panel (`searchPanel.js`)
 * Format: Live Title Search Overlay [ESC: X] with [↑↓] Navigate, [ENTER] Select
 */
export function initSearchPanel(catalogItems = []) {
  let panel = document.getElementById('searchPanelOverlay');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'searchPanelOverlay';
    panel.className = 'search-panel-overlay hidden';
    panel.innerHTML = `
      <div class="search-panel-dialog">
        <div class="search-panel-header">
          <span class="panel-title">LIVE TITLE SEARCH</span>
          <button class="panel-close-btn" id="searchPanelClose">[ESC: X]</button>
        </div>
        <div class="search-panel-input-box">
          <span class="prompt-sym">&gt;_</span>
          <input type="text" id="panelLiveQuery" placeholder="Search by title across subsystems..." autocomplete="off" />
        </div>
        <div class="search-panel-results" id="searchPanelResults">
          <!-- Dynamic Results -->
        </div>
        <div class="search-panel-footer">
          <span>[↑↓] Navigate</span>
          <span>[ENTER] Select / Open</span>
          <span>[ESC] Close Search Panel</span>
        </div>
      </div>
    `;
    document.body.appendChild(panel);
  }

  const closeBtn = document.getElementById('searchPanelClose');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => panel.classList.add('hidden'));
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.classList.contains('hidden')) {
      panel.classList.add('hidden');
    }
  });
}
