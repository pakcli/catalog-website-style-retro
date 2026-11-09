/**
 * Atomic UI Component: Terminal Dock (`terminalDock.js`)
 * Bottom docked dry-run console for commands and quick execution
 */
export function initTerminalDock() {
  const dock = document.getElementById('terminalDock');
  if (!dock) return;

  dock.innerHTML = `
    <div class="terminal-dock-bar">
      <div class="dock-header">
        <span class="dock-title">&gt;_ RETRO CONSOLE // DRY-RUN DOCK</span>
        <button class="dock-toggle-btn" id="dockToggleBtn">[_]</button>
      </div>
      <div class="dock-body" id="dockBody">
        <pre class="dock-output">System initialized. Memory OK. 1 cartridge mounted at /apps/radiansincostan.</pre>
      </div>
    </div>
  `;

  const toggleBtn = document.getElementById('dockToggleBtn');
  const body = document.getElementById('dockBody');
  if (toggleBtn && body) {
    toggleBtn.addEventListener('click', () => {
      body.classList.toggle('hidden');
      toggleBtn.textContent = body.classList.contains('hidden') ? '[+]' : '[_]';
    });
  }
}
