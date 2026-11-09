/**
 * ============================================================================
 * UNIFIED BUILD ENGINE: src/modules/build-bundle.js
 * ============================================================================
 * Standalone Core Pipeline (Zero all-lads-tool dependency).
 * Compiles all bundles, cartridges, stylesheets, and HTML shells to public/.
 * Computes 4 Core Build Size Metrics & generates build-report-table.csv.
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const buildStartTime = Date.now();

// 1. DYNAMIC CONFIGURATION & PATH RESOLUTION (Rule #3: Zero Hardcoded Variables)
const modulesDir = __dirname;
const srcDir = path.resolve(modulesDir, '..');
const repoRoot = path.resolve(srcDir, '..');

// Check CLI flags: node build-bundle.js --apps=<dir> or --apps <dir>
const cliArgs = process.argv.slice(2);
let cliAppsDir = null;
for (let i = 0; i < cliArgs.length; i++) {
  if (cliArgs[i] === '--apps' && cliArgs[i + 1]) {
    cliAppsDir = cliArgs[i + 1];
    i++;
  } else if (cliArgs[i].startsWith('--apps=')) {
    cliAppsDir = cliArgs[i].split('=')[1];
  }
}

const buildConfigYamlPath = [
  path.join(repoRoot, 'build', 'build-config.yaml'),
  path.join(repoRoot, 'build-config.yaml')
].find(p => fs.existsSync(p)) || path.join(repoRoot, 'build-config.yaml');

const buildConfigExamplePath = [
  path.join(repoRoot, 'build', 'build-config.yamlexample'),
  path.join(repoRoot, 'build-config.yamlexample')
].find(p => fs.existsSync(p)) || path.join(repoRoot, 'build-config.yamlexample');

function loadBuildConfig() {
  const targetPath = fs.existsSync(buildConfigYamlPath)
    ? buildConfigYamlPath
    : (fs.existsSync(buildConfigExamplePath) ? buildConfigExamplePath : null);

  const defaults = {
    project: { name: 'retro-template-catalog-website', title: 'Retro Template Catalog Website', version: '1.1' },
    urls: {
      base: 'https://pakcli.github.io/retro-template-catalog-website',
      github: 'https://github.com/pakcli/retro-template-catalog-website',
      author_github: 'https://github.com/pakcli'
    },
    paths: { apps: 'apps', source: 'src', output: 'public' },
    features: {
      theme_accent_default: 'olive',
      theme_mode_default: 'theme-dark',
      bento_split_default: '60/40',
      enable_tts: true,
      enable_slidev: true
    }
  };

  if (!targetPath) return defaults;

  try {
    const raw = fs.readFileSync(targetPath, 'utf8');
    let currentSection = null;
    raw.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      if (line.match(/^([a-zA-Z0-9_-]+):$/)) {
        currentSection = RegExp.$1;
        if (!defaults[currentSection]) defaults[currentSection] = {};
        return;
      }
      if (trimmed.includes(':')) {
        const idx = trimmed.indexOf(':');
        const k = trimmed.substring(0, idx).trim();
        let v = trimmed.substring(idx + 1).trim();
        v = v.replace(/\s+#.*$/, '').replace(/^["']|["']$/g, '');
        if (v === 'true') v = true;
        else if (v === 'false') v = false;
        
        if (currentSection && defaults[currentSection]) {
          defaults[currentSection][k] = v;
        } else {
          defaults[k] = v;
        }
      }
    });
  } catch (err) {
    console.warn('[WARN] Could not parse build-config.yaml:', err.message);
  }
  return defaults;
}

const buildConfigData = loadBuildConfig();

const targetAppsSource = fs.existsSync(path.join(repoRoot, 'data/apps')) ? 'data/apps' : (cliAppsDir || process.env.ARCADE_APPS_DIR || buildConfigData.paths.apps || 'apps');
const appsDir = path.isAbsolute(targetAppsSource) ? targetAppsSource : path.resolve(repoRoot, targetAppsSource);
const publicDir = path.resolve(repoRoot, buildConfigData.paths.output || 'public');
const publicAppsDir = path.join(publicDir, 'apps');
const styleDir = path.join(srcDir, 'style');
const buildJsonPath = [
  path.join(repoRoot, 'build', 'build.json'),
  path.join(repoRoot, 'build.json')
].find(p => fs.existsSync(p)) || path.join(repoRoot, 'build.json');

console.log('===============================================================================================================');
console.log('  VINTAGE COMPUTING ARCADE -- UNIFIED STANDALONE BUILD & COMPACTION PIPELINE');
console.log('===============================================================================================================');
console.log(`Repo Root  : ${repoRoot}`);
console.log(`Root Apps  : ${appsDir}`);
console.log(`Src Dir    : ${srcDir}`);
console.log(`Public Dir : ${publicDir}\n`);

// Ensure output directories exist
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
if (!fs.existsSync(publicAppsDir)) fs.mkdirSync(publicAppsDir, { recursive: true });

// Audit list tracking for table & CSV generation
const auditList = [];

function recordAuditEntry(fileName, srcDisplay, beforeBytes, afterBytes, isMerged = false, customReduction = null) {
  const beforeKb = parseFloat((beforeBytes / 1024).toFixed(2));
  const afterKb = parseFloat((afterBytes / 1024).toFixed(2));
  const savedBytes = beforeBytes - afterBytes;
  const pct = beforeBytes > 0 ? ((savedBytes / beforeBytes) * 100).toFixed(1) : '0.0';

  auditList.push({
    fileName,
    srcDisplay,
    beforeKb,
    afterKb,
    savedKb: parseFloat((savedBytes / 1024).toFixed(2)),
    reductionPct: customReduction || `-${pct}%`,
    isMerged
  });
}

// -----------------------------------------------------------------------------
// COMPACTION ENGINES (Zero-dependency JavaScript, CSS, and HTML minifiers)
// -----------------------------------------------------------------------------
function compactJs(rawJs) {
  // Safe JS preservation: prevents breaking regex literals and codeblocks
  return rawJs.trim();
}

function compactCss(rawCss) {
  return rawCss
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s*([{};:,])\s*/g, '$1')
    .replace(/;\}/g, '}')
    .replace(/\s+/g, ' ')
    .trim();
}

function compactHtml(rawHtml) {
  return rawHtml
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^[ \t]+/gm, '')
    .replace(/[ \t]+$/gm, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/(\r?\n){2,}/g, '\n')
    .trim();
}

// Sector badge metadata lookup
const SECTOR_META = {
  edu: { label: 'Edu', badge: 'MATH & CANVAS' },
  fnb: { label: 'FnB', badge: 'WEB & WHATSAPP' },
  tools: { label: 'Tools', badge: 'TOOLS & UTILITY' },
  games: { label: 'Games', badge: 'RETRO & AUDIO' },
  electron: { label: 'Electron', badge: 'STANDALONE' },
  systems: { label: 'Systems', badge: 'SYSTEM' }
};

// -----------------------------------------------------------------------------
// HELPER: Parse Simple YAML Frontmatter (Strictly NO `id:`)
// -----------------------------------------------------------------------------
function parseYamlFrontmatter(content, slug) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  const data = {};

  if (match) {
    const rawYaml = match[1];
    rawYaml.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx === -1) return;

      const key = trimmed.slice(0, colonIdx).trim();
      if (key === 'id') return; // ENFORCE ZERO `id` RULE

      let val = trimmed.slice(colonIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }

      if (val.startsWith('[') && val.endsWith(']') && !val.startsWith('[[')) {
        const inner = val.slice(1, -1).trim();
        data[key] = inner ? inner.split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')) : [];
      } else {
        data[key] = val;
      }
    });
  }

  const sector = data.sector || 'tools';
  const meta = SECTOR_META[sector] || { label: sector.toUpperCase(), badge: sector.toUpperCase() };

  // Parse Obsidian wikilinks: [[name_lightmode.webp]], [[name_darkmode.webp]]
  let wikilinkImages = [];
  if (data.img) {
    const rawImg = String(data.img);
    const matches = Array.from(rawImg.matchAll(/\[\[(.*?)\]\]/g), m => m[1].trim());
    if (matches.length > 0) {
      wikilinkImages = matches;
    }
  }

  const defaultWebp = `${slug}.webp`;
  const imgLight = wikilinkImages.find(f => f.includes('light')) || `${slug}_img-lightmode.webp`;
  const imgDark = wikilinkImages.find(f => f.includes('dark')) || `${slug}_img-darkmode.webp`;

  let runtimeImg = `apps/${defaultWebp}`;
  if (wikilinkImages.length > 0) {
    runtimeImg = `apps/${wikilinkImages[0]}`;
  } else if (data.img && typeof data.img === 'string' && data.img.trim()) {
    runtimeImg = data.img.replace(/\[\[|\]\]/g, '').trim();
    if (!runtimeImg.startsWith('apps/') && !runtimeImg.startsWith('http')) {
      runtimeImg = `apps/${runtimeImg}`;
    }
  }

  return {
    slug: slug,
    id: slug,
    title: (data.title || (slug.charAt(0).toUpperCase() + slug.slice(1))).replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, '').trim(),
    sector: sector,
    category: data.category || meta.badge,
    scope: Array.isArray(data.scope) ? data.scope : [sector],
    fileSize: data['file-size'] || data.fileSize || '12.4 KB',
    tags: Array.isArray(data.tags) ? data.tags : ['Zero-Backend', 'Vanilla'],
    overview: data.overview || 'Tactile zero-backend computing cartridge.',
    badge: data.badge || meta.badge,
    img: runtimeImg,
    thumbnail: runtimeImg,
    imgLight: `apps/${imgLight}`,
    imgDark: `apps/${imgDark}`,
    obsidianImgProperty: data.img || `[[${imgLight}]], [[${imgDark}]]`,
    linkLive: `apps/${slug}.html`,
    linkSubpage: `page-playground.html?app=${slug}`,
    linkPlayground: `apps/${slug}_playground.html`,
    linkGithub: data['link-github'] || buildConfigData.urls.github || 'https://github.com/pakcli/fadhlisl-my-id'
  };
}

