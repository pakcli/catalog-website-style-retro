/**
 * ============================================================================
 * MODULE: Modular Slidev Hybrid Engine (src/modules/slidev-engine.js)
 * Purpose: Zero-backend MD-to-Slide parser, FNV-1a hash-keyed localStorage
 *          compiled slide cache, Virtual 3-Slide DOM Window (Prev|Active|Next),
 *          Dual-Window Presenter Mode (BroadcastChannel), Runnable JS blocks,
 *          CRT Wireframe highlighter, Laser/Ink Canvas, Overview Grid, and
 *          Standalone HTML Generator (*_standalone_slidev.html).
 * ============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ArcadeSlidev = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const CACHE_PREFIX = 'arcade_slidev_v1_';
  const CHANNEL_NAME = 'arcade_slidev_sync';

  /**
   * 1. Fast 32-bit FNV-1a Hash for Content-Addressed Caching (< 0.1ms)
   * @param {string} str
   * @returns {string} 8-char uppercase hex hash
   */
  function fnv1aHash(str) {
    let h = 0x811c9dc5;
    const s = String(str || '').replace(/\r\n/g, '\n').trim();
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(16).toUpperCase().padStart(8, '0');
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m]);
  }

  /**
   * 2. Parse Simple YAML Block into Object
   */
  function parseYamlBlock(yamlStr) {
    const meta = {};
    if (!yamlStr) return meta;
    yamlStr.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const idx = trimmed.indexOf(':');
      if (idx === -1) return;
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (val.startsWith('[') && val.endsWith(']')) {
        val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
      }
      meta[key] = val;
    });
    return meta;
  }

  function isYamlOnlyBlock(block) {
    const lines = String(block || '').trim().split(/\r?\n/);
    if (lines.length === 0 || lines.length > 12) return false;
    return lines.every(line => {
      const t = line.trim();
      if (!t || t.startsWith('#')) return true;
      return /^[a-zA-Z0-9_-]+\s*:\s*.+$/.test(t);
    });
  }

  /**
   * 3. Highlight CRT Wireframe / ASCII Schematic Box-Drawing Blocks
   */
  function highlightWireframe(code) {
    const escaped = escapeHtml(code);
    return escaped
      .replace(/([┌─┐│└┘├┤┬┴┼╔═╗║╚╝╠╣╦╩╬▲▼◀►➔╲╱]+)/g, '<span class="wf-border">$1</span>')
      .replace(/(\[[^\]\n]{1,28}\])/g, '<span class="wf-badge">$1</span>')
      .replace(/(✓[^\n<]*)/g, '<span class="wf-ok">$1</span>');
  }

  /**
   * 4. Lightweight Slidev Markdown-to-HTML Compiler
   */
  function compileMarkdownFragment(md, slideIdx) {
    if (!md) return '';
    let src = String(md);
    const codeBlocks = [];

    // Extract fenced code blocks first
    src = src.replace(/```([a-zA-Z0-9_-]*)(?:[ \t]+([^\r\n]*))?\r?\n([\s\S]*?)```/g, (_, lang, flags, code) => {
      const token = `@@SLIDEV_CODE_${codeBlocks.length}@@`;
      const l = (lang || 'text').toLowerCase();
      const f = (flags || '').toLowerCase();
      const isRunnable = l === 'js' && (f.includes('run') || f.includes('live'));
      const isWireframe = l === 'wireframe' || l === 'ascii';

      let blockHtml = '';
      if (isWireframe) {
        blockHtml = `<pre class="slidev-wireframe-box"><code>${highlightWireframe(code.replace(/\s+$/, ''))}</code></pre>`;
      } else if (isRunnable) {
        const runId = `run_${slideIdx}_${codeBlocks.length}`;
        const encoded = encodeURIComponent(code.trim());
        blockHtml = `
          <div class="slidev-code-wrap" data-run-id="${runId}">
            <div class="slidev-code-bar">
              <span>⚡ JS SANDBOX (EXECUTABLE)</span>
              <button type="button" class="slidev-run-btn" data-code="${encoded}" data-target="${runId}">▶ Run Code</button>
            </div>
            <pre class="slidev-code-pre"><code>${escapeHtml(code.replace(/\s+$/, ''))}</code></pre>
            <div class="slidev-run-output" id="${runId}" style="display:none;"></div>
          </div>
        `;
      } else {
        blockHtml = `
          <div class="slidev-code-wrap">
            <div class="slidev-code-bar"><span>${escapeHtml(l.toUpperCase())}</span></div>
            <pre class="slidev-code-pre"><code>${escapeHtml(code.replace(/\s+$/, ''))}</code></pre>
          </div>
        `;
      }
      codeBlocks.push(blockHtml);
      return token;
    });

    // Live Arcade Embeds: @[arcade](apps/radiansincostan.html)
    src = src.replace(/@\[arcade\]\(([^)]+)\)/g, (_, url) => {
      const safeUrl = escapeHtml(url.trim());
      return `
        <div class="slidev-embed-frame">
          <div class="slidev-embed-bar">
            <span>🕹️ LIVE CARTRIDGE EMBED: ${safeUrl}</span>
            <a href="${safeUrl}" target="_blank" rel="noopener">↗ Open Tab</a>
          </div>
          <iframe src="${safeUrl}" loading="lazy" title="Embedded Arcade Cartridge"></iframe>
        </div>
      `;
    });

    const lines = src.split(/\r?\n/);
    const out = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const line = rawLine.trim();

      if (!line) {
        if (inList) { out.push('</ul>'); inList = false; }
        continue;
      }

      if (/^@@SLIDEV_CODE_\d+@@$/.test(line)) {
        if (inList) { out.push('</ul>'); inList = false; }
        out.push(line);
        continue;
      }

      if (line.startsWith('# ')) {
        if (inList) { out.push('</ul>'); inList = false; }
        out.push(`<h1 class="slidev-h1">${formatInline(line.slice(2))}</h1>`);
      } else if (line.startsWith('## ')) {
        if (inList) { out.push('</ul>'); inList = false; }
        out.push(`<h2 class="slidev-h2">${formatInline(line.slice(3))}</h2>`);
      } else if (line.startsWith('### ')) {
        if (inList) { out.push('</ul>'); inList = false; }
        out.push(`<h3 class="slidev-h3">${formatInline(line.slice(4))}</h3>`);
      } else if (line.startsWith('> ')) {
        if (inList) { out.push('</ul>'); inList = false; }
        out.push(`<blockquote class="slidev-quote">${formatInline(line.slice(2))}</blockquote>`);
      } else if (/^[-*+]\s+/.test(line)) {
        if (!inList) { out.push('<ul class="slidev-list">'); inList = true; }
        out.push(`<li>${formatInline(line.replace(/^[-*+]\s+/, ''))}</li>`);
      } else if (/^\d+\.\s+/.test(line)) {
        if (!inList) { out.push('<ul class="slidev-list slidev-list-num">'); inList = true; }
        out.push(`<li>${formatInline(line)}</li>`);
      } else {
        if (inList) { out.push('</ul>'); inList = false; }
        out.push(`<p class="slidev-p">${formatInline(line)}</p>`);
      }
    }
    if (inList) out.push('</ul>');

    let html = out.join('\n');
    codeBlocks.forEach((blockHtml, idx) => {
      html = html.replace(`@@SLIDEV_CODE_${idx}@@`, blockHtml);
    });
    return html;
  }

  function formatInline(text) {
    let t = escapeHtml(text);
    t = t.replace(/`([^`]+)`/g, '<code class="slidev-inline-code">$1</code>');
    t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return t;
  }

  /**
   * 5. Parse Full Slidev Markdown into Deck Metadata + Compiled Slides Array
   * @param {string} rawMarkdown
   * @returns {{ hash: string, deckMeta: Object, slides: Array }}
   */
  function parseSlidevDeck(rawMarkdown) {
    const raw = String(rawMarkdown || '').trim();
    const hash = fnv1aHash(raw);
    let body = raw;
    let deckMeta = { title: 'Arcade Slidev Deck', layout: 'cover' };

    // Extract top deck frontmatter if present
    const fmMatch = body.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (fmMatch && isYamlOnlyBlock(fmMatch[1])) {
      deckMeta = Object.assign(deckMeta, parseYamlBlock(fmMatch[1]));
      body = body.slice(fmMatch[0].length);
    }

    // Split remaining content by `\n---\n` outside fenced code blocks
    const segments = [];
    let current = [];
    let inFence = false;
    const lines = body.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (l.trim().startsWith('```')) {
        inFence = !inFence;
      }
      if (!inFence && l.trim() === '---') {
        segments.push(current.join('\n'));
        current = [];
      } else {
        current.push(l);
      }
    }
    if (current.length > 0) {
      segments.push(current.join('\n'));
    }

    // Merge per-slide YAML blocks with their following slide content
    const rawSlides = [];
    let pendingMeta = null;

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i].trim();
      if (!seg) continue;
      if (isYamlOnlyBlock(seg) && i < segments.length - 1) {
        pendingMeta = Object.assign({}, pendingMeta || {}, parseYamlBlock(seg));
      } else {
        rawSlides.push({
          meta: pendingMeta || {},
          content: seg
        });
        pendingMeta = null;
      }
    }

    const slides = rawSlides.map((item, idx) => {
      let content = item.content;
      let notes = '';

      // Extract speaker notes <!-- notes: ... --> or <!-- ... -->
      content = content.replace(/<!--\s*(?:notes\s*:)?\s*([\s\S]*?)-->/gi, (_, noteText) => {
        notes += (notes ? '\n' : '') + noteText.trim();
        return '';
      });

      const layout = item.meta.layout || (idx === 0 ? (deckMeta.layout || 'cover') : (content.includes('::right::') ? 'two-cols' : 'default'));
      let html = '';

      if (content.includes('::right::')) {
        const parts = content.split(/::right::/i);
        const leftHtml = compileMarkdownFragment(parts[0], idx);
        const rightHtml = compileMarkdownFragment(parts.slice(1).join('\n'), idx);
        html = `
          <div class="slidev-two-cols">
            <div class="slidev-col-left">${leftHtml}</div>
            <div class="slidev-col-right">${rightHtml}</div>
          </div>
        `;
      } else {
        html = `<div class="slidev-single-col">${compileMarkdownFragment(content, idx)}</div>`;
      }

      const headingMatch = content.match(/^#{1,2}\s+(.+)$/m);
      const slideTitle = item.meta.title || (headingMatch ? headingMatch[1].replace(/[*`]/g, '').trim() : `Slide ${idx + 1}`);

      return {
        index: idx,
        title: slideTitle,
        layout: layout,
        meta: item.meta,
        notes: notes || 'No speaker notes for this slide.',
        html: html,
        rawText: content.replace(/[#*`>-]/g, ' ').replace(/\s+/g, ' ').trim()
      };
    });

    return {
      hash: hash,
      deckMeta: deckMeta,
      slides: slides
    };
  }

  /**
   * 6. Client-Side Hash Cache (First Open Compiles & Saves; Next Opens < 1ms)
   */
  function getCompiledDeck(deckId, rawMarkdown) {
    const id = deckId || 'default';
    const hash = fnv1aHash(rawMarkdown);
    const cacheKey = `${CACHE_PREFIX}${id}_${hash}`;

    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.hash === hash && Array.isArray(parsed.slides)) {
          parsed.cacheStatus = 'HIT';
          return parsed;
        }
      }
    } catch (e) {}

    // Cache Miss: Parse & Persist, and clean old hashes for this deckId
    const compiled = parseSlidevDeck(rawMarkdown);
    compiled.cacheStatus = 'MISS (Compiled & Cached)';
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith(`${CACHE_PREFIX}${id}_`) && k !== cacheKey) {
          localStorage.removeItem(k);
        }
      }
      localStorage.setItem(cacheKey, JSON.stringify({
        hash: compiled.hash,
        deckMeta: compiled.deckMeta,
        slides: compiled.slides,
        cachedAt: Date.now()
      }));
    } catch (e) {}

    return compiled;
  }

  /**
   * 7. Generate Standalone Self-Contained Slidev HTML (*_standalone_slidev.html)
   */
  function synthesizeStandaloneSlidevHtml(rawMarkdown, deckId, fileName) {
    const compiled = parseSlidevDeck(rawMarkdown);
    const safeTitle = escapeHtml(compiled.deckMeta.title || deckId || 'Arcade Slidev Deck');
    const safeRawMd = String(rawMarkdown || '').replace(/<\/script>/gi, '<\\/script>');
    const srcName = fileName || `${deckId || 'deck'}.md`;

    return `<!-- slidev-source: ${srcName} | md-hash: ${compiled.hash} | generated: ${new Date().toISOString().slice(0, 10)} -->
<!DOCTYPE html>
<html lang="en" class="theme-dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle} — Modular Slidev Deck</title>
  <style>
    :root {
      --bg-main: #141712;
      --bg-card: #1d211a;
      --bg-paper: #272d23;
      --bg-code: #0d0f0c;
      --text-main: #f3f4ef;
      --text-muted: #b2b8aa;
      --accent: #b0a84a;
      --border: #333b2e;
    }
    html.theme-light {
      --bg-main: #e6e9e0;
      --bg-card: #f4f5f0;
      --bg-paper: #faf8f3;
      --bg-code: #181b15;
      --text-main: #141712;
      --text-muted: #464c3f;
      --accent: #7e7724;
      --border: #c8cebe;
    }
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0; padding: 0; width: 100%; height: 100%;
      overflow-x: clip; background: var(--bg-main); color: var(--text-main);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    .slidev-shell {
      display: flex; flex-direction: column; height: 100vh; max-width: 100%; overflow: hidden;
    }
    .slidev-topbar {
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
      padding: 8px 14px; background: var(--bg-card); border-bottom: 2px solid var(--border);
      font-size: 12px; z-index: 30; flex-wrap: wrap;
    }
    .slidev-brand { font-weight: 700; color: var(--accent); display: flex; align-items: center; gap: 8px; }
    .slidev-cache-pill {
      font-size: 10px; padding: 2px 6px; border-radius: 4px;
      background: rgba(176,168,74,0.18); color: var(--accent); border: 1px solid var(--accent);
    }
    .slidev-toolbar { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .slidev-btn {
      background: var(--bg-paper); color: var(--text-main); border: 1px solid var(--border);
      border-radius: 4px; padding: 4px 8px; font-size: 11px; font-family: inherit;
      cursor: pointer; font-weight: 600; transition: all 0.12s ease;
    }
    .slidev-btn:hover, .slidev-btn.is-active {
      background: var(--accent); color: #0d0f0c; border-color: var(--accent);
    }
    .slidev-stage-wrap {
      flex: 1; position: relative; display: flex; align-items: center; justify-content: center;
      padding: 16px; overflow: hidden;
    }
    /* Virtual 3-Slide Window */
    .slidev-slide {
      width: min(100%, 1024px); max-height: 100%; overflow-y: auto;
      background: var(--bg-card); border: 2px solid var(--border); border-radius: 8px;
      padding: clamp(18px, 4vw, 44px); box-shadow: 0 12px 32px rgba(0,0,0,0.45);
      display: none; flex-direction: column; gap: 14px; position: relative;
    }
    .slidev-slide.is-active { display: flex; }
    .slidev-slide.layout-cover, .slidev-slide.layout-center {
      text-align: center; align-items: center; justify-content: center; min-height: 72%;
    }
    .slidev-slide-badge {
      font-size: 10px; font-weight: 700; color: var(--accent); letter-spacing: 0.08em;
      text-transform: uppercase; margin-bottom: 4px;
    }
    .slidev-h1 { font-size: clamp(20px, 3.2vw, 34px); margin: 0 0 8px; color: var(--text-main); line-height: 1.25; }
    .slidev-h2 { font-size: clamp(17px, 2.4vw, 24px); margin: 0 0 8px; color: var(--accent); line-height: 1.3; }
    .slidev-h3 { font-size: 15px; margin: 8px 0 4px; color: var(--text-main); }
    .slidev-p { font-size: clamp(12px, 1.4vw, 15px); line-height: 1.6; color: var(--text-muted); margin: 0 0 8px; }
    .slidev-list { margin: 4px 0 10px; padding-left: 20px; color: var(--text-main); font-size: clamp(12px, 1.35vw, 14px); line-height: 1.65; }
    .slidev-quote {
      margin: 8px 0; padding: 10px 14px; border-left: 4px solid var(--accent);
      background: var(--bg-paper); font-style: italic; color: var(--text-main); border-radius: 0 6px 6px 0;
    }
    .slidev-inline-code {
      background: var(--bg-code); color: var(--accent); padding: 1px 5px; border-radius: 3px; font-size: 0.92em;
    }
    .slidev-two-cols {
      display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; width: 100%; align-items: start;
    }
    .slidev-code-wrap {
      border: 1px solid var(--border); border-radius: 6px; overflow: hidden; background: var(--bg-code); margin: 6px 0; width: 100%; text-align: left;
    }
    .slidev-code-bar {
      display: flex; justify-content: space-between; align-items: center;
      padding: 5px 10px; background: #1a1f16; color: var(--accent); font-size: 10px; font-weight: 700;
    }
    .slidev-run-btn {
      background: var(--accent); color: #0d0f0c; border: none; border-radius: 3px;
      padding: 2px 8px; font-size: 10px; font-weight: 700; cursor: pointer;
    }
    .slidev-code-pre {
      margin: 0; padding: 12px; font-size: 11.5px; line-height: 1.5; color: #e5e7eb; overflow-x: auto;
    }
    .slidev-run-output {
      padding: 8px 12px; border-top: 1px dashed var(--accent); background: #121710;
      color: #4ade80; font-size: 11px; white-space: pre-wrap;
    }
    .slidev-wireframe-box {
      margin: 6px 0; padding: 12px; background: var(--bg-code); border: 1px solid var(--accent);
      border-radius: 6px; font-size: 11px; line-height: 1.45; color: #d4d8ce; overflow-x: auto; text-align: left;
    }
    .wf-border { color: var(--accent); font-weight: 700; }
    .wf-badge { color: #facc15; font-weight: 700; }
    .wf-ok { color: #4ade80; font-weight: 700; }
    .slidev-embed-frame {
      border: 1px solid var(--accent); border-radius: 6px; overflow: hidden; background: #0d0f0c; width: 100%;
    }
    .slidev-embed-bar {
      display: flex; justify-content: space-between; padding: 4px 10px; background: #1a1f16; font-size: 10px; color: var(--accent);
    }
    .slidev-embed-bar a { color: var(--text-main); text-decoration: none; }
    .slidev-embed-frame iframe { width: 100%; height: 240px; border: none; background: #fff; }
    /* Laser & Ink Canvas */
    #slidevInkCanvas {
      position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 20;
    }
    #slidevLaserDot {
      position: fixed; width: 14px; height: 14px; border-radius: 50%;
      background: #ef4444; box-shadow: 0 0 14px 4px #ef4444;
      pointer-events: none; z-index: 50; display: none; transform: translate(-50%, -50%);
    }
    /* Storyboard Overview Modal [O] & Editor Modal [E] */
    .slidev-overlay {
      position: fixed; inset: 0; background: rgba(10,12,9,0.92); z-index: 40;
      display: none; flex-direction: column; padding: 20px; overflow-y: auto;
    }
    .slidev-overlay.is-open { display: flex; }
    .overview-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; margin-top: 12px;
    }
    .overview-card {
      background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px;
      padding: 12px; cursor: pointer; transition: all 0.12s ease;
    }
    .overview-card:hover, .overview-card.is-current { border-color: var(--accent); box-shadow: 0 0 10px rgba(176,168,74,0.35); }
    .slidev-footer {
      display: flex; align-items: center; justify-content: space-between; gap: 10px;
      padding: 8px 14px; background: var(--bg-card); border-top: 2px solid var(--border); font-size: 11px; z-index: 30;
    }
    .slidev-progress-track {
      flex: 1; max-width: 260px; height: 6px; background: var(--bg-code); border-radius: 99px; overflow: hidden;
    }
    .slidev-progress-bar { height: 100%; background: var(--accent); width: 0%; transition: width 0.2s ease; }
    @media (max-width: 640px) {
      .slidev-two-cols { grid-template-columns: minmax(0, 1fr); }
      .slidev-stage-wrap { padding: 8px; }
      .slidev-slide { padding: 14px; }
      .hide-mobile { display: none !important; }
    }
  </style>
</head>
<body>
  <div id="slidevLaserDot"></div>

  <div class="slidev-shell">
    <!-- Top HUD -->
    <header class="slidev-topbar">
      <div class="slidev-brand">
        <span>📑 ${safeTitle}</span>
        <span class="slidev-cache-pill" id="cacheStatusPill">HYBRID CACHE</span>
      </div>
      <div class="slidev-toolbar">
        <button type="button" class="slidev-btn" id="btnOverview" title="Storyboard Overview Grid [O]">⊞ Grid [O]</button>
        <button type="button" class="slidev-btn" id="btnEditMd" title="Live Edit Markdown Source [E]">✏️ Edit [E]</button>
        <button type="button" class="slidev-btn" id="btnLaser" title="Toggle Laser Pointer [L]">🔴 Laser [L]</button>
        <button type="button" class="slidev-btn" id="btnDraw" title="Toggle Live Ink Draw [D]">🖊️ Draw [D]</button>
        <button type="button" class="slidev-btn hide-mobile" id="btnPresenter" title="Open Dual-Screen Presenter Window [P]">🎙️ Presenter [P]</button>
        <button type="button" class="slidev-btn" id="btnTheme" title="Toggle Light/Dark">☀️/🌙</button>
      </div>
    </header>

    <!-- Main Slide Stage (Virtual 3-Slide DOM Window + Ink Canvas) -->
    <main class="slidev-stage-wrap" id="slideStageWrap">
      <canvas id="slidevInkCanvas"></canvas>
      <div id="slideMountNode" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;"></div>
    </main>

    <!-- Bottom Navigation & Download Bar -->
    <footer class="slidev-footer">
      <div style="display:flex;align-items:center;gap:6px;">
        <button type="button" class="slidev-btn" id="btnPrev">◀ Prev</button>
        <button type="button" class="slidev-btn" id="btnNext">Next ▶</button>
      </div>
      <div class="slidev-progress-track"><div class="slidev-progress-bar" id="progressBar"></div></div>
      <div style="display:flex;align-items:center;gap:8px;">
        <span id="slideCounterText">1 / ${compiled.slides.length}</span>
        <button type="button" class="slidev-btn" id="btnDownloadHtml" title="Download Standalone .html">⬇️ .html</button>
        <button type="button" class="slidev-btn hide-mobile" id="btnDownloadMd" title="Download Raw .md">⬇️ .md</button>
      </div>
    </footer>
  </div>

  <!-- Storyboard Overview Overlay [O] -->
  <div class="slidev-overlay" id="overviewOverlay">
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <strong style="color:var(--accent);font-size:14px;">⊞ STORYBOARD OVERVIEW &amp; SEARCH</strong>
      <input type="search" id="slideSearchInput" placeholder="Filter slides by keyword..." style="padding:5px 10px;border-radius:4px;border:1px solid var(--border);background:var(--bg-card);color:var(--text-main);font-family:inherit;font-size:12px;width:240px;">
      <button type="button" class="slidev-btn" id="closeOverviewBtn">✕ Close [ESC]</button>
    </div>
    <div class="overview-grid" id="overviewGrid"></div>
  </div>

  <!-- Live Markdown Editor Overlay [E] -->
  <div class="slidev-overlay" id="editorOverlay">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
      <strong style="color:var(--accent);font-size:14px;">✏️ LIVE SLIDEV MARKDOWN SOURCE EDITOR (Client Re-Compile &amp; Cache)</strong>
      <div style="display:flex;gap:8px;">
        <button type="button" class="slidev-btn" id="applyMdBtn" style="background:var(--accent);color:#0d0f0c;">⚡ Apply &amp; Re-Cache</button>
        <button type="button" class="slidev-btn" id="closeEditorBtn">✕ Close</button>
      </div>
    </div>
    <textarea id="rawMdTextarea" style="flex:1;width:100%;background:var(--bg-code);color:#e5e7eb;border:1px solid var(--accent);border-radius:6px;padding:12px;font-family:monospace;font-size:12px;line-height:1.5;resize:none;"></textarea>
  </div>

  <!-- Embedded Self-Hosting Raw Markdown Source -->
  <script id="slidev-raw-md" type="text/markdown">
${safeRawMd}
  </script>

  <!-- Pre-Compiled Fallback Payload (0ms First Paint) -->
  <script id="slidev-precompiled-json" type="application/json">
${JSON.stringify({ hash: compiled.hash, deckMeta: compiled.deckMeta, slides: compiled.slides }).replace(/<\/script>/gi, '<\\/script>')}
  </script>

  <script>
    (function() {
      const DECK_ID = ${JSON.stringify(deckId || 'vibe-arcade-deck')};
      const CACHE_PREFIX = 'arcade_slidev_v1_';
      const syncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('${CHANNEL_NAME}') : null;

      const rawMdEl = document.getElementById('slidev-raw-md');
      const precompiledEl = document.getElementById('slidev-precompiled-json');
      let currentRawMd = rawMdEl ? rawMdEl.textContent.trim() : '';
      let deck = JSON.parse(precompiledEl.textContent);
      let currentIdx = 0;

      // Check URL hash (#s=2) or presenter mode (?presenter=1)
      const params = new URLSearchParams(location.search);
      const isPresenterWindow = params.get('presenter') === '1';

      function fnv1a(str) {
        let h = 0x811c9dc5;
        for (let i = 0; i < str.length; i++) {
          h ^= str.charCodeAt(i);
          h = Math.imul(h, 0x01000193);
        }
        return (h >>> 0).toString(16).toUpperCase().padStart(8, '0');
      }

      // First-open / Repeat-open Cache Check
      const hash = fnv1a(currentRawMd);
      const cacheKey = CACHE_PREFIX + DECK_ID + '_' + hash;
      const statusPill = document.getElementById('cacheStatusPill');
      try {
        const saved = localStorage.getItem(cacheKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed.slides)) {
            deck = parsed;
            if (typeof parsed.lastSlide === 'number') currentIdx = parsed.lastSlide;
            if (statusPill) statusPill.textContent = '⚡ CACHE HIT (' + hash.slice(0, 6) + ')';
          }
        } else {
          localStorage.setItem(cacheKey, JSON.stringify({
            hash: deck.hash,
            deckMeta: deck.deckMeta,
            slides: deck.slides,
            lastSlide: 0
          }));
          if (statusPill) statusPill.textContent = '💾 CACHED 1ST OPEN (' + hash.slice(0, 6) + ')';
        }
      } catch (e) {}

      // Hash deep-link override (#s=3)
      const hashMatch = location.hash.match(/#s=(\\d+)/);
      if (hashMatch) {
        const reqIdx = parseInt(hashMatch[1], 10) - 1;
        if (reqIdx >= 0 && reqIdx < deck.slides.length) currentIdx = reqIdx;
      }

      const mountNode = document.getElementById('slideMountNode');
      const counterText = document.getElementById('slideCounterText');
      const progressBar = document.getElementById('progressBar');

      // Virtual 3-Slide DOM Window (Mounts only Prev, Active, Next)
      function renderVirtualWindow() {
        const total = deck.slides.length;
        if (currentIdx < 0) currentIdx = 0;
        if (currentIdx >= total) currentIdx = total - 1;

        const windowIndices = [currentIdx - 1, currentIdx, currentIdx + 1].filter(i => i >= 0 && i < total);
        mountNode.innerHTML = windowIndices.map(i => {
          const s = deck.slides[i];
          const activeClass = i === currentIdx ? 'is-active' : '';
          return \`
            <section class="slidev-slide layout-\${s.layout} \${activeClass}" data-slide-index="\${i}">
              <div class="slidev-slide-badge">SLIDE 0\${i + 1} / 0\${total} • LAYOUT: \${String(s.layout).toUpperCase()}</div>
              \${s.html}
            </section>
          \`;
        }).join('');

        counterText.textContent = (currentIdx + 1) + ' / ' + total;
        progressBar.style.width = (((currentIdx + 1) / total) * 100).toFixed(1) + '%';
        history.replaceState(null, '', '#s=' + (currentIdx + 1));

        try {
          const saved = JSON.parse(localStorage.getItem(cacheKey) || '{}');
          saved.lastSlide = currentIdx;
          localStorage.setItem(cacheKey, JSON.stringify(saved));
        } catch (e) {}

        if (syncChannel) {
          syncChannel.postMessage({ type: 'SLIDE_SYNC', index: currentIdx, title: deck.slides[currentIdx].title, notes: deck.slides[currentIdx].notes });
        }

        // Bind Runnable JS Buttons inside active slide
        mountNode.querySelectorAll('.slidev-run-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const code = decodeURIComponent(btn.getAttribute('data-code') || '');
            const targetId = btn.getAttribute('data-target');
            const outBox = document.getElementById(targetId);
            if (!outBox) return;
            const logs = [];
            const customConsole = {
              log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
              info: (...args) => logs.push(args.join(' ')),
              warn: (...args) => logs.push('[WARN] ' + args.join(' ')),
              error: (...args) => logs.push('[ERR] ' + args.join(' '))
            };
            try {
              const fn = new Function('console', code);
              const ret = fn(customConsole);
              if (ret !== undefined) logs.push('➔ Return: ' + (typeof ret === 'object' ? JSON.stringify(ret) : String(ret)));
              outBox.textContent = logs.length ? logs.join('\\n') : '✓ Executed (no console output)';
            } catch (err) {
              outBox.textContent = '✗ Runtime Error: ' + err.message;
            }
            outBox.style.display = 'block';
          });
        });
      }

      function goToSlide(idx) {
        currentIdx = Math.max(0, Math.min(deck.slides.length - 1, idx));
        renderVirtualWindow();
      }

      document.getElementById('btnPrev').addEventListener('click', () => goToSlide(currentIdx - 1));
      document.getElementById('btnNext').addEventListener('click', () => goToSlide(currentIdx + 1));

      if (syncChannel) {
        syncChannel.addEventListener('message', (e) => {
          if (e.data && e.data.type === 'SLIDE_CMD_GOTO' && typeof e.data.index === 'number') {
            currentIdx = e.data.index;
            renderVirtualWindow();
          }
        });
      }

      // Overview Grid [O]
      const overviewOverlay = document.getElementById('overviewOverlay');
      const overviewGrid = document.getElementById('overviewGrid');
      const slideSearchInput = document.getElementById('slideSearchInput');

      function renderOverview(filterQ) {
        const q = (filterQ || '').toLowerCase().trim();
        overviewGrid.innerHTML = deck.slides
          .filter(s => !q || s.title.toLowerCase().includes(q) || (s.rawText && s.rawText.toLowerCase().includes(q)))
          .map(s => \`
            <div class="overview-card \${s.index === currentIdx ? 'is-current' : ''}" data-goto="\${s.index}">
              <div style="font-size:10px;color:var(--accent);font-weight:700;">SLIDE 0\${s.index + 1} • \${s.layout.toUpperCase()}</div>
              <div style="font-size:13px;font-weight:700;margin:4px 0;color:var(--text-main);">\${s.title}</div>
              <div style="font-size:11px;color:var(--text-muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">\${s.notes}</div>
            </div>
          \`).join('');
        overviewGrid.querySelectorAll('.overview-card').forEach(card => {
          card.addEventListener('click', () => {
            goToSlide(parseInt(card.getAttribute('data-goto'), 10));
            overviewOverlay.classList.remove('is-open');
          });
        });
      }

      function toggleOverview() {
        const open = overviewOverlay.classList.toggle('is-open');
        if (open) {
          renderOverview(slideSearchInput.value);
          slideSearchInput.focus();
        }
      }

      document.getElementById('btnOverview').addEventListener('click', toggleOverview);
      document.getElementById('closeOverviewBtn').addEventListener('click', () => overviewOverlay.classList.remove('is-open'));
      slideSearchInput.addEventListener('input', () => renderOverview(slideSearchInput.value));

      // Live Editor [E]
      const editorOverlay = document.getElementById('editorOverlay');
      const rawMdTextarea = document.getElementById('rawMdTextarea');
      document.getElementById('btnEditMd').addEventListener('click', () => {
        rawMdTextarea.value = currentRawMd;
        editorOverlay.classList.add('is-open');
      });
      document.getElementById('closeEditorBtn').addEventListener('click', () => editorOverlay.classList.remove('is-open'));
      document.getElementById('applyMdBtn').addEventListener('click', () => {
        currentRawMd = rawMdTextarea.value.trim();
        if (rawMdEl) rawMdEl.textContent = currentRawMd;
        if (window.ArcadeSlidev && window.ArcadeSlidev.getCompiledDeck) {
          deck = window.ArcadeSlidev.getCompiledDeck(DECK_ID, currentRawMd);
        } else {
          // Simple fallback re-split by ---
          const parts = currentRawMd.split(/\\r?\\n---\\r?\\n/);
          deck.slides = parts.map((p, i) => ({
            index: i,
            title: (p.match(/^#+\\s+(.+)$/m) || [null, 'Slide ' + (i + 1)])[1],
            layout: i === 0 ? 'cover' : 'default',
            notes: 'Updated live in browser.',
            html: '<div class="slidev-single-col"><pre class="slidev-wireframe-box">' + p.replace(/</g, '&lt;') + '</pre></div>'
          }));
        }
        if (statusPill) statusPill.textContent = '⚡ LIVE RE-CACHED (' + fnv1a(currentRawMd).slice(0, 6) + ')';
        editorOverlay.classList.remove('is-open');
        goToSlide(0);
      });

      // Laser [L] & Ink Draw [D]
      const laserDot = document.getElementById('slidevLaserDot');
      const inkCanvas = document.getElementById('slidevInkCanvas');
      const ctx = inkCanvas.getContext('2d');
      let laserOn = false;
      let drawOn = false;
      let painting = false;

      function resizeCanvas() {
        inkCanvas.width = inkCanvas.parentElement.clientWidth;
        inkCanvas.height = inkCanvas.parentElement.clientHeight;
      }
      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();

      document.getElementById('btnLaser').addEventListener('click', (e) => {
        laserOn = !laserOn;
        e.currentTarget.classList.toggle('is-active', laserOn);
        laserDot.style.display = laserOn ? 'block' : 'none';
      });

      document.getElementById('btnDraw').addEventListener('click', (e) => {
        drawOn = !drawOn;
        e.currentTarget.classList.toggle('is-active', drawOn);
        inkCanvas.style.pointerEvents = drawOn ? 'auto' : 'none';
        inkCanvas.style.cursor = drawOn ? 'crosshair' : 'default';
      });

      window.addEventListener('pointermove', (e) => {
        if (laserOn) {
          laserDot.style.left = e.clientX + 'px';
          laserDot.style.top = e.clientY + 'px';
        }
      });

      inkCanvas.addEventListener('pointerdown', (e) => {
        if (!drawOn) return;
        painting = true;
        const r = inkCanvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - r.left, e.clientY - r.top);
      });
      inkCanvas.addEventListener('pointermove', (e) => {
        if (!drawOn || !painting) return;
        const r = inkCanvas.getBoundingClientRect();
        ctx.strokeStyle = '#b0a84a';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineTo(e.clientX - r.left, e.clientY - r.top);
        ctx.stroke();
      });
      window.addEventListener('pointerup', () => { painting = false; });

      // Dual-Window Presenter Mode [P] via BroadcastChannel
      document.getElementById('btnPresenter').addEventListener('click', () => {
        const win = window.open(location.pathname + '?presenter=1#s=' + (currentIdx + 1), 'ArcadeSlidevPresenter', 'width=520,height=420');
        if (!win) alert('Allow popups to open Dual-Screen Presenter View.');
      });

      if (isPresenterWindow) {
        document.body.innerHTML = \`
          <div style="padding:18px;font-family:monospace;background:#141712;color:#f3f4ef;height:100vh;display:flex;flex-direction:column;gap:12px;">
            <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #333b2e;padding-bottom:8px;">
              <strong style="color:#b0a84a;">🎙️ PRESENTER CONSOLE (BroadcastChannel Sync)</strong>
              <span id="presTimer" style="color:#4ade80;font-weight:700;">00:00</span>
            </div>
            <div id="presSlideTitle" style="font-size:16px;font-weight:700;">Slide 1</div>
            <div style="flex:1;background:#1d211a;border:1px solid #333b2e;border-radius:6px;padding:12px;overflow-y:auto;">
              <div style="font-size:10px;color:#b0a84a;margin-bottom:6px;">SPEAKER NOTES:</div>
              <div id="presNotes" style="font-size:13px;line-height:1.55;white-space:pre-wrap;"></div>
            </div>
            <div style="display:flex;gap:8px;">
              <button class="slidev-btn" id="presPrev" style="flex:1;padding:10px;">◀ Prev Slide</button>
              <button class="slidev-btn" id="presNext" style="flex:1;padding:10px;background:#b0a84a;color:#0d0f0c;">Next Slide ▶</button>
            </div>
          </div>
        \`;
        let sec = 0;
        setInterval(() => {
          sec++;
          const m = String(Math.floor(sec / 60)).padStart(2, '0');
          const s = String(sec % 60).padStart(2, '0');
          const tEl = document.getElementById('presTimer');
          if (tEl) tEl.textContent = m + ':' + s;
        }, 1000);
        function updatePresUI() {
          const s = deck.slides[currentIdx] || deck.slides[0];
          document.getElementById('presSlideTitle').textContent = 'Slide ' + (currentIdx + 1) + ' / ' + deck.slides.length + ': ' + s.title;
          document.getElementById('presNotes').textContent = s.notes;
        }
        updatePresUI();
        document.getElementById('presPrev').addEventListener('click', () => {
          currentIdx = Math.max(0, currentIdx - 1);
          updatePresUI();
          if (syncChannel) syncChannel.postMessage({ type: 'SLIDE_CMD_GOTO', index: currentIdx });
        });
        document.getElementById('presNext').addEventListener('click', () => {
          currentIdx = Math.min(deck.slides.length - 1, currentIdx + 1);
          updatePresUI();
          if (syncChannel) syncChannel.postMessage({ type: 'SLIDE_CMD_GOTO', index: currentIdx });
        });
        if (syncChannel) {
          syncChannel.addEventListener('message', (e) => {
            if (e.data && e.data.type === 'SLIDE_SYNC') {
              currentIdx = e.data.index;
              updatePresUI();
            }
          });
        }
        return;
      }

      // Theme Toggle
      document.getElementById('btnTheme').addEventListener('click', () => {
        document.documentElement.classList.toggle('theme-light');
        document.documentElement.classList.toggle('theme-dark');
      });

      // Download Standalone .html & Raw .md
      function triggerBlobDownload(content, filename, mime) {
        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }

      document.getElementById('btnDownloadHtml').addEventListener('click', () => {
        triggerBlobDownload('<!DOCTYPE html>\\n' + document.documentElement.outerHTML, DECK_ID + '_standalone_slidev.html', 'text/html;charset=utf-8');
      });
      document.getElementById('btnDownloadMd').addEventListener('click', () => {
        triggerBlobDownload(currentRawMd, DECK_ID + '.md', 'text/markdown;charset=utf-8');
      });

      // Keyboard Shortcuts
      window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
          if (e.key === 'Escape') {
            overviewOverlay.classList.remove('is-open');
            editorOverlay.classList.remove('is-open');
          }
          return;
        }
        if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goToSlide(currentIdx + 1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); goToSlide(currentIdx - 1); }
        else if (e.key === 'o' || e.key === 'O' || e.key === '/') { e.preventDefault(); toggleOverview(); }
        else if (e.key === 'e' || e.key === 'E') { e.preventDefault(); document.getElementById('btnEditMd').click(); }
        else if (e.key === 'l' || e.key === 'L') { e.preventDefault(); document.getElementById('btnLaser').click(); }
        else if (e.key === 'd' || e.key === 'D') { e.preventDefault(); document.getElementById('btnDraw').click(); }
        else if (e.key === 'c' || e.key === 'C') { ctx.clearRect(0, 0, inkCanvas.width, inkCanvas.height); }
        else if (e.key === 'p' || e.key === 'P') { e.preventDefault(); document.getElementById('btnPresenter').click(); }
        else if (e.key === 'Escape') {
          overviewOverlay.classList.remove('is-open');
          editorOverlay.classList.remove('is-open');
        }
      });

      renderVirtualWindow();
    })();
  </script>
</body>
</html>`;
  }

  return {
    fnv1aHash: fnv1aHash,
    parseSlidevDeck: parseSlidevDeck,
    getCompiledDeck: getCompiledDeck,
    synthesizeStandaloneSlidevHtml: synthesizeStandaloneSlidevHtml
  };
});
