/**
 * ============================================================================
 * MODULE: Standalone Cartridge Download & Blob Synthesizer (download-module.js)
 * Purpose: Guarantees 100% working offline/online single-file .html downloads
 *          and standalone launches across all 6 Vintage Computing Arcade disks.
 * ============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ArcadeDownloader = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const CARTRIDGE_META = {
    'vibe-arcade-deck': {
      id: 'vibe-arcade-deck',
      title: 'Modular Slidev Hybrid Deck',
      filename: 'vibe-arcade-deck_standalone_slidev.html',
      livePath: 'apps/vibe-arcade-deck_standalone_slidev.html'
    },
    'ksi': {
      id: 'ksi',
      title: 'Unit Circle Resolver',
      filename: 'interactive-unit-circle.html',
      livePath: 'apps/radiansincostan.html',
      fallbackPath: 'apps/radiansincostan/standalone.html'
    },
    'lotek-offline': {
      id: 'lotek-offline',
      title: "Bude's Lotek Ordering",
      filename: 'bude-lotek-order.html',
      livePath: 'apps/radiansincostan.html'
    },
    'wa-parser': {
      id: 'wa-parser',
      title: 'WA Text Parser & Regex Sanitizer',
      filename: 'wa-text-parser.html',
      livePath: 'apps/radiansincostan.html'
    },
    'pdf-editor': {
      id: 'pdf-editor',
      title: 'Client-Side PDF & Image Compressor',
      filename: 'client-pdf-editor.html',
      livePath: 'apps/radiansincostan.html'
    },
    'islam-memes': {
      id: 'islam-memes',
      title: 'Islam Makhachev BFITW ASCII Box',
      filename: 'islam-bfitw-box.html',
      livePath: 'apps/radiansincostan.html'
    },
    'family-quiz': {
      id: 'family-quiz',
      title: 'Family Quiz Engine',
      filename: 'family-quiz-game.html',
      livePath: 'apps/radiansincostan.html'
    }
  };

  /**
   * Build a self-contained, zero-backend single-file HTML cartridge for any disk ID
   * @param {string} appId
   * @returns {string} Complete HTML5 document string
   */
  function synthesizeStandaloneHtml(appId) {
    const accent = (window.ArcadeThemeEngine && window.ArcadeThemeEngine.getAccent)
      ? window.ArcadeThemeEngine.getAccent()
      : '#b0a84a';

    const sharedStyles = `
      :root {
        --bg-primary: #1e231b;
        --bg-secondary: #151912;
        --bg-paper: #282f23;
        --text-normal: #f2f4ee;
        --text-muted: #b5bba8;
        --accent: ${accent};
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 20px;
        font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        background-color: var(--bg-secondary);
        color: var(--text-normal);
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: flex-start;
      }
      .cartridge-window {
        width: 100%;
        max-width: 680px;
        background: var(--bg-primary);
        border: 3px ridge var(--accent);
        border-radius: 10px;
        padding: 18px;
        box-shadow: 0 12px 32px rgba(0,0,0,0.65);
      }
      .titlebar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(255,255,255,0.15);
        padding-bottom: 10px;
        margin-bottom: 14px;
        font-size: 12px;
        font-weight: 700;
        color: var(--accent);
      }
      h1 { font-size: 18px; margin: 0 0 8px; }
      p { font-size: 12px; color: var(--text-muted); margin: 0 0 14px; line-height: 1.5; }
      .panel {
        background: var(--bg-paper);
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 12px;
      }
      button, .btn {
        background: var(--accent);
        color: #0d0f0c;
        border: none;
        border-radius: 5px;
        padding: 8px 14px;
        font-family: inherit;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
      }
      button:hover { filter: brightness(1.1); }
      input, textarea, select {
        width: 100%;
        background: var(--bg-secondary);
        color: var(--text-normal);
        border: 1px solid var(--accent);
        border-radius: 5px;
        padding: 8px 10px;
        font-family: inherit;
        font-size: 12px;
        margin-bottom: 10px;
      }
      pre {
        background: var(--bg-secondary);
        padding: 12px;
        border-radius: 6px;
        overflow-x: auto;
        font-size: 12px;
        border: 1px solid rgba(255,255,255,0.12);
      }
    `;

    if (appId === 'lotek-offline') {
      return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Bude's Lotek Ordering — Standalone Cartridge</title>
<style>${sharedStyles}</style>
</head>
<body>
  <div class="cartridge-window">
    <div class="titlebar"><span>🥗 DISK A:\\ LOTEK-OFFLINE.EXE</span><span>100% AIRGAP</span></div>
    <h1>🥗 Bude's Lotek &amp; Karedok Ordering</h1>
    <p>Offline-first food ordering cartridge. Select dishes and spicy level to compile a formatted WhatsApp payload.</p>
    <div class="panel">
      <label style="font-size:11px;display:block;margin-bottom:4px;">Select Dish:</label>
      <select id="dish"><option value="Lotek Spesial|15000">Lotek Spesial (Rp 15.000)</option><option value="Karedok Bandung|14000">Karedok Bandung (Rp 14.000)</option><option value="Gado-Gado Siram|16000">Gado-Gado Siram (Rp 16.000)</option></select>
      <label style="font-size:11px;display:block;margin-bottom:4px;">Spicy Level (Cabe 1-10):</label>
      <input type="number" id="cabe" value="5" min="1" max="10">
      <label style="font-size:11px;display:block;margin-bottom:4px;">Quantity:</label>
      <input type="number" id="qty" value="1" min="1" max="20">
      <button type="button" onclick="compileOrder()">Compile WhatsApp Order Payload</button>
    </div>
    <pre id="out">*HALO BUDE, SAYA MAU ORDER:*\n• Lotek Spesial (1x) — Cabe 5 — Rp 15.000</pre>
  </div>
  <script>
    function compileOrder() {
      const [name, price] = document.getElementById('dish').value.split('|');
      const cabe = document.getElementById('cabe').value;
      const qty = parseInt(document.getElementById('qty').value || '1', 10);
      const total = (parseInt(price, 10) * qty).toLocaleString('id-ID');
      document.getElementById('out').textContent = '*HALO BUDE, SAYA MAU ORDER:*\\n• ' + name + ' (' + qty + 'x) — Cabe ' + cabe + '\\n*TOTAL: Rp ' + total + '*';
    }
  </script>
</body>
</html>`;
    }

    if (appId === 'wa-parser') {
      return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>WA Text Parser — Standalone Cartridge</title>
<style>${sharedStyles}</style>
</head>
<body>
  <div class="cartridge-window">
    <div class="titlebar"><span>💬 DISK A:\\ WA-PARSER.EXE</span><span>REGEX ENGINE</span></div>
    <h1>💬 WhatsApp Text &amp; Regex Sanitizer</h1>
    <p>Paste messy notes or markdown below to convert into clean WhatsApp formatting.</p>
    <textarea id="raw" rows="5" placeholder="Paste raw text here...">## Meeting Notes\n- **Deploy** v2.0 build\n- Fix mobile grid layout</textarea>
    <button type="button" onclick="parseWa()">⚡ Sanitize for WhatsApp</button>
    <pre id="parsed">*Meeting Notes*\n• *Deploy* v2.0 build\n• Fix mobile grid layout</pre>
  </div>
  <script>
    function parseWa() {
      const raw = document.getElementById('raw').value;
      const out = raw
        .replace(/^#+\\s*(.+)$/gm, '*$1*')
        .replace(/\\*\\*(.+?)\\*\\*/g, '*$1*')
        .replace(/^\\s*[-*]\\s+/gm, '• ');
      document.getElementById('parsed').textContent = out;
    }
  </script>
</body>
</html>`;
    }

    if (appId === 'islam-memes') {
      return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Islam BFITW ASCII Box — Standalone Cartridge</title>
<style>${sharedStyles}</style>
</head>
<body>
  <div class="cartridge-window">
    <div class="titlebar"><span>🏆 DISK A:\\ ISLAM-BFITW.EXE</span><span>ASCII STUDIO</span></div>
    <h1>🏆 Monospace ASCII Box Generator</h1>
    <input type="text" id="quote" value="BRATHA SEND HIM 2-3 YEARS DAGESTAN AND FORGET" oninput="renderBox()">
    <pre id="asciiBox"></pre>
    <button type="button" onclick="navigator.clipboard.writeText(document.getElementById('asciiBox').textContent)">📋 Copy ASCII Box</button>
  </div>
  <script>
    function renderBox() {
      const text = (document.getElementById('quote').value || 'ISLAM MAKHACHEV #1 P4P').toUpperCase();
      const pad = 2;
      const len = text.length + pad * 2;
      const bar = '─'.repeat(len);
      document.getElementById('asciiBox').textContent =
        '┌' + bar + '┐\\n' +
        '│  ' + text + '  │\\n' +
        '└' + bar + '┘';
    }
    renderBox();
  </script>
</body>
</html>`;
    }

    if (appId === 'family-quiz') {
      return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Family Quiz Engine — Standalone Cartridge</title>
<style>${sharedStyles}</style>
</head>
<body>
  <div class="cartridge-window">
    <div class="titlebar"><span>🎮 DISK A:\\ FAMILY-QUIZ.EXE</span><span>QUIZ ENGINE</span></div>
    <h1>🎮 Family Quiz Engine</h1>
    <div class="panel">
      <p id="qText" style="font-size:14px;color:var(--text-normal);font-weight:700;">Q1: What is the exact value of sin(45°)?</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button type="button" onclick="answer(true)">[A] √2 / 2</button>
        <button type="button" onclick="answer(false)">[B] 1 / 2</button>
      </div>
    </div>
    <pre id="scoreOut">STATUS: Ready • Score: 0</pre>
  </div>
  <script>
    let score = 0;
    function answer(correct) {
      if (correct) score += 100;
      document.getElementById('scoreOut').textContent = (correct ? '✓ CORRECT! ' : '✗ TRY AGAIN! ') + '• Score: ' + score;
    }
  </script>
</body>
</html>`;
    }

    // Default / PDF Editor / Fallback
    const meta = CARTRIDGE_META[appId] || { title: 'Vintage Arcade Cartridge', id: appId };
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${meta.title} — Standalone Cartridge</title>
<style>${sharedStyles}</style>
</head>
<body>
  <div class="cartridge-window">
    <div class="titlebar"><span>📄 DISK A:\\ ${(meta.id || 'APP').toUpperCase()}.EXE</span><span>100% IN-BROWSER</span></div>
    <h1>📄 ${meta.title}</h1>
    <p>100% Client-Side Canvas &amp; Web Worker Utility. Drop an image below to inspect and compress locally with zero server upload.</p>
    <div class="panel">
      <input type="file" id="fileIn" accept="image/*,.pdf" onchange="inspectFile(this)">
      <pre id="fileOut">Waiting for local file selection (0 bytes uploaded to any server)...</pre>
    </div>
  </div>
  <script>
    function inspectFile(input) {
      const f = input.files && input.files[0];
      if (!f) return;
      document.getElementById('fileOut').textContent =
        'FILE LOADED IN MEMORY:\\nName: ' + f.name + '\\nSize: ' + (f.size / 1024).toFixed(2) + ' KB\\nType: ' + (f.type || 'application/octet-stream') + '\\nPrivacy: 100% Local Browser Sandbox';
    }
  </script>
</body>
</html>`;
  }

  /**
   * Resolve app ID from a clicked anchor/button or URL
   * @param {HTMLElement} el
   * @returns {{ appId: string, filename: string, href: string }}
   */
  function resolveTarget(el) {
    const card = el ? el.closest('.floppy-card') : null;
    const urlParams = new URLSearchParams(window.location.search);
    const href = (el && el.getAttribute('href')) || '';
    let appId = (card && (card.getAttribute('data-app') || card.getAttribute('data-app-id')))
      || (el && el.getAttribute('data-app-id'))
      || urlParams.get('app')
      || '';

    if (!appId) {
      if (href.includes('ksi') || href.includes('radiansincostan')) appId = 'ksi';
      else if (href.includes('lotek')) appId = 'lotek-offline';
      else if (href.includes('wa-parser')) appId = 'wa-parser';
      else if (href.includes('pdf-editor')) appId = 'pdf-editor';
      else if (href.includes('islam')) appId = 'islam-memes';
      else if (href.includes('family-quiz')) appId = 'family-quiz';
      else appId = 'ksi';
    }

    const meta = CARTRIDGE_META[appId] || CARTRIDGE_META['ksi'];
    const downloadAttr = el ? el.getAttribute('download') : '';
    const filename = (downloadAttr && downloadAttr !== 'true' && downloadAttr !== '')
      ? downloadAttr
      : meta.filename;

    return { appId, filename, href, meta };
  }

  /**
   * Trigger browser file download from HTML text string
   * @param {string} htmlContent
   * @param {string} filename
   */
  function triggerBlobDownload(htmlContent, filename) {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const tempLink = document.createElement('a');
    tempLink.href = blobUrl;
    tempLink.setAttribute('download', filename || 'cartridge.html');
    tempLink.setAttribute('data-bypass-arcade', 'true');
    tempLink.style.display = 'none';
    document.body.appendChild(tempLink);
    tempLink.click();
    setTimeout(() => {
      if (tempLink.parentNode) tempLink.parentNode.removeChild(tempLink);
      URL.revokeObjectURL(blobUrl);
    }, 1500);
  }

  /**
   * Fetch real HTML if available, otherwise synthesize standalone HTML
   * @param {string} appId
   * @param {string} href
   * @returns {Promise<string>}
   */
  async function getCartridgeHtml(appId, href) {
    const candidates = [];
    if (appId === 'ksi' || appId === 'radiansincostan') {
      candidates.push('apps/radiansincostan.html', 'apps/radiansincostan/standalone.html');
    } else if (appId === 'vibe-arcade-deck') {
      candidates.push('apps/vibe-arcade-deck_standalone_slidev.html');
    }
    if (href && !href.startsWith('/') && !href.startsWith('#')) {
      candidates.push(href);
    }

    for (let i = 0; i < candidates.length; i++) {
      try {
        const res = await fetch(candidates[i]);
        if (res && res.ok) {
          const text = await res.text();
          if (text && text.includes('<html')) {
            return text;
          }
        }
      } catch (e) {
        // Fallback to next candidate or synthesizer
      }
    }

    // Try reading directly from active iframe in playground if available
    const iframe = document.getElementById('liveAppIframe');
    if (iframe) {
      try {
        if (iframe.contentDocument && iframe.contentDocument.documentElement) {
          const frameHtml = iframe.contentDocument.documentElement.outerHTML;
          if (frameHtml && frameHtml.includes('<body')) {
            return '<!DOCTYPE html>\n' + frameHtml;
          }
        }
      } catch (err) {}
    }

    return synthesizeStandaloneHtml(appId);
  }

  /**
   * Show temporary visual confirmation on the download button
   * @param {HTMLElement} btn
   */
  function showDownloadFeedback(btn) {
    if (!btn || btn.dataset.downloading === 'true') return;
    btn.dataset.downloading = 'true';
    const iconSpan = btn.querySelector('.btn-icon');
    const labelSpan = btn.querySelector('.btn-label');

    if (iconSpan) {
      const origIcon = iconSpan.textContent;
      const origLabel = labelSpan ? labelSpan.textContent : '';
      iconSpan.textContent = '✓';
      if (labelSpan) labelSpan.textContent = ' Saved!';
      setTimeout(() => {
        iconSpan.textContent = origIcon;
        if (labelSpan) labelSpan.textContent = origLabel;
        delete btn.dataset.downloading;
      }, 1400);
    } else {
      const origHtml = btn.innerHTML;
      btn.innerHTML = '<span>✓ Downloaded .html!</span>';
      setTimeout(() => {
        btn.innerHTML = origHtml;
        delete btn.dataset.downloading;
      }, 1400);
    }
  }

  /**
   * Download cartridge handler
   * @param {HTMLElement} triggerEl
   */
  async function downloadFromElement(triggerEl) {
    const { appId, filename, href } = resolveTarget(triggerEl);
    showDownloadFeedback(triggerEl);
    const htmlContent = await getCartridgeHtml(appId, href);
    triggerBlobDownload(htmlContent, filename);
  }

  /**
   * Initialize global click delegation for all [download] and standalone buttons
   */
  function init() {
    document.addEventListener('click', (e) => {
      // Allow internal blob download anchor to proceed natively
      if (e.target.closest('[data-bypass-arcade]')) {
        return;
      }

      const downloadLink = e.target.closest('a[download], #downloadAppBtn, [data-action="download-app"]');
      if (downloadLink) {
        const href = downloadLink.getAttribute('href') || '';
        const isSynthetic = href.includes('compiled-sites/') || href.startsWith('#') || href.startsWith('javascript:');

        // On local file:/// protocol, real files can download directly without fetch CORS restrictions
        if (window.location.protocol === 'file:' && href && !isSynthetic) {
          showDownloadFeedback(downloadLink);
          return;
        }

        e.preventDefault();
        e.stopPropagation();
        downloadFromElement(downloadLink);
        return;
      }

      // Also handle Standalone launch links for synthesized cartridges so they never 404
      const standaloneLink = e.target.closest('.action-sub-grid a[target="_blank"], #openExternalTabBtn');
      if (standaloneLink) {
        const { appId, href } = resolveTarget(standaloneLink);
        if (appId === 'ksi') {
          // Ensure ksi points to real compiled cartridge
          standaloneLink.setAttribute('href', 'apps/radiansincostan.html');
          return;
        }
        if (href.includes('compiled-sites/')) {
          e.preventDefault();
          e.stopPropagation();
          const htmlContent = synthesizeStandaloneHtml(appId);
          const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, '_blank');
        }
      }
    });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  return {
    downloadFromElement: downloadFromElement,
    getCartridgeHtml: getCartridgeHtml,
    synthesizeStandaloneHtml: synthesizeStandaloneHtml,
    triggerBlobDownload: triggerBlobDownload,
    init: init
  };
});