// -----------------------------------------------------------------------------
// STEP 1: COMPILE ROOT apps/ -> public/apps/
// -----------------------------------------------------------------------------
console.log('[1/5] Processing root apps/ -> public/apps/ ...');

const srcPlaygroundTemplatePath = path.join(srcDir, 'page-playground.html');
const srcPlaygroundTemplate = fs.existsSync(srcPlaygroundTemplatePath)
  ? fs.readFileSync(srcPlaygroundTemplatePath, 'utf8')
  : '';

function generateBentoPlaygroundHtml(templateHtml, appMeta, slug, isSubfolder = false) {
  let html = templateHtml;
  html = html.replace(/<script>\(function\s*\(\)\s*\{\s*if\s*\(location\.protocol[\s\S]*?<\/script>/, '');
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${appMeta.title} -- Bento Playground | Fadhli S Lubis</title>`);

  const relRoot = isSubfolder ? '../../' : '../';

  html = html.replace(/<link rel="stylesheet" href="style\/theme\/vintage-computer\/theme\.css">/g, `<link rel="stylesheet" href="${relRoot}theme.css">`);
  html = html.replace(/<link rel="stylesheet" href="theme\/theme\.css">/g, `<link rel="stylesheet" href="${relRoot}theme.css">`);
  html = html.replace(/<link rel="stylesheet" href="theme\.css">/g, `<link rel="stylesheet" href="${relRoot}theme.css">`);
  html = html.replace(/<link rel="stylesheet" href="style\.css">/g, `<link rel="stylesheet" href="${relRoot}style.css">`);
  html = html.replace(/<link rel="stylesheet" href="terminal\.css">/g, `<link rel="stylesheet" href="${relRoot}terminal.css">`);
  html = html.replace(/<link rel="stylesheet" href="winget\.css">/g, `<link rel="stylesheet" href="${relRoot}winget.css">`);

  html = html.replace(/<link rel="stylesheet" href="style\/winget\.css">\s*/g, '');
  html = html.replace(/<link rel="stylesheet" href="style\/flopydisk-cornercut\.css">\s*/g, '');
  html = html.replace(/<link rel="stylesheet" href="theme\/winget\.css">\s*/g, '');
  html = html.replace(/<link rel="stylesheet" href="theme\/flopydisk-cornercut\.css">\s*/g, '');
  html = html.replace(/<link rel="stylesheet" href="theme\/terminal\.css">\s*/g, '');

  html = html.replace(/href="page-apps\.html"/g, `href="${relRoot}page-apps.html"`);
  html = html.replace(/href="library\.html"/g, `href="${relRoot}page-apps.html"`);
  html = html.replace(/href="apps\.html"/g, `href="${relRoot}page-apps.html"`);

  const iframeSrc = isSubfolder ? 'index.html' : `${slug}.html`;
  html = html.replace(/src="apps\/[^"]+\.html"/g, `src="${iframeSrc}"`);
  html = html.replace(/href="apps\/[^"]+\.html"/g, `href="${iframeSrc}"`);
  html = html.replace(/download="[^"]*"/g, `download="${slug}.html"`);
  if (appMeta.linkGithub) {
    html = html.replace(/href="https:\/\/github\.com\/[^"]*"/g, `href="${appMeta.linkGithub}"`);
  }

  html = html.replace(/<body([^>]*)>/, `<body$1 data-app-slug="${slug}">`);
  const injection = `
  <!-- Client-Side Rendering (CSR) Playground Context -->
  <script>
    window.__ARCADE_CURRENT_SLUG__ = "${slug}";
    window.__ARCADE_APP_META__ = ${JSON.stringify(appMeta)};
  </script>`;
  html = html.replace('</head>', `${injection}\n</head>`);
  html = html.replace(/<!-- Modular Vintage Architecture Scripts -->[\s\S]*?<\/body>/, `  <script src="${relRoot}page-playground.js"></script>\n</body>`);
  html = html.replace(/<!-- Modular Scripts -->[\s\S]*?<\/body>/, `  <script src="${relRoot}page-playground.js"></script>\n</body>`);

  return html;
}

if (!fs.existsSync(appsDir)) fs.mkdirSync(appsDir, { recursive: true });

const appEntries = fs.readdirSync(appsDir);
const masterCatalog = [];

appEntries.forEach(entry => {
  const fullPath = path.join(appsDir, entry);
  const stat = fs.statSync(fullPath);

  let slug = '';
  let mdPath = '';
  let htmlPath = '';
  let isSubfolder = false;
  let targetPublicDir = publicAppsDir;

  if (stat.isDirectory()) {
    slug = entry;
    isSubfolder = true;
    targetPublicDir = path.join(publicAppsDir, slug);
    if (!fs.existsSync(targetPublicDir)) fs.mkdirSync(targetPublicDir, { recursive: true });

    if (fs.existsSync(path.join(fullPath, 'index.md'))) {
      mdPath = path.join(fullPath, 'index.md');
    } else if (fs.existsSync(path.join(fullPath, `${slug}.md`))) {
      mdPath = path.join(fullPath, `${slug}.md`);
    } else {
      return;
    }

    if (fs.existsSync(path.join(fullPath, 'index.html'))) {
      htmlPath = path.join(fullPath, 'index.html');
    } else if (fs.existsSync(path.join(fullPath, `${slug}.html`))) {
      htmlPath = path.join(fullPath, `${slug}.html`);
    }
  } else if (entry.endsWith('.md')) {
    slug = entry.replace(/\.md$/, '');
    mdPath = fullPath;
    htmlPath = path.join(appsDir, `${slug}.html`);
    isSubfolder = false;
  } else {
    return;
  }

  let mdContent = fs.readFileSync(mdPath, 'utf8');
  if (/^id:\s*.*$\r?\n/m.test(mdContent)) {
    mdContent = mdContent.replace(/^id:\s*.*$\r?\n/m, '');
    fs.writeFileSync(mdPath, mdContent, 'utf8');
  }

  const appMeta = parseYamlFrontmatter(mdContent, slug);
  if (isSubfolder) {
    appMeta.linkLive = `apps/${slug}/index.html`;
    appMeta.linkPlayground = `apps/${slug}/index_playground.html`;
    appMeta.img = `apps/${slug}/img.webp`;
    appMeta.thumbnail = `apps/${slug}/img.webp`;
    appMeta.imgLight = `apps/${slug}/img-lightmode.webp`;
    appMeta.imgDark = `apps/${slug}/img-darkmode.webp`;
  }
  masterCatalog.push(appMeta);

  // Source-Only Markdown Standard: .md files are authoring sources only (zero .md in public/)
  const staleMdPath = path.join(targetPublicDir, isSubfolder ? 'index.md' : `${slug}.md`);
  if (fs.existsSync(staleMdPath)) {
    try { fs.unlinkSync(staleMdPath); } catch (e) {}
  }
  const relMdFileName = isSubfolder ? 'index.md' : `${slug}.md`;
  const relAuditMdPath = isSubfolder ? `apps/${slug}/${relMdFileName}` : `apps/${relMdFileName}`;
  const srcMdBytes = Buffer.byteLength(mdContent, 'utf8');
  recordAuditEntry(relAuditMdPath, `${(srcMdBytes / 1024).toFixed(2)} KB (source md)`, srcMdBytes, 0, false, 'source-only');

  // Write catalog.json
  const catJsonStr = JSON.stringify(appMeta, null, 2);
  const catOutFileName = isSubfolder ? 'index_catalog.json' : `${slug}_catalog.json`;
  const catOutPath = path.join(targetPublicDir, catOutFileName);
  fs.writeFileSync(catOutPath, catJsonStr, 'utf8');
  const catBytes = Buffer.byteLength(catJsonStr);
  recordAuditEntry(`apps/${slug}/${catOutFileName}`, `${(catBytes / 1024).toFixed(2)} KB (csr)`, catBytes, catBytes, false);

  // Standalone app html
  if (htmlPath && fs.existsSync(htmlPath)) {
    const rawHtml = fs.readFileSync(htmlPath, 'utf8');
    const htmlOutFileName = isSubfolder ? 'index.html' : `${slug}.html`;
    const pubHtmlPath = path.join(targetPublicDir, htmlOutFileName);
    fs.writeFileSync(pubHtmlPath, rawHtml, 'utf8');
    const rawBytes = Buffer.byteLength(rawHtml);
    recordAuditEntry(`apps/${slug}/${htmlOutFileName}`, `${(rawBytes / 1024).toFixed(2)} KB`, rawBytes, rawBytes, false);
  }

  // Thumbnails
  const thumbSuffixes = isSubfolder
    ? ['img.webp', 'img-darkmode.webp', 'img-lightmode.webp']
    : [`${slug}.webp`, `${slug}_img-darkmode.webp`, `${slug}_img-lightmode.webp`];

  thumbSuffixes.forEach(thumbName => {
    const srcThumb = path.join(stat.isDirectory() ? fullPath : appsDir, thumbName);
    if (fs.existsSync(srcThumb)) {
      const destThumb = path.join(targetPublicDir, thumbName);
      fs.copyFileSync(srcThumb, destThumb);
      const b = fs.statSync(destThumb).size;
      recordAuditEntry(`apps/${slug}/${thumbName}`, `${(b / 1024).toFixed(2)} KB`, b, b, false);
    }
  });

  // CSR Bento Playground
  if (srcPlaygroundTemplate) {
    const rawBento = generateBentoPlaygroundHtml(srcPlaygroundTemplate, appMeta, slug, isSubfolder);
    const compactedBento = compactHtml(rawBento);
    const bentoOutFileName = isSubfolder ? 'index_playground.html' : `${slug}_playground.html`;
    const bentoOutPath = path.join(targetPublicDir, bentoOutFileName);
    fs.writeFileSync(bentoOutPath, compactedBento, 'utf8');
    recordAuditEntry(
      `apps/${slug}/${bentoOutFileName}`,
      `${(Buffer.byteLength(rawBento) / 1024).toFixed(2)} KB (csr)`,
      Buffer.byteLength(rawBento),
      Buffer.byteLength(compactedBento),
      false
    );
  }

  console.log(`  -> Processed cartridge: ${slug} (${appMeta.category})`);
});

// Master _catalog.json
const masterCatStr = JSON.stringify(masterCatalog, null, 2);
fs.writeFileSync(path.join(publicAppsDir, '_catalog.json'), masterCatStr, 'utf8');
fs.writeFileSync(path.join(appsDir, '_catalog.json'), masterCatStr, 'utf8');
const catTotalBytes = Buffer.byteLength(masterCatStr);
recordAuditEntry('apps/_catalog.json', `${(catTotalBytes / 1024).toFixed(2)} KB (catalog)`, catTotalBytes, catTotalBytes, true);
console.log(`  ★ Generated public/apps/_catalog.json and synced apps/_catalog.json (${masterCatalog.length} apps compiled)\n`);

// -----------------------------------------------------------------------------
// STEP 2: COMPILE 3 JS BUNDLES FROM src/modules/
// -----------------------------------------------------------------------------
console.log('[2/5] Compiling Client main.js Bundle (Clean Architecture)...');

// Read modular source modules
const routerJs = fs.readFileSync(path.join(modulesDir, 'router.js'), 'utf8');
const searchEngineJs = fs.readFileSync(path.join(modulesDir, 'searchEngine.js'), 'utf8');
const preferencesStoreJs = fs.readFileSync(path.join(modulesDir, 'preferencesStore.js'), 'utf8');
const telemetryCalculatorJs = fs.readFileSync(path.join(modulesDir, 'telemetryCalculator.js'), 'utf8');
const standaloneCompilerJs = fs.readFileSync(path.join(modulesDir, 'standaloneCompiler.js'), 'utf8');
const keyboardShortcutsJs = fs.readFileSync(path.join(modulesDir, 'keyboardShortcuts.js'), 'utf8');
const clipboardToastJs = fs.readFileSync(path.join(modulesDir, 'clipboardToast.js'), 'utf8');
const drawerControllerJs = fs.readFileSync(path.join(modulesDir, 'drawerController.js'), 'utf8');

// Aggregate Omni-Catalog across all 4 subsystems
const omniCatalogEntries = [];
['apps', 'skills', 'combos', 'scripts'].forEach(subDir => {
  const catPath = path.join(repoRoot, 'data', subDir, '_catalog.json');
  if (fs.existsSync(catPath)) {
    try {
      const items = JSON.parse(fs.readFileSync(catPath, 'utf8'));
      const emojiStripRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu;
      items.forEach(it => {
        const cleanTitle = (it.title || it.slug).replace(emojiStripRegex, '').trim();
        omniCatalogEntries.push({
          id: it.slug || it.id,
          title: cleanTitle,
          displayTitle: cleanTitle,
          subsystem: subDir,
          subsystemIcon: '',
          category: it.category || subDir.toUpperCase(),
          size: it.fileSize || '3.5 KB',
          tags: it.tags || [],
          overview: (it.overview || '').replace(emojiStripRegex, '').trim(),
          url: it.linkLive || (subDir + '/')
        });
      });
    } catch (_) {}
  }
});

const clientMainJs = `// =============================================================================
// MAIN CATALOG CONTROLLER (Master Clean Architecture Client Engine)
// =============================================================================
(function () {
  'use strict';

  const STORAGE_KEY_PINNED = 'arcade_pinned_disks';

  // 2. Clock in WIB
  function updateWibClock() {
    const el = document.getElementById('heroWibClockVal');
    if (!el) return;
    try {
      const now = new Date();
      const options = { timeZone: 'Asia/Jakarta', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
      el.textContent = now.toLocaleTimeString('en-GB', options) + ' WIB';
    } catch (_) {}
  }
  updateWibClock();
  setInterval(updateWibClock, 1000);

  // 3. Category & Pin Filter State
  let activeScope = 'all';
  let pinOnly = false;
  let activeQuery = '';

  function getPinnedList() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_PINNED) || '[]');
    } catch (_) {
      return [];
    }
  }

  function setPinnedList(list) {
    localStorage.setItem(STORAGE_KEY_PINNED, JSON.stringify(list));
  }

  function updateCards() {
    const cards = document.querySelectorAll('.app-cards-grid article.floppy-card, .bases-cards-item');
    const pinned = getPinnedList();
    let visibleCount = 0;
    const totalCount = cards.length;

    cards.forEach(card => {
      const app = card.getAttribute('data-app') || card.getAttribute('data-app-slug') || '';
      const scope = (card.getAttribute('data-scope') || card.getAttribute('data-category') || '').toLowerCase();
      const name = (card.getAttribute('data-name') || card.querySelector('.floppy-title, .card-title')?.textContent || '').toLowerCase();
      const isPinned = pinned.includes(app);

      // Pin button visual state
      const pinBtn = card.querySelector('.floppy-pin-btn, .pin-btn');
      if (pinBtn) {
        pinBtn.classList.toggle('is-pinned', isPinned);
        const icon = pinBtn.querySelector('.pin-icon');
        if (icon) icon.textContent = isPinned ? '★' : '📌';
      }

      // Filter logic
      const matchesScope = (activeScope === 'all') || scope.includes(activeScope);
      const matchesPin = !pinOnly || isPinned;
      const matchesQuery = !activeQuery || name.includes(activeQuery) || app.includes(activeQuery) || scope.includes(activeQuery);

      if (matchesScope && matchesPin && matchesQuery) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    const badge = document.getElementById('diskCounterBadge');
    if (badge) {
      badge.textContent = '💾 ' + visibleCount + '/' + totalCount;
    }
    const heroLoaded = document.getElementById('heroAppsLoadedVal');
    if (heroLoaded && document.body.getAttribute('data-page') !== 'home') {
      heroLoaded.textContent = totalCount + ' Disks';
    }
  }

  // 4. Tab Listeners
  document.querySelectorAll('.workspace-tab-header').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.workspace-tab-header').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      activeScope = (btn.getAttribute('data-scope') || 'all').toLowerCase();
      updateCards();
    });
  });

  // 5. Pin Only Toggle
  const pinToggleBtn = document.getElementById('pinOnlyToggleBtn');
  if (pinToggleBtn) {
    pinToggleBtn.addEventListener('click', () => {
      pinOnly = !pinOnly;
      pinToggleBtn.classList.toggle('is-active', pinOnly);
      updateCards();
    });
  }

  // 6. Card Pin Action
  document.addEventListener('click', (e) => {
    const pinBtn = e.target.closest('.floppy-pin-btn, .pin-btn');
    if (!pinBtn) return;
    const target = pinBtn.getAttribute('data-pin-target');
    if (!target) return;
    e.preventDefault();
    e.stopPropagation();

    let pinned = getPinnedList();
    if (pinned.includes(target)) {
      pinned = pinned.filter(x => x !== target);
    } else {
      pinned.push(target);
    }
    setPinnedList(pinned);
    updateCards();
  });

  // 7. View Mode Switcher (Simple Card | Detail Card | List Table)
  const STORAGE_KEY_VIEW_MODE = 'arcade_catalog_view_mode';
  const btnViewSimple = document.getElementById('btnViewSimple') || document.getElementById('gridViewBtn');
  const btnViewDetail = document.getElementById('btnViewDetail') || document.getElementById('detailViewBtn');
  const btnViewTable = document.getElementById('btnViewTable');
  const appsGrid = document.getElementById('appsGrid');

  function applyViewMode(mode) {
    if (!appsGrid) return;
    appsGrid.classList.remove('view-simple', 'view-detail', 'view-table', 'mobile-view-grid', 'mobile-view-detail');
    
    if (btnViewSimple) btnViewSimple.classList.toggle('is-active', mode === 'simple');
    if (btnViewDetail) btnViewDetail.classList.toggle('is-active', mode === 'detail');
    if (btnViewTable) btnViewTable.classList.toggle('is-active', mode === 'table');

    if (mode === 'detail') {
      appsGrid.classList.add('view-detail', 'mobile-view-detail');
    } else if (mode === 'table') {
      appsGrid.classList.add('view-table');
    } else {
      appsGrid.classList.add('view-simple', 'mobile-view-grid');
    }

    try {
      localStorage.setItem(STORAGE_KEY_VIEW_MODE, mode);
    } catch (_) {}
  }

  if (appsGrid) {
    const savedMode = localStorage.getItem(STORAGE_KEY_VIEW_MODE) || 'simple';
    applyViewMode(savedMode);

    if (btnViewSimple) btnViewSimple.addEventListener('click', () => applyViewMode('simple'));
    if (btnViewDetail) btnViewDetail.addEventListener('click', () => applyViewMode('detail'));
    if (btnViewTable) btnViewTable.addEventListener('click', () => applyViewMode('table'));
  }

  // 8. INTERACTIVE CLI PROMPT & OMNI-SUGGESTIONS ENGINE
  const searchInput = document.getElementById('topSearchInput');
  const typedText = document.getElementById('terminalTypedText');
  const suggestionBox = document.getElementById('suggestionBox');
  const promptFolder = document.getElementById('promptFolderSegment');
  const promptCaret = document.getElementById('promptTerminalCaret');

  const omniData = (typeof window !== 'undefined' && window.__ARCADE_OMNI_CATALOG__) || [];

  const isHome = document.body && document.body.getAttribute('data-page') === 'home';
  const currentSubsystem = isHome ? 'home' : (promptFolder ? (promptFolder.textContent || '').trim().toLowerCase() : 'apps');
  const relPrefix = isHome ? '' : '../';

  const NAV_DESTINATIONS = [
    { key: 'apps', name: 'apps', label: 'apps/ - Standalone Web Cartridges', path: relPrefix + 'apps/', badge: 'NAV', meta: 'Cartridges' },
    { key: 'skills', name: 'skills', label: 'skills/ - Modular Agent Directives', path: relPrefix + 'skills/', badge: 'NAV', meta: 'Directives' },
    { key: 'combos', name: 'combos', label: 'combos/ - Workflow Pipelines', path: relPrefix + 'combos/', badge: 'NAV', meta: 'Pipelines' },
    { key: 'scripts', name: 'scripts', label: 'scripts/ - Context Ops & CLI Automations', path: relPrefix + 'scripts/', badge: 'NAV', meta: 'Automations' },
    { key: 'home', name: 'home', label: 'home/ - Retro Arcade Master Hub', path: relPrefix + 'index.html', badge: 'NAV', meta: 'Hub' }
  ];

  let selectedSuggestionIndex = -1;
  let currentSuggestions = [];
  let isBackspacedMode = false;

  function highlightMatches(text, query) {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return text.slice(0, idx) + '<span class="suggestion-highlight">' + text.slice(idx, idx + query.length) + '</span>' + text.slice(idx + query.length);
  }

  function renderSuggestions(list, query) {
    currentSuggestions = list;
    selectedSuggestionIndex = -1;
    if (!suggestionBox) return;

    if (!list || list.length === 0) {
      suggestionBox.style.display = 'none';
      suggestionBox.innerHTML = '';
      return;
    }

    let html = '<div class="suggestion-list">';
    list.forEach((item, idx) => {
      const isNav = !!item.isNav;
      const badgeClass = isNav ? 'badge-nav' : ('badge-' + (item.subsystem || 'app'));
      const badgeText = item.badge || (item.subsystem ? item.subsystem.slice(0, 4).toUpperCase() : 'APP');
      const title = item.displayTitle || item.label || item.title || item.name;
      const metaText = item.meta || item.size || item.category || '';

      html += '<div class="suggestion-item" data-index="' + idx + '" data-url="' + (item.path || item.url || '') + '">' +
        '<div class="suggestion-left">' +
          '<span class="suggestion-badge ' + badgeClass + '">' + badgeText + '</span>' +
          '<span class="suggestion-title">' + highlightMatches(title, query) + '</span>' +
        '</div>' +
        '<div class="suggestion-meta">' +
          '<span class="size-pill">' + metaText + '</span>' +
        '</div>' +
      '</div>';
    });
    html += '</div>';
    html += '<div class="suggestion-footer">' +
      '<span>[↑↓] Navigate</span>' +
      '<span>[ENTER] Select / Open</span>' +
      '<span>[TAB] Complete</span>' +
      '<span>[ESC] Close</span>' +
    '</div>';

    suggestionBox.innerHTML = html;
    suggestionBox.style.display = 'block';

    suggestionBox.querySelectorAll('.suggestion-item').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.getAttribute('data-index'), 10);
        executeSuggestion(currentSuggestions[idx]);
      });
    });
  }

  function executeSuggestion(item) {
    if (!item) return;
    if (item.isNav && item.path) {
      window.location.href = item.path;
      return;
    }
    if (item.url) {
      if (item.subsystem === currentSubsystem) {
        activeQuery = (item.title || item.id || '').toLowerCase();
        if (searchInput) searchInput.value = item.title || item.id;
        if (typedText) typedText.textContent = item.title || item.id;
        canonicalizePrompt();
        updateCards();
      } else {
        const targetUrl = relPrefix + item.url;
        window.location.href = targetUrl;
      }
    }
  }

  function canonicalizePrompt() {
    isBackspacedMode = false;
    if (promptFolder) promptFolder.style.display = '';
    if (promptCaret) {
      promptCaret.style.display = '';
      promptCaret.textContent = '>';
    }
    if (suggestionBox) {
      suggestionBox.style.display = 'none';
      suggestionBox.innerHTML = '';
    }
  }

  function handleQuery(raw) {
    const val = raw.trim();
    if (!val) {
      renderSuggestions([], '');
      activeQuery = '';
      updateCards();
      return;
    }

    let targetSubsystem = '';
    let searchQuery = val;
    let delim = val.includes('/') ? '/' : (val.includes('>') ? '>' : null);
    if (delim) {
      const parts = val.split(delim);
      const possibleSub = parts[0].trim().toLowerCase();
      if (['apps', 'skills', 'combos', 'scripts', 'home'].includes(possibleSub)) {
        targetSubsystem = possibleSub;
        searchQuery = parts.slice(1).join(delim).trim();
      }
    }

    const suggestions = [];

    // 1. Subsystem navigation quick jump (or typing "/" alone)
    if (val === '/' || val === '>' || isBackspacedMode || (!delim && ['app', 'apps', 'skill', 'skills', 'combo', 'combos', 'script', 'scripts', 'home'].some(s => s.startsWith(val.toLowerCase())))) {
      const qLower = val === '/' || val === '>' ? '' : val.toLowerCase();
      NAV_DESTINATIONS.forEach(dest => {
        if (!qLower || dest.key.startsWith(qLower) || dest.name.startsWith(qLower)) {
          suggestions.push({
            isNav: true,
            badge: 'NAV',
            label: dest.label,
            path: dest.path,
            meta: dest.meta
          });
        }
      });
    }

    // 2. Right after "/" or ">" with empty search query (e.g. "apps/", "skills/", "combos/", "scripts/")
    const searchTarget = searchQuery.toLowerCase();
    if (targetSubsystem && searchTarget.length === 0) {
      omniData.forEach(item => {
        if (item.subsystem === targetSubsystem) {
          suggestions.push({
            isNav: false,
            badge: item.subsystem ? item.subsystem.slice(0, 4).toUpperCase() : 'APP',
            subsystem: item.subsystem,
            displayTitle: item.displayTitle || item.title,
            title: item.title,
            id: item.id,
            meta: item.category + ' • ' + item.size,
            url: item.url
          });
        }
      });
    }

    // 3. Cross-Subsystem Item Matching ("atitlefromaskillorapp")
    if (searchTarget.length > 0) {
      omniData.forEach(item => {
        if (targetSubsystem && item.subsystem !== targetSubsystem) return;
        const title = (item.title || item.displayTitle || '').toLowerCase();
        const overview = (item.overview || '').toLowerCase();
        const tags = Array.isArray(item.tags) ? item.tags.map(t => t.toLowerCase()) : [];
        const id = (item.id || item.slug || '').toLowerCase();

        if (title.includes(searchTarget) || id.includes(searchTarget) || overview.includes(searchTarget) || tags.some(t => t.includes(searchTarget))) {
          suggestions.push({
            isNav: false,
            badge: item.subsystem ? item.subsystem.slice(0, 4).toUpperCase() : 'APP',
            subsystem: item.subsystem,
            displayTitle: item.displayTitle || item.title,
            title: item.title,
            id: item.id,
            meta: item.category + ' • ' + item.size,
            url: item.url
          });
        }
      });
    }

    renderSuggestions(suggestions.slice(0, 8), searchQuery);

    if (!targetSubsystem || targetSubsystem === currentSubsystem) {
      activeQuery = searchQuery.toLowerCase();
      updateCards();
    }
  }

  function updateSelectedSuggestion() {
    if (!suggestionBox) return;
    const items = suggestionBox.querySelectorAll('.suggestion-item');
    items.forEach((el, idx) => {
      if (idx === selectedSuggestionIndex) {
        el.classList.add('is-selected');
        el.scrollIntoView({ block: 'nearest' });
      } else {
        el.classList.remove('is-selected');
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const raw = e.target.value;
      if (typedText) typedText.textContent = raw;
      handleQuery(raw);
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace') {
        const atStart = searchInput.selectionStart === 0 && searchInput.selectionEnd === 0;
        if (!isBackspacedMode && (searchInput.value === '' || atStart)) {
          e.preventDefault();
          isBackspacedMode = true;
          if (promptFolder) promptFolder.style.display = 'none';
          if (promptCaret) promptCaret.style.display = 'none';
          const curFolder = currentSubsystem === 'home' ? '' : currentSubsystem;
          const backspaced = curFolder.length > 0 ? curFolder.slice(0, -1) : '';
          searchInput.value = backspaced;
          if (typedText) typedText.textContent = backspaced;
          handleQuery(backspaced);
          return;
        }
      }

      if (currentSuggestions.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          selectedSuggestionIndex = (selectedSuggestionIndex + 1) % currentSuggestions.length;
          updateSelectedSuggestion();
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          selectedSuggestionIndex = (selectedSuggestionIndex - 1 + currentSuggestions.length) % currentSuggestions.length;
          updateSelectedSuggestion();
          return;
        }
        if (e.key === 'Tab') {
          e.preventDefault();
          if (selectedSuggestionIndex >= 0 && currentSuggestions[selectedSuggestionIndex]) {
            const item = currentSuggestions[selectedSuggestionIndex];
            const fillText = item.isNav ? (item.key || item.name) : (item.displayTitle || item.title);
            searchInput.value = fillText;
            if (typedText) typedText.textContent = fillText;
            handleQuery(fillText);
          }
          return;
        }
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && currentSuggestions[selectedSuggestionIndex]) {
          executeSuggestion(currentSuggestions[selectedSuggestionIndex]);
          return;
        }
        const raw = searchInput.value.trim();
        const navMatch = NAV_DESTINATIONS.find(d => d.key === raw.toLowerCase() || d.name === raw.toLowerCase());
        if (navMatch) {
          window.location.href = navMatch.path;
          return;
        }
        let delim = raw.includes('/') ? '/' : (raw.includes('>') ? '>' : null);
        if (delim) {
          const parts = raw.split(delim);
          const sub = parts[0].trim().toLowerCase();
          const q = parts.slice(1).join(delim).trim();
          if (sub !== currentSubsystem && ['apps', 'skills', 'combos', 'scripts', 'home'].includes(sub)) {
            const dest = NAV_DESTINATIONS.find(d => d.key === sub);
            if (dest) {
              window.location.href = dest.path + (q ? '?q=' + encodeURIComponent(q) : '');
              return;
            }
          }
          searchInput.value = q;
          if (typedText) typedText.textContent = q;
          activeQuery = q.toLowerCase();
          canonicalizePrompt();
          updateCards();
          return;
        }

        canonicalizePrompt();
      }

      if (e.key === 'Escape') {
        canonicalizePrompt();
        searchInput.blur();
      }
    });

    searchInput.addEventListener('blur', () => {
      setTimeout(() => {
        if (!suggestionBox || !suggestionBox.matches(':hover')) {
          canonicalizePrompt();
        }
      }, 200);
    });

    const searchBtn = document.getElementById('searchActionBtn');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        searchInput.focus();
      });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const qParam = urlParams.get('q');
    if (qParam) {
      searchInput.value = qParam;
      if (typedText) typedText.textContent = qParam;
      activeQuery = qParam.toLowerCase();
      updateCards();
    }
  }

  // 9-10. Theme toggle + accent picker are handled by themeEngine.js / accentPickerModal.js (legacy UI preserved)

  // 11. Fullscreen Toggle
  document.querySelectorAll('[data-action="toggle-fullscreen"]').forEach(el => {
    el.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });
  });

  // 12. 4-Tier URL Router Parameter Parsing
  const fullSearch = window.location.href;
  if (fullSearch.includes('=?playground') || fullSearch.includes('?app=')) {
    let appSlug = new URLSearchParams(window.location.search).get('app');
    if (!appSlug && fullSearch.includes('=?playground')) {
      const segs = fullSearch.split('=?playground')[0].split('/').filter(Boolean);
      appSlug = segs[segs.length - 1] || null;
    }
    if (appSlug) {
      window.location.replace('../data/apps/' + appSlug + '/index_detailed.html');
      return;
    }
  }

  // 13. Retro Toast Notification Helper
  function showRetroToast(message) {
    let toast = document.getElementById('retroToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'retroToast';
      toast.className = 'retro-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = '[ 📋 ' + message + ' ]';
    toast.classList.add('show');
    clearTimeout(toast.__timer);
    toast.__timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }

  // 14. 1-Tap Share Button Handler
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-share');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const relUrl = btn.getAttribute('data-share-url') || '';
    const fullUrl = new URL(relUrl, window.location.href).href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(fullUrl).then(() => {
        showRetroToast('Link copied to clipboard!');
      }).catch(() => {
        showRetroToast(fullUrl);
      });
    } else {
      showRetroToast(fullUrl);
    }
  });

  // 13. Global Keyboard Shortcuts Listener
  window.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea') {
      if (e.key === 'Escape') e.target.blur();
      return;
    }
    const isHome = document.body && document.body.getAttribute('data-page') === 'home';
    if (isHome) {
      if (e.key === '1') window.location.href = 'apps/';
      else if (e.key === '2') window.location.href = 'skills/';
      else if (e.key === '3') window.location.href = 'combos/';
      else if (e.key === '4') window.location.href = 'scripts/';
    }
    if (e.key === '*' || (e.shiftKey && e.key === '8')) {
      const s = document.getElementById('topSearchInput');
      if (s) { e.preventDefault(); s.focus(); }
    }
  });

  // Initial update
  updateCards();
})();
`;

const themeEngineJs = fs.readFileSync(path.join(modulesDir, 'themeEngine.js'), 'utf8');
const accentPickerJs = fs.readFileSync(path.join(srcDir, 'uiComponent', 'accentPickerModal.js'), 'utf8');
const omniInitJs = 'window.__ARCADE_OMNI_CATALOG__ = ' + JSON.stringify(omniCatalogEntries) + ';';
const mainBundleJs = [omniInitJs, themeEngineJs, accentPickerJs, clientMainJs].join('\n;\n');

fs.writeFileSync(path.join(publicDir, 'main.js'), mainBundleJs, 'utf8');
recordAuditEntry('main.js', `${(Buffer.byteLength(mainBundleJs) / 1024).toFixed(2)} KB`, Buffer.byteLength(mainBundleJs), Buffer.byteLength(mainBundleJs), false);
console.log('  -> public/main.js (' + (Buffer.byteLength(mainBundleJs) / 1024).toFixed(1) + ' KB)\n');

// -----------------------------------------------------------------------------
// STEP 3: COPY & BUNDLE STYLESHEETS (RULE #1: theme.css is 100% UNTOUCHED)
// -----------------------------------------------------------------------------
console.log('[3/5] Bundling & Copying Stylesheets...');

const masterThemePath = path.join(styleDir, 'themes/vintage-computer/theme.css');
const themeCss = fs.readFileSync(masterThemePath, 'utf8'); // Untouched Obsidian Theme
const srcStyleCssPath = path.join(srcDir, 'style.css');
const compiledStyleCss = fs.readFileSync(srcStyleCssPath, 'utf8');
const compactedStyleCss = compactCss(compiledStyleCss);

fs.writeFileSync(path.join(publicDir, 'theme.css'), themeCss, 'utf8');
fs.writeFileSync(path.join(publicDir, 'style.css'), compactedStyleCss, 'utf8');

const themeBytes = Buffer.byteLength(themeCss);
recordAuditEntry('theme.css', `${(themeBytes / 1024).toFixed(2)} KB`, themeBytes, themeBytes, false);
recordAuditEntry('style.css', `${(Buffer.byteLength(compiledStyleCss) / 1024).toFixed(2)} KB`, Buffer.byteLength(compiledStyleCss), Buffer.byteLength(compactedStyleCss), true);

console.log('  -> public/theme.css (Original Obsidian Theme - ' + (themeBytes / 1024).toFixed(1) + ' KB - Rule #1 Safe)');
console.log('  -> public/style.css (' + (Buffer.byteLength(compactedStyleCss) / 1024).toFixed(1) + ' KB)\n');

// -----------------------------------------------------------------------------
// STEP 4: COMPILE HTML SHELLS
// -----------------------------------------------------------------------------
console.log('[4/5] Compiling HTML Shells...');

function prepareHtml(htmlStr, scriptBundle) {
  let res = htmlStr;
  res = res.replace(/href="style\/themes\/vintage-computer\/theme\.css"/g, 'href="theme.css"');
  res = res.replace(/href="style\/theme\/vintage-computer\/theme\.css"/g, 'href="theme.css"');
  res = res.replace(/href="theme\/theme\.css"/g, 'href="theme.css"');
  res = res.replace(/href="style\.css"/g, 'href="style.css"');

  res = res.replace(/<link rel="stylesheet" href="style\/winget\.css">\s*/g, '');
  res = res.replace(/<link rel="stylesheet" href="style\/flopydisk-cornercut\.css">\s*/g, '');
  res = res.replace(/<link rel="stylesheet" href="theme\/winget\.css">\s*/g, '');
  res = res.replace(/<link rel="stylesheet" href="theme\/flopydisk-cornercut\.css">\s*/g, '');
  res = res.replace(/<link rel="stylesheet" href="theme\/terminal\.css">\s*/g, '');
  res = res.replace(/<link rel="stylesheet" href="terminal\.css">\s*/g, '');
  res = res.replace(/<link rel="stylesheet" href="\.\.\/terminal\.css">\s*/g, '');

  res = res.replace(/<script[^>]*src=["'][^"']*(page-apps|page-playground|main)\.js["'][^>]*><\/script>/g, `  <script src="${scriptBundle}"></script>`);
  res = res.replace(/<!-- Modular Vintage Architecture Scripts -->[\s\S]*?<\/body>/, `  <script src="${scriptBundle}"></script>\n</body>`);
  res = res.replace(/<!-- Modular Scripts -->[\s\S]*?<\/body>/, `  <script src="${scriptBundle}"></script>\n</body>`);
  return res;
}

const srcPageAppsHtml = fs.readFileSync(path.join(srcDir, 'uiLayout/apps/layout.html'), 'utf8');
// Clean Directory Routing: public/apps/index.html (Exact Same UI, adjusted relative paths)
const pubAppsIndexHtml = compactHtml(prepareHtml(srcPageAppsHtml, '../main.js')
  .replace(/href="theme\.css"/g, 'href="../theme.css"')
  .replace(/href="style\.css"/g, 'href="../style.css"')
  .replace(/href="page-playground\.html\?app=radiansincostan"/g, 'href="../data/apps/radiansincostan/index_detailed.html"')
  .replace(/href="apps\/radiansincostan\/index\.html"/g, 'href="../data/apps/radiansincostan/index.html"')
  .replace(/src="apps\/radiansincostan/g, 'src="../data/apps/radiansincostan')
);
fs.writeFileSync(path.join(publicAppsDir, 'index.html'), pubAppsIndexHtml, 'utf8');

// Function to generate the 3 other pillars with EXACT SAME UI/UX (Hero Floppy 45°, 4 metrics)
function compilePillarPage(pillarId, title, desc, icon) {
  const pillarDir = path.join(publicDir, pillarId);
  if (!fs.existsSync(pillarDir)) fs.mkdirSync(pillarDir, { recursive: true });
  
  let html = srcPageAppsHtml
    .replace(/💾 Vibe-Coded Software Arcade/g, icon + ' ' + title)
    .replace(/Standalone, single-file, zero-backend web apps[\s\S]*?offline\./, desc)
    .replace(/prompt-folder" id="promptFolderSegment">apps</g, 'prompt-folder" id="promptFolderSegment">' + pillarId + '<')
    .replace(/APPS LOADED/g, pillarId.toUpperCase() + ' LOADED');
    
  const compacted = compactHtml(prepareHtml(html, '../main.js')
    .replace(/href="theme\.css"/g, 'href="../theme.css"')
    .replace(/href="style\.css"/g, 'href="../style.css"')
    .replace(/href="page-playground\.html\?app=radiansincostan"/g, 'href="../data/apps/radiansincostan/index_detailed.html"')
    .replace(/href="apps\/radiansincostan\/index\.html"/g, 'href="../data/apps/radiansincostan/index.html"')
    .replace(/src="apps\/radiansincostan/g, 'src="../data/apps/radiansincostan')
  );
  fs.writeFileSync(path.join(pillarDir, 'index.html'), compacted, 'utf8');
}

compilePillarPage('skills', 'Modular Agent Directives', 'Standardized prompt directives, AI agent behaviors, and portable development standards.', '⚡');
compilePillarPage('combos', 'Workflow Pipelines', 'Multi-stage meta-skill workflow orchestration pipelines and release gates.', '🔄');
compilePillarPage('scripts', 'Context Ops & CLI Automations', 'Portable cross-platform PowerShell, Python, and Bash automation tools with standalone export.', '🛠️');
recordAuditEntry('apps/index.html', `${(Buffer.byteLength(srcPageAppsHtml) / 1024).toFixed(2)} KB`, Buffer.byteLength(srcPageAppsHtml), Buffer.byteLength(pubAppsIndexHtml), false);

// Master Hub (public/index.html): same hero floppy + navbar shell, body swapped for the 4-subsystem launcher
function countDataEntries(subDir, mode) {
  const dir = path.join(repoRoot, 'data', subDir);
  if (!fs.existsSync(dir)) return 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  if (mode === 'dirs') return entries.filter(e => e.isDirectory()).length;
  return entries.filter(e => e.isFile() && e.name.endsWith('.json')).length;
}

function countSubsystemItems(subDir) {
  const catPath = path.join(repoRoot, 'data', subDir, '_catalog.json');
  if (fs.existsSync(catPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(catPath, 'utf8'));
      if (Array.isArray(data)) return data.length;
    } catch (_) {}
  }
  return countDataEntries(subDir, subDir === 'apps' ? 'dirs' : 'files');
}

const srcMenuHtml = fs.readFileSync(path.join(srcDir, 'uiLayout/menu/layout.html'), 'utf8')
  .replace(/\{\{appsCount\}\}/g, String(countSubsystemItems('apps')))
  .replace(/\{\{skillsCount\}\}/g, String(countSubsystemItems('skills')))
  .replace(/\{\{combosCount\}\}/g, String(countSubsystemItems('combos')))
  .replace(/\{\{scriptsCount\}\}/g, String(countSubsystemItems('scripts')));

const filterStart = srcPageAppsHtml.indexOf('<section class="filter-bar">');
const mainEnd = srcPageAppsHtml.indexOf('</main>') + '</main>'.length;
let homeHtml = srcPageAppsHtml.slice(0, filterStart) + srcMenuHtml + srcPageAppsHtml.slice(mainEnd);
homeHtml = homeHtml
  .replace(/<title>[\s\S]*?<\/title>/, '<title>Retro IT Knowledge Arcade | Fadhli S Lubis</title>')
  .replace(/💾 Vibe-Coded Software Arcade/g, '💾 Retro IT Knowledge Arcade')
  .replace(/Standalone, single-file, zero-backend web apps[\s\S]*?offline\./, 'Decoupled knowledge operating system &amp; standalone web cartridges. Pick a subsystem below or press <strong>[1]-[4]</strong>.')
  .replace(/APPS LOADED/g, 'SUBSYSTEMS')
  .replace(/<strong class="metric-val" id="heroAppsLoadedVal">[^<]*<\/strong>/, '<strong class="metric-val" id="heroAppsLoadedVal">4 Modules</strong>')
  .replace(/<span class="prompt-sep">\/<\/span>\s*<span class="prompt-item prompt-folder"[^>]*>apps<\/span>/, '')
  .replace(/href="\.\.\/index\.html" class="prompt-item prompt-home"/, 'href="index.html" class="prompt-item prompt-home"')
  .replace(/<body class="theme-dark">/, '<body class="theme-dark" data-page="home">');
const indexHtml = prepareHtml(homeHtml, 'main.js');
const compactedIndexHtml = compactHtml(indexHtml);
fs.writeFileSync(path.join(publicDir, 'index.html'), compactedIndexHtml, 'utf8');
recordAuditEntry('index.html', `${(Buffer.byteLength(indexHtml) / 1024).toFixed(2)} KB (home hub)`, Buffer.byteLength(indexHtml), Buffer.byteLength(compactedIndexHtml), false);

console.log('  -> public/apps/index.html');
console.log('  -> public/skills/index.html');
console.log('  -> public/combos/index.html');
console.log('  -> public/scripts/index.html');
console.log('  -> public/index.html (Master Hub)\n');

// -----------------------------------------------------------------------------
// STEP 5: PASS-THROUGH ASSETS & SLIDES
// -----------------------------------------------------------------------------
console.log('[5/5] Syncing Assets & Slides...');

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

copyRecursiveSync(path.join(srcDir, 'assets'), path.join(publicDir, 'assets'));
copyRecursiveSync(path.join(srcDir, 'static'), path.join(publicDir, 'static'));
if (fs.existsSync(path.join(repoRoot, 'data'))) {
  copyRecursiveSync(path.join(repoRoot, 'data'), path.join(publicDir, 'data'));
}

const slidesSrc = path.join(srcDir, 'slides');
const slidesDest = path.join(publicDir, 'slides');
if (fs.existsSync(slidesSrc)) {
  copyRecursiveSync(slidesSrc, slidesDest);
  fs.readdirSync(slidesSrc).forEach(f => {
    const b = fs.statSync(path.join(slidesSrc, f)).size;
    recordAuditEntry(`slides/${f}`, `${(b / 1024).toFixed(2)} KB (slides)`, b, b, false);
  });
}

// -----------------------------------------------------------------------------
// STEP 6: COMPUTE 4 CORE METRICS & EMIT AUDIT REPORT + CSV
// -----------------------------------------------------------------------------
function getDirectorySize(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  let total = 0;
  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const item of items) {
    const full = path.join(dirPath, item.name);
    if (item.isDirectory()) {
      total += getDirectorySize(full);
    } else {
      total += fs.statSync(full).size;
    }
  }
  return total;
}

const srcSizeBytes = getDirectorySize(srcDir);
const appsSizeBytes = getDirectorySize(appsDir);
const publicSizeBytes = getDirectorySize(publicDir);

const totalCompiledKb = auditList.reduce((acc, cur) => acc + cur.beforeKb, 0);
const totalCompactedKb = auditList.reduce((acc, cur) => acc + cur.afterKb, 0);

const publicAppsSizeBytes = fs.existsSync(publicAppsDir) ? getDirectorySize(publicAppsDir) : 0;
const publicWithoutAppsBytes = Math.max(0, publicSizeBytes - publicAppsSizeBytes);

const sizeSrcKb = parseFloat((srcSizeBytes / 1024).toFixed(2));
const sizeAppsKb = parseFloat((appsSizeBytes / 1024).toFixed(2));
const sizeBuildWithoutAppsKb = parseFloat((publicWithoutAppsBytes / 1024).toFixed(2));
const sizeBuildIncludeAppsKb = parseFloat((publicSizeBytes / 1024).toFixed(2));
const sizeBuildCompactedIncludeAppsKb = parseFloat((totalCompactedKb + ((publicSizeBytes / 1024) - totalCompiledKb)).toFixed(2));
const totalDurationMs = Date.now() - buildStartTime;

// 1. Terminal Audit Table
const bannerDiv = '='.repeat(111);
const divLine = '  ' + '-'.repeat(46) + '-+-' + '-'.repeat(24) + '-+-' + '-'.repeat(12) + '-+-' + '-'.repeat(22);

console.log(bannerDiv);
console.log('  PRODUCTION BUILD & COMPACTION AUDIT REPORT');
console.log(bannerDiv);
console.log('  ' + 'file name'.padEnd(46) + ' | ' + 'src'.padEnd(24) + ' | ' + 'compiled'.padEnd(12) + ' | ' + 'compiled (Compacted)'.padEnd(22));
console.log(divLine);

auditList.forEach(item => {
  const compDisplay = item.isMerged ? 'merged' : `${item.afterKb} KB`;
  console.log(
    '  ' + item.fileName.padEnd(46) +
    ' | ' + item.srcDisplay.padEnd(24) +
    ' | ' + `${item.beforeKb} KB`.padEnd(12) +
    ' | ' + compDisplay.padEnd(22)
  );
});

console.log(divLine);
console.log(
  '  ' + 'TOTAL AUDITED BUNDLES'.padEnd(46) +
  ' | ' + `${totalCompiledKb.toFixed(2)} KB`.padEnd(24) +
  ' | ' + `${totalCompiledKb.toFixed(2)} KB`.padEnd(12) +
  ' | ' + `${totalCompactedKb.toFixed(2)} KB`.padEnd(22)
);
console.log(bannerDiv);

// 2. Display the 5 Core Metrics
console.log('\n===============================================================================================================');
console.log('  FIVE CORE BUILD SIZES:');
console.log('===============================================================================================================');
console.log(`  [1] src                             : ${sizeSrcKb} KB  (Raw source code in src/)`);
console.log(`  [2] apps                            : ${sizeAppsKb} KB  (Raw cartridges in apps/)`);
console.log(`  [3] build without apps uncompacted  : ${sizeBuildWithoutAppsKb} KB  (Core platform runtime in public/)`);
console.log(`  [4] build with apps uncompacted     : ${sizeBuildIncludeAppsKb} KB  (Total uncompacted public/ distribution)`);
console.log(`  [5] build with apps compacted       : ${sizeBuildCompactedIncludeAppsKb} KB  (Compacted public/ distribution)`);
console.log('===============================================================================================================');

// 3. Write Split CSV Reports
// CSV 1: Core Metrics (Metric,Size_KB,Duration_MS,Description)
const coreCsvLines = [
  'Metric,Size_KB,Duration_MS,Description',
  `src,${sizeSrcKb},0,Total raw source code size (src/)`,
  `apps,${sizeAppsKb},0,Total cartridges directory size (apps/)`,
  `build_without_apps_uncompacted,${sizeBuildWithoutAppsKb},${totalDurationMs},Core platform runtime distribution excluding apps (public/)`,
  `build_with_apps_uncompacted,${sizeBuildIncludeAppsKb},${totalDurationMs},Total uncompacted distribution size including apps (public/)`,
  `build_with_apps_compacted,${sizeBuildCompactedIncludeAppsKb},${totalDurationMs},Total compacted distribution size including apps (public/)`
];
const coreCsvContent = coreCsvLines.join('\n') + '\n';
fs.writeFileSync(path.join(publicDir, 'build-report-table-core.csv'), coreCsvContent, 'utf8');
fs.writeFileSync(path.join(repoRoot, 'build-report-table-core.csv'), coreCsvContent, 'utf8');

// CSV 2: Detailed Payload Audit (File_Name,Source_Type,Compiled_KB,Compacted_KB,Saved_KB,Reduction_Pct)
const detailedCsvLines = [
  'File_Name,Source_Type,Compiled_KB,Compacted_KB,Saved_KB,Reduction_Pct'
];
auditList.forEach(item => {
  detailedCsvLines.push(`${item.fileName},"${item.srcDisplay}",${item.beforeKb},${item.afterKb},${item.savedKb},${item.reductionPct}`);
});
const detailedCsvContent = detailedCsvLines.join('\n') + '\n';
fs.writeFileSync(path.join(publicDir, 'build-report-table-detailed.csv'), detailedCsvContent, 'utf8');
fs.writeFileSync(path.join(repoRoot, 'build-report-table-detailed.csv'), detailedCsvContent, 'utf8');

// Remove obsolete single CSV if present
[path.join(publicDir, 'build-report-table.csv'), path.join(repoRoot, 'build-report-table.csv')].forEach(oldFile => {
  if (fs.existsSync(oldFile)) {
    try { fs.unlinkSync(oldFile); } catch (e) {}
  }
});

console.log('  Audit CSVs written:');
console.log('   - build-report-table-core.csv (root & public/)');
console.log('   - build-report-table-detailed.csv (root & public/)\n');

// 4. Update build.json with live metrics
let buildConfig = null;
if (fs.existsSync(buildJsonPath)) {
  try {
    const rawBuild = fs.readFileSync(buildJsonPath, 'utf8');
    buildConfig = JSON.parse(rawBuild);
    buildConfig.buildMetrics = {
      auditCoreCsv: 'public/build-report-table-core.csv',
      auditDetailedCsv: 'public/build-report-table-detailed.csv',
      reportMd: 'public/build-report.md',
      reportFlatMd: 'public/build-report-flat.md',
      durationMs: totalDurationMs,
      updatedAt: new Date().toISOString(),
      sizes: {
        src: `${sizeSrcKb} KB`,
        apps: `${sizeAppsKb} KB`,
        buildWithoutAppsUncompacted: `${sizeBuildWithoutAppsKb} KB`,
        buildWithAppsUncompacted: `${sizeBuildIncludeAppsKb} KB`,
        buildWithAppsCompacted: `${sizeBuildCompactedIncludeAppsKb} KB`
      }
    };
    fs.writeFileSync(buildJsonPath, JSON.stringify(buildConfig, null, 2) + '\n', 'utf8');
    console.log('  Updated build.json buildMetrics with live size data.');
  } catch (err) {
    console.warn('[WARN] Could not update build.json metrics:', err.message);
  }
}

// 5. Generate Heading-based App Brief
const appHeadingsMd = masterCatalog.map((app, idx) => {
  const lightWebp = app.imgLight || `apps/${app.slug}_img-lightmode.webp`;
  const darkWebp = app.imgDark || `apps/${app.slug}_img-darkmode.webp`;
  const htmlFile = `apps/${app.slug}.html`;
  const mdFile = `apps/${app.slug}.md`;
  const wikiProp = app.obsidianImgProperty || `[[${app.slug}_img-lightmode.webp]], [[${app.slug}_img-darkmode.webp]]`;

  return `### ${idx + 1}. ${app.title} (\`${app.slug}\`)
