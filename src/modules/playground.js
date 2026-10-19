/**
 * ============================================================================
 * MODULE: Dual-Panel Interactive Playground Engine (src/modules/playground.js)
 * Purpose: Powers the split-screen sandbox, bento layout, live iframe runner,
 *          Slidev component deck, and keyboard shortcuts.
 * ============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ArcadePlayground = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // --------------------------------------------------------------------------
  // MODULAR APPS DATASET (7 COMPLETE APPLICATIONS)
  // --------------------------------------------------------------------------
  const APPS_REGISTRY = {
    'vibe-arcade-deck': {
      id: 'vibe-arcade-deck',
      name: 'Modular Slidev Hybrid Deck',
      slug: 'vibe-arcade-deck',
      scope: 'Slidev & Presentation',
      srcUrl: 'apps/vibe-arcade-deck/index.html',
      downloadName: 'vibe-arcade-deck.html',
      externalUrl: 'apps/vibe-arcade-deck/index.html',
      githubUrl: 'https://github.com/pakcli/fadhlisl-my-id',
      lang: 'en-US',
      tutorials: [
        {
          step: 'STEP 1 OF 3: HYBRID CACHE & NAV',
          title: '1. Navigate & Verify FNV-1a Cache Hit',
          text: 'Use Next/Prev or Arrow Keys inside the stage. Notice the top badge showing FNV-1a Hash Cache Hit on repeat opens with automatic slide resume.'
        },
        {
          step: 'STEP 2 OF 3: LIVE EDIT & RUN JS',
          title: '2. Click [✏️ Edit] or [▶ Run Code]',
          text: 'Go to Slide 3 and click "▶ Run Code" to execute live JS inside the slide, or click "✏️ Edit [E]" to live-edit raw Slidev Markdown in the browser.'
        },
        {
          step: 'STEP 3 OF 3: PRESENTER & LASER',
          title: '3. Presenter Console [P], Laser [L] & Draw [D]',
          text: 'Click "⊞ Grid [O]" for Storyboard Overview, "🔴 Laser [L]" / "🖊️ Draw [D]" for live annotations, or "🎙️ Presenter [P]" for Dual-Screen BroadcastChannel sync.'
        }
      ],
      components: [
        {
          tag: 'COMPONENT: FNV1A_HASH_CACHE',
          title: '1. FNV-1a 32-Bit Hash & First-Open Cache',
          desc: 'Computes a fast 32-bit FNV-1a hash of the raw Markdown deck. On first open, it compiles and stores the slides in localStorage; repeat visits skip parsing (< 1ms).',
          filename: 'slidev-engine.js',
          code: `function fnv1aHash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).toUpperCase().padStart(8, '0');
}`
        },
        {
          tag: 'COMPONENT: VIRTUAL_3SLIDE_DOM',
          title: '2. Virtual 3-Slide DOM Window (Prev | Active | Next)',
          desc: 'Instead of mounting all slides at once, only the previous, current, and next slide nodes are mounted in the DOM for locked 60 FPS on Mobile Portrait.',
          filename: 'virtual_stage.js',
          code: `const windowIndices = [currentIdx - 1, currentIdx, currentIdx + 1]
  .filter(i => i >= 0 && i < total);
mountNode.innerHTML = windowIndices.map(i => renderSlide(deck.slides[i])).join('');`
        },
        {
          tag: 'COMPONENT: BROADCAST_PRESENTER',
          title: '3. Dual-Screen Presenter Sync via BroadcastChannel',
          desc: 'Synchronizes the Audience Stage and Presenter Console (Speaker Notes + Timer) across browser tabs with zero backend or WebSockets.',
          filename: 'presenter_sync.js',
          code: `const syncChannel = new BroadcastChannel('arcade_slidev_sync');
syncChannel.postMessage({
  type: 'SLIDE_SYNC',
  index: currentIdx,
  notes: deck.slides[currentIdx].notes
});`
        }
      ]
    },
    'ksi': {
      id: 'ksi',
      name: 'Unit Circle Resolver',
      slug: 'unit-circle',
      scope: 'Math & Visualization',
      srcUrl: 'apps/radiansincostan/index.html',
      downloadName: 'interactive-unit-circle.html',
      externalUrl: 'apps/radiansincostan/index.html',
      githubUrl: 'https://github.com/pakcli/fadhlisl-my-id',
      lang: 'en-US',
      tutorials: [
        {
          step: 'STEP 1 OF 3: TEST DRIVE',
          title: '1. Drag the Angle Point',
          text: 'Click and drag the circular control point around the perimeter. Watch the degree angle update along with the live π radian conversion.'
        },
        {
          step: 'STEP 2 OF 3: RADICAL SNAP',
          title: '2. Special Angle Snapping',
          text: 'When "Snap: on" is active, dragging near 30°, 45°, 60°, or 90° locks precisely to exact radical values like √2/2 and √3/2 rather than decimal approximations.'
        },
        {
          step: 'STEP 3 OF 3: PLAYBACK LOOP',
          title: '3. Animation Loop',
          text: 'Click "▶ Play" and "⟲ Loop" on the vertical slider to see the unit circle run continuous periodic waveforms through all 4 quadrants.'
        }
      ],
      components: [
        {
          tag: 'COMPONENT: SVG_WEDGE_ENGINE',
          title: '1. Dynamic SVG Arc & Wedge Geometry',
          desc: 'Instead of heavy canvas rendering libraries, the arc wedge is calculated with native SVG Arc Path commands (M, L, A) dynamically tracking the angle theta.',
          filename: 'wedge_calculator.js',
          code: `// Calculating dynamic SVG path
const r = ang * Math.PI / 180;
const x = cx + R * Math.cos(r);
const y = cy - R * Math.sin(r);

// Generate SVG Arc wedge
const wr = 44;
wedge.setAttribute("d", 
  \`M\${cx},\${cy} L\${cx+wr},\${cy} A\${wr},\${wr} 0 \${ang>180?1:0} 0 \${cx+wr*Math.cos(r)},\${cy-wr*Math.sin(r)}Z\`
);`
        },
        {
          tag: 'COMPONENT: RADICAL_SOLVER',
          title: '2. Exact Fraction & Radical Simplifier',
          desc: 'A lookup map resolves exact mathematical radical strings (e.g. √3/2, √2/2) for standard trigonometric milestones without floating point precision jitter.',
          filename: 'radical_table.js',
          code: `const T = {0:[0], 30:[1,2], 45:["√2",2], 60:["√3",2], 90:[1,1]};

function sinRef(d) {
  d = ((d % 360) + 360) % 360;
  let r = d % 180;
  if (r > 90) r = 180 - r;
  if (!(r in T)) return null;
  return { r, neg: d > 180 };
}`
        },
        {
          tag: 'COMPONENT: POINTER_EVENT_CAPTURE',
          title: '3. High-Precision Pointer Event Matrix',
          desc: 'Pointer events are transformed through SVG screen CTM (Current Transformation Matrix) to guarantee zero-lag drag response on mobile touch and desktop mice.',
          filename: 'pointer_math.js',
          code: `function move(e) {
  const p = svg.createSVGPoint();
  p.x = e.clientX; p.y = e.clientY;
  const q = p.matrixTransform(svg.getScreenCTM().inverse());
  let a = Math.atan2(cy - q.y, q.x - cx) * 180 / Math.PI;
  if (a < 0) a += 360;
  ang = snap ? snapToSpecial(a) : Math.round(a * 10) / 10;
  upd();
}`
        },
        {
          tag: 'COMPONENT: SINGLE_FILE_COMPILATION',
          title: '4. Zero-Dependency Standalone Runtime',
          desc: 'CSS custom properties, SVG DOM generator, and math engine bundled in under 7 KB without React, Vue, or Webpack overhead.',
          filename: 'build_manifest.json',
          code: `{
  "app": "interactive-unit-circle",
  "version": "1.0.0",
  "bundle_size": "6.8 KB",
  "dependencies": 0,
  "offline_ready": true,
  "tested_browsers": ["Chrome", "Safari iOS", "Firefox", "Edge"]
}`
        }
      ]
    },
    'lotek-offline': {
      id: 'lotek-offline',
      name: "Bude's Lotek Order",
      slug: 'lotek-ordering',
      scope: 'Web & WhatsApp CRM',
      srcUrl: 'apps/lotek-offline.html',
      downloadName: 'bude-lotek-order.html',
      externalUrl: 'apps/lotek-offline.html',
      githubUrl: 'https://github.com/pakcli/fadhlisl-my-id',
      lang: 'id-ID',
      tutorials: [
        {
          step: 'STEP 1 OF 3: SELECT DISHES',
          title: '1. Select Menu & Customizations',
          text: 'Pick portions of Lotek, Gado-Gado, or Karedok. Configure spicy level (Cabe 1 s/d 10).'
        },
        {
          step: 'STEP 2 OF 3: CART CALCULATION',
          title: '2. Client-Side Subtotal',
          text: 'Item quantities and prices calculate locally using LocalStorage persistence with zero server database calls.'
        },
        {
          step: 'STEP 3 OF 3: WHATSAPP CHECKOUT',
          title: '3. Direct WhatsApp Checkout',
          text: 'Clicking order compiles all cart items into a clean, sanitized WhatsApp URI payload ready to send directly to the merchant.'
        }
      ],
      components: [
        {
          tag: 'COMPONENT: WA_PAYLOAD_COMPILER',
          title: '1. URL-Encoded WhatsApp Payload Engine',
          desc: 'Transforms the JSON order cart into structured WhatsApp formatting with bold headers, bullet items, and total pricing.',
          filename: 'wa_compiler.js',
          code: `function compileWaPayload(cart, customer) {
  let msg = \`*HALO BUDE, SAYA MAU ORDER:*\\n\\n\`;
  cart.forEach(item => {
    msg += \`• \${item.name} (\${item.qty}x) - Rp \${item.total}\\n\`;
    if (item.notes) msg += \`  _Catatan: \${item.notes}_\\n\`;
  });
  msg += \`\\n*TOTAL: Rp \${calculateTotal(cart)}*\`;
  return \`https://wa.me/\${MERCHANT_PHONE}?text=\${encodeURIComponent(msg)}\`;
}`
        },
        {
          tag: 'COMPONENT: LOCALSTORAGE_PERSIST',
          title: '2. Zero-Database LocalStorage State',
          desc: 'Preserves cart items across accidental refreshes or mobile network drops without requiring a login or session cookie.',
          filename: 'cart_store.js',
          code: `const CartStore = {
  get: () => JSON.parse(localStorage.getItem('bude_cart') || '[]'),
  save: (data) => localStorage.setItem('bude_cart', JSON.stringify(data)),
  clear: () => localStorage.removeItem('bude_cart')
};`
        }
      ]
    },
    'wa-parser': {
      id: 'wa-parser',
      name: 'WA Text & Regex Sanitizer',
      slug: 'wa-text-parser',
      scope: 'Utility & Text',
      srcUrl: 'apps/wa-parser.html',
      downloadName: 'wa-text-parser.html',
      externalUrl: 'apps/wa-parser.html',
      tutorials: [
        {
          step: 'STEP 1 OF 3: PASTE RAW TEXT',
          title: '1. Input Unstructured Notes',
          text: 'Paste any unstructured notes, meeting minutes, or bullet lists into the raw editor pane.'
        },
        {
          step: 'STEP 2 OF 3: REGEX CLEANSE',
          title: '2. Automatic Format & Sanitize',
          text: 'Regex passes strip excess linebreaks, format numbers into bold WhatsApp markdown, and convert bullet dashes to clean emoji points.'
        },
        {
          step: 'STEP 3 OF 3: 1-CLICK CLIPBOARD',
          title: '3. Instant Copy & WhatsApp Link',
          text: 'Click copy to grab the formatted clipboard content or generate a direct wa.me deep-link ready to paste into any chat.'
        }
      ],
      components: [
        {
          tag: 'COMPONENT: REGEX_CLEANSER',
          title: '1. Multi-Stage Regex Pipeline',
          desc: 'Executes chained regular expressions to sanitize raw clipboard text into standard WhatsApp Markdown syntax in sub-millisecond execution time.',
          filename: 'regex_pipeline.js',
          code: `function sanitizeText(raw) {
  return raw
    .replace(/^[•\\-\\*]\\s+/gm, '• ')
    .replace(/(\\d+)\\.\\s+/g, '*$1.* ')
    .replace(/\\n{3,}/g, '\\n\\n')
    .trim();
}`
        },
        {
          tag: 'COMPONENT: CLIPBOARD_API',
          title: '2. Native Async Clipboard Bridge',
          desc: 'Uses modern Navigator Clipboard API with instant visual feedback and legacy fallback for maximum device compatibility.',
          filename: 'clipboard_bridge.js',
          code: `async function copyOutput(text) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();
  return true;
}`
        }
      ]
    },
    'pdf-editor': {
      id: 'pdf-editor',
      name: 'Client PDF Editor & Compress',
      slug: 'client-pdf-editor',
      scope: 'Tools & Privacy',
      srcUrl: 'apps/pdf-editor.html',
      downloadName: 'client-pdf-editor.html',
      externalUrl: 'apps/pdf-editor.html',
      tutorials: [
        {
          step: 'STEP 1 OF 3: LOAD LOCAL FILE',
          title: '1. Drag & Drop PDF',
          text: 'Drop any PDF into the browser viewport. The file stays 100% in local memory and is never uploaded to any remote server.'
        },
        {
          step: 'STEP 2 OF 3: CANVAS RASTERIZE',
          title: '2. Client-Side Page Rendering',
          text: 'PDF pages are rasterized onto HTML5 Canvas elements for fast browser-native preview and thumbnail inspection.'
        },
        {
          step: 'STEP 3 OF 3: WEBP COMPRESSION',
          title: '3. Web Worker Image Compression',
          text: 'A client-side worker recompresses embedded bitmaps into WebP/JPEG, reducing overall file size by up to 85%.'
        }
      ],
      components: [
        {
          tag: 'COMPONENT: CANVAS_RASTERIZER',
          title: '1. Client-Side Page Renderer',
          desc: 'Renders PDF pages directly into offscreen HTML5 canvas elements for private, in-browser document processing without server roundtrips.',
          filename: 'canvas_renderer.js',
          code: `async function renderPageToCanvas(page, scale = 1.5) {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
  return canvas;
}`
        },
        {
          tag: 'COMPONENT: PRIVACY_SANDBOX',
          title: '2. 100% Airgap Execution Sandbox',
          desc: 'Guarantees zero network calls (fetch and XMLHttpRequest disabled in worker scope) ensuring full GDPR and confidential file privacy.',
          filename: 'security_policy.json',
          code: `{
  "network_access": false,
  "server_upload": null,
  "encryption": "in-memory only",
  "offline_capable": true
}`
        }
      ]
    },
    'islam-memes': {
      id: 'islam-memes',
      name: 'Islam BFITW Box Generator',
      slug: 'islam-bfitw-box',
      scope: 'Retro & ASCII',
      srcUrl: 'apps/islam-memes.html',
      downloadName: 'islam-bfitw-box.html',
      externalUrl: 'apps/islam-memes.html',
      tutorials: [
        {
          step: 'STEP 1 OF 3: SELECT QUOTE',
          title: '1. Pick Champion Quote',
          text: 'Select iconic quotes from lightweight king Islam Makhachev ("Who give him belt?", "We have to check this", "Best in the world").'
        },
        {
          step: 'STEP 2 OF 3: MONOSPACE MATRIX',
          title: '2. ASCII Frame Generator',
          text: 'The engine dynamically calculates string byte length and pads clean Unicode box-drawing characters (┌─┐, │ │, └─┘).'
        },
        {
          step: 'STEP 3 OF 3: TERMINAL EXPORT',
          title: '3. 1-Click Terminal Copy',
          text: 'Copy formatted text directly to clipboard for instant pasting into Discord, Twitter/X, or GitHub commit messages.'
        }
      ],
      components: [
        {
          tag: 'COMPONENT: BOX_DRAWING_ALGORITHM',
          title: '1. Dynamic ASCII Box-Drawing Engine',
          desc: 'Calculates string width across multi-line strings to draw pixel-perfect monospace borders with aligned corner joints.',
          filename: 'ascii_box.js',
          code: `function drawBox(text) {
  const lines = text.split('\\n');
  const width = Math.max(...lines.map(l => l.length));
  const top = '┌' + '─'.repeat(width + 2) + '┐';
  const bot = '└' + '─'.repeat(width + 2) + '┘';
  const body = lines.map(l => '│ ' + l.padEnd(width) + ' │').join('\\n');
  return \`\${top}\\n\${body}\\n\${bot}\`;
}`
        }
      ]
    },
    'family-quiz': {
      id: 'family-quiz',
      name: 'Family Quiz Engine',
      slug: 'family-quiz-game',
      scope: 'Game & Audio',
      srcUrl: 'apps/family-quiz.html',
      downloadName: 'family-quiz-game.html',
      externalUrl: 'apps/family-quiz.html',
      tutorials: [
        {
          step: 'STEP 1 OF 3: ROUND COUNTDOWN',
          title: '1. Dynamic Timer Loop',
          text: 'Each question starts a high-tension 15-second countdown loop driven by requestAnimationFrame.'
        },
        {
          step: 'STEP 2 OF 3: SYNTH AUDIO FX',
          title: '2. Web Audio Synthesizer',
          text: 'Zero MP3 or WAV audio assets. All sound effects (correct buzzer, wrong chord, tick countdown) are generated with native Web Audio oscillators.'
        },
        {
          step: 'STEP 3 OF 3: LOCAL LEADERBOARD',
          title: '3. Offline High-Score Board',
          text: 'Scores are recorded in LocalStorage with player names and timestamps without needing any server database.'
        }
      ],
      components: [
        {
          tag: 'COMPONENT: WEB_AUDIO_SYNTH',
          title: '1. Zero-Asset Audio Oscillator Synthesizer',
          desc: 'Synthesizes retro chiptune sound effects entirely with native Web Audio API oscillators and gain nodes without loading external audio files.',
          filename: 'audio_synth.js',
          code: `function playTone(freq, type = 'sine', duration = 0.15) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}`
        }
      ]
    }
  };

  // Explicit Aliases for Trigonometric Unit Circle
  APPS_REGISTRY['radiansincostan'] = APPS_REGISTRY['ksi'];
  APPS_REGISTRY['unit-circle'] = APPS_REGISTRY['ksi'];

  // Constants & Storage
  const STORAGE_KEY_HISTORY = 'arcade_search_history';
  const STORAGE_KEY_SPLIT = 'arcade_bento_split_pct';
  const STORAGE_KEY_STEPS_COLLAPSED = 'arcade_steps_collapsed';

  let activeAppKey = 'ksi';
  let appData = APPS_REGISTRY['ksi'];
  let currentTutorialIdx = 0;
  let currentSlidevIdx = 0;
  const ZOOM_STEPS = [0.5, 0.65, 0.75, 0.85, 0.9, 1.0, 1.1, 1.25, 1.5];
  let currentZoomIdx = ZOOM_STEPS.indexOf(1.0);
  let currentTtsLang = 'en-US';

  function resolveRootBase() {
    if (typeof window === 'undefined') return '/';
    const p = window.location.pathname;
    const pgIdx = p.indexOf('/playground');
    if (pgIdx !== -1) {
      return p.slice(0, pgIdx + 1);
    }
    return p.replace(/[^/]*$/, '');
  }

  function resolveRootUrl(relPath) {
    const rootBase = resolveRootBase();
    if (!relPath) return rootBase;
    if (/^(https?:\/\/|data:|blob:)/i.test(relPath)) return relPath;
    if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
      return relPath.replace(/^\.?\//, '');
    }
    if (relPath.startsWith('/')) return relPath;
    return rootBase + relPath.replace(/^\.?\//, '');
  }

  function resolveAppKeyFromLocation() {
    if (typeof window !== 'undefined' && window.__ARCADE_CURRENT_SLUG__) {
      return window.__ARCADE_CURRENT_SLUG__;
    }
    if (typeof window === 'undefined') return 'radiansincostan';
    const path = window.location.pathname.replace(/\/+$/, '');
    const match = path.match(/\/playground\/([^/?#]+)/i);
    const rawKey = (match && match[1] && !match[1].endsWith('.html'))
      ? decodeURIComponent(match[1])
      : (new URLSearchParams(window.location.search).get('app') || window.location.hash.replace(/^#\/?/, '') || 'radiansincostan');
    if (APPS_REGISTRY[rawKey]) return rawKey;
    if (rawKey === 'radiansincostan' || rawKey === 'unit-circle') return 'radiansincostan';
    const bySlug = Object.values(APPS_REGISTRY).find(a => a.slug === rawKey || a.id === rawKey);
    return bySlug ? bySlug.id : 'radiansincostan';
  }

  function syncCleanPlaygroundUrl(push = false) {
    if (typeof window === 'undefined' || window.location.protocol === 'file:') return;
    try {
      const cleanPath = `${resolveRootBase()}playground/${activeAppKey}`;
      if (window.location.pathname !== cleanPath || window.location.search) {
        if (push) {
          window.history.pushState({ app: activeAppKey }, '', cleanPath);
        } else {
          window.history.replaceState({ app: activeAppKey }, '', cleanPath);
        }
      }
    } catch (e) { }
  }

  function getTtsEngine() {
    if (typeof window === 'undefined') return null;
    return window.ArcadeTTS || window.ArcadeSpeech || null;
  }

  function stopSlideSpeech() {
    const engine = getTtsEngine();
    if (engine && typeof engine.stop === 'function') {
      engine.stop();
    }
    updateTtsButtonUI('idle', currentTtsLang);
  }

  function updateTtsButtonUI(state, lang, meta) {
    if (lang) currentTtsLang = lang;
    const ttsLangBtn = document.getElementById('ttsLangBtn');
    const ttsSpeakBtn = document.getElementById('ttsSpeakBtn');

    if (ttsLangBtn) {
      const isId = String(currentTtsLang).toLowerCase().startsWith('id');
      ttsLangBtn.textContent = isId ? '🌐 ID' : '🌐 EN';
      ttsLangBtn.title = isId ? 'Bahasa Indonesia (Click to switch to English)' : 'English (Click to switch to Bahasa Indonesia)';
    }
    if (ttsSpeakBtn) {
      const isSpeaking = state === 'speaking';
      ttsSpeakBtn.classList.toggle('is-speaking', isSpeaking);
      ttsSpeakBtn.textContent = isSpeaking ? '⏹ Stop' : '🔊 Speak';
      const engine = getTtsEngine();
      const src = (meta && meta.source) || (engine && engine.getCacheSource ? engine.getCacheSource() : '');
      if (src && src !== 'NONE') {
        ttsSpeakBtn.title = `Read Slide Aloud [${src}]`;
      }
    }
  }

  function getActiveSlideSpeechText() {
    const comp = appData.components && appData.components[currentSlidevIdx];
    if (!comp) return '';
    return `${comp.title}. ${comp.desc}`;
  }

  function applyScreenZoom() {
    const frameWrapper = document.getElementById('frameWrapper');
    const zoomResetBtn = document.getElementById('zoomResetBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const scale = ZOOM_STEPS[currentZoomIdx] || 1.0;

    if (frameWrapper) {
      frameWrapper.style.setProperty('--stage-zoom', String(scale));
    }
    if (zoomResetBtn) zoomResetBtn.textContent = Math.round(scale * 100) + '%';
    if (zoomOutBtn) zoomOutBtn.disabled = currentZoomIdx <= 0;
    if (zoomInBtn) zoomInBtn.disabled = currentZoomIdx >= ZOOM_STEPS.length - 1;
  }

  function syncGithubRepoButton() {
    const githubRepoBtn = document.getElementById('githubRepoBtn');
    const cartridgeActionGrid = document.getElementById('cartridgeActionGrid');
    const comp = appData.components && appData.components[currentSlidevIdx];
    const ghUrl = (comp && comp.githubUrl) || appData.githubUrl || '';
    if (githubRepoBtn && cartridgeActionGrid) {
      if (ghUrl) {
        githubRepoBtn.href = ghUrl;
        githubRepoBtn.style.display = 'inline-flex';
        cartridgeActionGrid.classList.remove('no-github');
      } else {
        githubRepoBtn.removeAttribute('href');
        githubRepoBtn.style.display = 'none';
        cartridgeActionGrid.classList.add('no-github');
      }
    }
  }

  function renderTutorial() {
    const tutorialStepLabel = document.getElementById('tutorialStepLabel');
    const tutorialTitle = document.getElementById('tutorialTitle');
    const tutorialText = document.getElementById('tutorialText');
    const tutorialCollapsedPreview = document.getElementById('tutorialCollapsedPreview');
    const prevTutorialBtn = document.getElementById('prevTutorialBtn');
    const nextTutorialBtn = document.getElementById('nextTutorialBtn');

    const tut = appData.tutorials[currentTutorialIdx];
    if (!tut) return;

    if (tutorialStepLabel) tutorialStepLabel.textContent = tut.step;
    if (tutorialTitle) tutorialTitle.textContent = tut.title;
    if (tutorialText) tutorialText.textContent = tut.text;
    if (tutorialCollapsedPreview) tutorialCollapsedPreview.textContent = `— ${tut.title}`;

    if (prevTutorialBtn) prevTutorialBtn.disabled = currentTutorialIdx === 0;
    if (nextTutorialBtn) {
      nextTutorialBtn.textContent = (currentTutorialIdx === appData.tutorials.length - 1) ? '✓ Done' : 'Next ▶';
    }
  }

  function renderSlidev() {
    stopSlideSpeech();
    const comp = appData.components && appData.components[currentSlidevIdx];
    if (!comp) return;

    const slidevCounterPill = document.getElementById('slidevCounterPill');
    const slidevIndicatorText = document.getElementById('slidevIndicatorText');
    const slidevElementTag = document.getElementById('slidevElementTag');
    const slidevHeading = document.getElementById('slidevHeading');
    const slidevDescription = document.getElementById('slidevDescription');
    const codeFilename = document.getElementById('codeFilename');
    const codeSnippetBody = document.getElementById('codeSnippetBody');
    const prevSlidevBtn = document.getElementById('prevSlidevBtn');
    const nextSlidevBtn = document.getElementById('nextSlidevBtn');

    const total = appData.components.length;
    if (slidevCounterPill) slidevCounterPill.textContent = `0${currentSlidevIdx + 1} / 0${total}`;
    if (slidevIndicatorText) slidevIndicatorText.textContent = `${currentSlidevIdx + 1} / ${total}`;

    if (slidevElementTag) slidevElementTag.textContent = comp.tag;
    if (slidevHeading) slidevHeading.textContent = comp.title;
    if (slidevDescription) slidevDescription.innerHTML = comp.desc;
    if (codeFilename) codeFilename.textContent = comp.filename;
    if (codeSnippetBody) codeSnippetBody.textContent = comp.code;

    if (prevSlidevBtn) prevSlidevBtn.disabled = currentSlidevIdx === 0;
    if (nextSlidevBtn) nextSlidevBtn.disabled = currentSlidevIdx === total - 1;

    syncGithubRepoButton();

    const ttsEng = getTtsEngine();
    const detectedLang = comp.lang || appData.lang || (ttsEng && typeof ttsEng.detectLanguage === 'function'
      ? ttsEng.detectLanguage(`${comp.title} ${comp.desc}`)
      : 'en-US');
    if (ttsEng) {
      const setLangFn = ttsEng.setLang || ttsEng.setLanguage;
      if (typeof setLangFn === 'function') setLangFn.call(ttsEng, detectedLang);
    }
    updateTtsButtonUI('idle', detectedLang);
  }

  function initApp() {
    stopSlideSpeech();
    const isInSubfolderApp = typeof window !== 'undefined' && /\/apps\/[^/]+\//.test(window.location.pathname);
    const isInAppsDir = typeof window !== 'undefined' && (
      window.location.pathname.includes('/apps/') || 
      Boolean(window.__ARCADE_CURRENT_SLUG__) ||
      (document.body && document.body.getAttribute('data-app-slug'))
    );

    const defaultAppFile = isInSubfolderApp ? 'index.html' : `${appData.slug || activeAppKey}.html`;
    const resolvedSrc = isInAppsDir ? defaultAppFile : resolveRootUrl(appData.srcUrl);
    const resolvedExt = isInAppsDir ? defaultAppFile : resolveRootUrl(appData.externalUrl);
    const resolvedLib = isInSubfolderApp ? '../../page-apps.html' : (isInAppsDir ? '../page-apps.html' : resolveRootUrl('page-apps.html'));

    const breadcrumbAppName = document.getElementById('breadcrumbAppName');
    const bentoCartridgeTitle = document.getElementById('bentoCartridgeTitle');
    const downloadAppBtn = document.getElementById('downloadAppBtn');
    const openExternalTabBtn = document.getElementById('openExternalTabBtn');
    const liveAppIframe = document.getElementById('liveAppIframe');

    if (breadcrumbAppName) breadcrumbAppName.textContent = appData.slug || activeAppKey;
    if (bentoCartridgeTitle) bentoCartridgeTitle.textContent = `📐 ${(appData.name || activeAppKey).toUpperCase()}`;
    if (downloadAppBtn) {
      downloadAppBtn.href = resolvedSrc;
      downloadAppBtn.setAttribute('download', appData.downloadName || `${activeAppKey}.html`);
    }
    if (openExternalTabBtn) openExternalTabBtn.href = resolvedExt;

    document.querySelectorAll('a[href="library.html"], a[href="apps.html"], a[href="page-apps.html"]').forEach(link => {
      link.href = resolvedLib;
    });

    if (liveAppIframe) {
      if (appData.srcUrl && appData.srcUrl.includes('compiled-sites/') && window.ArcadeDownloader) {
        liveAppIframe.removeAttribute('src');
        liveAppIframe.srcdoc = window.ArcadeDownloader.synthesizeStandaloneHtml(appData.id);
      } else {
        liveAppIframe.removeAttribute('srcdoc');
        liveAppIframe.src = resolvedSrc;
      }
    }

    syncCleanPlaygroundUrl(false);
    applyScreenZoom();
    renderTutorial();
    renderSlidev();
  }

  function switchActiveApp(newAppKey) {
    if (!APPS_REGISTRY[newAppKey]) return;
    stopSlideSpeech();
    activeAppKey = newAppKey;
    appData = APPS_REGISTRY[activeAppKey];
    currentTutorialIdx = 0;
    currentSlidevIdx = 0;
    syncCleanPlaygroundUrl(true);
    initApp();
  }

  function init() {
    if (typeof document === 'undefined') return;
    activeAppKey = resolveAppKeyFromLocation();

    if (typeof window !== 'undefined' && window.__ARCADE_APP_META__) {
      const meta = window.__ARCADE_APP_META__;
      const key = meta.slug || meta.id || activeAppKey;
      if (!APPS_REGISTRY[key] || APPS_REGISTRY[key] === APPS_REGISTRY['ksi']) {
        APPS_REGISTRY[key] = {
          id: key,
          name: meta.title || key,
          slug: key,
          scope: meta.category || meta.sector || 'App',
          srcUrl: `${key}.html`,
          downloadName: `${key}.html`,
          externalUrl: `${key}.html`,
          githubUrl: meta.linkGithub || '',
          lang: 'en-US',
          tutorials: meta.tutorials || (APPS_REGISTRY['ksi'] ? APPS_REGISTRY['ksi'].tutorials : []),
          components: meta.components || (APPS_REGISTRY['ksi'] ? APPS_REGISTRY['ksi'].components : [])
        };
      }
      activeAppKey = key;
    }

    appData = APPS_REGISTRY[activeAppKey] || APPS_REGISTRY['radiansincostan'] || APPS_REGISTRY['ksi'];
    initApp();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  return {
    APPS_REGISTRY: APPS_REGISTRY,
    init: init,
    initApp: initApp,
    switchActiveApp: switchActiveApp,
    renderTutorial: renderTutorial,
    renderSlidev: renderSlidev,
    applyScreenZoom: applyScreenZoom,
    stopSlideSpeech: stopSlideSpeech
  };
});