* **Category / Sector**: \`${app.category}\` (\`${app.sector}\`)
* **Overview**: ${app.overview}
* **Obsidian Frontmatter \`img\`**: \`${wikiProp}\`
* **Direct Openable Artifacts (3 Files)**:
  1. 🌐 **Standalone HTML App**: [${app.slug}.html](${htmlFile})
  2. ☀️ **Playwright Light Mode Preview**: [${path.basename(lightWebp)}](${lightWebp})
  3. 🌙 **Playwright Dark Mode Preview**: [${path.basename(darkWebp)}](${darkWebp})
  *(Source Markdown: [${app.slug}.md](${mdFile}))*
`;
}).join('\n');

const reportHeaderMd = `---
version-build: ${buildConfig && buildConfig.version ? buildConfig.version : '2.1.0'}
version-build-by: agent
note: Core production build report with standalone bundling, zero-ID compliance, Playwright preview audits, and CSV metrics.
commit:
  feat:
    - Standalone core build engine (src/modules/build-bundle.js)
    - Apps brief using Markdown headings format with 3 openable files per app
  chore:
    - Obsidian-compatible wikilink frontmatter properties (img: [[light.webp]], [[dark.webp]])
    - Split audit tables into core and detailed CSV metrics
  remove:
    - Hardcoded all-lads-tool dependency from core build engine
---

# 🕹️ Vintage Computing Arcade — Production Build Report

## 📝 1. Architectural Brief & Build Overview
* **Project**: Vintage Computing Arcade (\`fadhlisl-my-id\`)
* **Timestamp**: \`${new Date().toISOString()}\`
* **Duration**: \`${totalDurationMs} ms\`
* **Build Engine**: \`src/modules/build-bundle.js\` (100% Standalone Core, Zero-Backend)
* **Architecture Rules**:
  * **Rule #1 (Theme Immutability)**: \`theme.css\` (Original Obsidian Theme) is preserved with **0 edits / 100% byte fidelity**.
  * **Rule #2 (Mobile Zero Horizontal Scroll)**: \`overflow-x: clip\` enforced across all viewports.
  * **Rule #3 (Zero Hardcoded Variables)**: Dynamic resolution via relative paths and manifest configuration.
  * **Zero-ID Standard**: Slugs derived strictly from basenames.

---

## 🕹️ 2. Standalone Apps & Cartridges Brief

${appHeadingsMd}

---

## 🎯 3. Five Core Build Sizes

| Metric | Size (KB) | Duration (MS) | Description | Status |
| :--- | :--- | :--- | :--- | :--- |
| **[1] \`src\`** | **${sizeSrcKb} KB** | - | Raw source code in \`src/\` | Uncompiled Source |
| **[2] \`apps\`** | **${sizeAppsKb} KB** | - | Standalone cartridges in \`apps/\` | Isolated Apps |
| **[3] \`build without apps uncompacted\`** | **${sizeBuildWithoutAppsKb} KB** | ${totalDurationMs} ms | Core platform runtime in \`public/\` | Core Distribution |
| **[4] \`build with apps uncompacted\`** | **${sizeBuildIncludeAppsKb} KB** | ${totalDurationMs} ms | Total distribution including apps in \`public/\` | Raw Distribution |
| **[5] \`build with apps compacted\`** | **${sizeBuildCompactedIncludeAppsKb} KB** | ${totalDurationMs} ms | Total compacted distribution in \`public/\` | **Optimized Output** |

---

## 🏗️ 4. Build Architecture Flow (ASCII Diagram)

\`\`\`text
===================================================================================
                       RAW SOURCES (src/ & apps/)
  [src/modules/*.js] (379 KB)      [src/style/*.css] (180 KB)      [apps/*] (494 KB)
===================================================================================
             |                                 |                          |
             |  Concatenation & Routing        |  Combine & Scope         |  Cartridge CSR
             v                                 v                          v
+---------------------------------------------------------------------------------+
|                       COMPILED BUNDLES (public/)                                |
|  -> page-apps.js       (12 modules: Catalog, Navigation, Markdown, Downloader)  |
|  -> page-playground.js (12 modules: Dual-panel sandbox, Slidev, Speech, TTS)    |
|  -> winget.js          (Standalone Floating Quick Nav Pod)                      |
|  -> theme.css          (Verbatim Obsidian Retro Theme -- RULE #1 SAFE)          |
|  -> style.css          (Combined Floppy cut + Terminal cursor + Winget modals)  |
|  -> public/apps/*      (Standalone HTMLs, WebP thumbnails, _catalog.json)       |
+---------------------------------------------------------------------------------+
                                       |
                                       |  Terser / Regex Compaction & Strip
                                       v
===================================================================================
                  FINAL COMPACTED DISTRIBUTION (public/)
   Total Distribution: ${sizeBuildCompactedIncludeAppsKb} KB | Zero-Backend Ready | 100% Airgap Static
===================================================================================
\`\`\`

---
`;

const reportDetailedAuditMd = `
## 📋 6. Detailed Payload Audit Table

| File Name | Source / Type | Compiled | Compacted | Reduction |
| :--- | :--- | :--- | :--- | :--- |
${auditList.map(item => `| \`${item.fileName}\` | ${item.srcDisplay} | ${item.beforeKb} KB | ${item.isMerged ? '*merged*' : `${item.afterKb} KB`} | ${item.reductionPct} |`).join('\n')}

---

> [!NOTE]
> **RULE #1 VERIFICATION**: \`theme.css\` byte length = \`${themeBytes}\` bytes. Matched upstream Obsidian theme verbatim with zero mutations.
`;

// Report A: build-report.md (Wikilink embeds: ![[build-report-table-core.csv]] and ![[build-report-table-detailed.csv]])
const reportWikilinkMd = reportHeaderMd + `
## 📊 5. Build Audit CSV Tables

### 🎯 5.1 Core Metrics Table
![[build-report-table-core.csv]]

### 📋 5.2 Detailed Payload Audit Table
![[build-report-table-detailed.csv]]

---
` + reportDetailedAuditMd;

fs.writeFileSync(path.join(publicDir, 'build-report.md'), reportWikilinkMd, 'utf8');
fs.writeFileSync(path.join(repoRoot, 'build-report.md'), reportWikilinkMd, 'utf8');
console.log('  Build Report (Wikilink) written to: public/build-report.md & build-report.md');

// Report B: build-report-flat.md (Standard fenced codeblocks with \`\`\`csv)
const reportFlatMd = reportHeaderMd + `
## 📊 5. Build Audit CSV Tables

### 🎯 5.1 Core Metrics Table
\`\`\`csv
${coreCsvContent.trim()}
\`\`\`

### 📋 5.2 Detailed Payload Audit Table
\`\`\`csv
${detailedCsvContent.trim()}
\`\`\`

---
` + reportDetailedAuditMd;

fs.writeFileSync(path.join(publicDir, 'build-report-flat.md'), reportFlatMd, 'utf8');
fs.writeFileSync(path.join(repoRoot, 'build-report-flat.md'), reportFlatMd, 'utf8');
console.log('  Build Report (Flat Codeblocks) written to: public/build-report-flat.md & build-report-flat.md');

console.log('\n[DONE] Core build completed successfully without all-lads-tool dependency!\n');
