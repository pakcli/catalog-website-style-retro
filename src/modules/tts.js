/**
 * ============================================================================
 * MODULE: Hybrid Compiled Text-to-Speech Engine (src/modules/tts.js)
 * Milestone: v01-03_bento-layout-playground
 * Architecture (Mirrors Hybrid Slidev Compiled Pipeline):
 *   1. PUBLIC PRE-COMPILED (Play Compiled in public/):
 *      Uses pre-compiled TTS chunks embedded at build time (0ms parse).
 *   2. CLIENT LOCALSTORAGE CACHE (Play Compiled Client Local Stored):
 *      Checks FNV-1a hash key `arcade_tts_v1_<hash>_<lang>` in localStorage.
 *   3. CLIENT-SIDE COMPILER (Play Compile Client-Side First):
 *      Compiles raw slide text -> strips code/ASCII -> expands math symbols ->
 *      splits into <=160-char chunks -> caches in localStorage -> plays!
 * ============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const instance = factory();
    root.ArcadeTTS = instance;
    root.ArcadeSpeech = instance;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const CACHE_PREFIX = 'arcade_tts_v1_';
  const STORAGE_KEY_LANG = 'arcade_tts_lang';

  const ID_STOPWORDS = /\b(yang|dan|untuk|dengan|pada|adalah|dari|ini|itu|bisa|tanpa|atau|dalam|ke|di|oleh|akan|dapat|secara|langsung|halaman|tombol|klik|geser|layar|aplikasi|kode|langkah|halo|saya|mau|catatan)\b/gi;
  const EN_STOPWORDS = /\b(the|and|for|with|from|this|that|without|using|into|click|drag|screen|button|slide|code|step|live|browser|offline|pure|native|calculates|transforms|renders)\b/gi;

  let cachedVoices = [];
  let isPlaying = false;
  let currentLang = 'en-US';
  let lastCacheSource = 'NONE'; // 'PUBLIC' | 'LOCAL_CACHE' | 'CLIENT_COMPILED'
  let chunkQueue = [];
  let activeUtterance = null;
  let activeOptionsCallback = null;
  let stateListeners = [];
  let cancelTimer = null;
  let watchdogTimer = null;

  /**
   * 1. Fast 32-bit FNV-1a Hash for Content-Addressed TTS Caching (< 0.1ms)
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

  function normalizeLang(langCode) {
    return String(langCode || 'en-US').toLowerCase().startsWith('id') ? 'id-ID' : 'en-US';
  }

  /**
   * 2. Feature-Detection Guard
   */
  function isSupported() {
    try {
      return typeof window !== 'undefined' &&
        'speechSynthesis' in window &&
        typeof window.SpeechSynthesisUtterance === 'function';
    } catch (e) {
      return false;
    }
  }

  /**
   * 3. Sanitize Raw Slide Content & Expand Math Symbols for Speech
   */
  function sanitizeForSpeech(rawInput, langCode) {
    if (!rawInput) return '';
    const isId = normalizeLang(langCode) === 'id-ID';
    let text = String(rawInput);

    // Strip <pre>...</pre> and fenced code blocks
    text = text.replace(/<pre[\s\S]*?<\/pre>/gi, ' ');
    text = text.replace(/```[\s\S]*?```/g, ' ');
    // Strip HTML tags
    text = text.replace(/<\/?[^>]+(>|$)/g, ' ');
    // Strip URLs
    text = text.replace(/https?:\/\/\S+/gi, ' ');

    // Expand common mathematical & technical symbols into natural spoken words
    text = text.replace(/√(\d+)\s*\/\s*(\d+)/g, isId ? 'akar $1 per $2' : 'square root of $1 over $2');
    text = text.replace(/√(\d+)/g, isId ? 'akar $1' : 'square root of $1');
    text = text.replace(/(\d+)\s*\/\s*(\d+)/g, isId ? '$1 per $2' : '$1 over $2');
    text = text.replace(/π/g, 'pi');
    text = text.replace(/θ/g, 'theta');
    text = text.replace(/°/g, isId ? ' derajat ' : ' degrees ');

    // Strip ASCII wireframe box-drawing characters and UI icons
    text = text.replace(/[\u2500-\u257F\u2580-\u259F═━│┃┌┐└┘├┤┬┴┼▸▾◀▶●★⚡📺🔬📋⬇️↗🐙🔊⏹🌐📐]/g, ' ');
    text = text.replace(/[#*_`~>|]/g, ' ');

    return text.replace(/\s+/g, ' ').trim();
  }

  /**
   * 4. Lexical Language Detector ('id-ID' vs 'en-US')
   */
  function detectLanguage(text, explicitHint) {
    if (explicitHint) {
      const h = String(explicitHint).toLowerCase().trim();
      if (h.startsWith('id') || h === 'indonesian' || h === 'bahasa') return 'id-ID';
      if (h.startsWith('en') || h === 'english') return 'en-US';
    }
    const clean = sanitizeForSpeech(text, 'en-US');
    if (!clean) return currentLang;

    const idMatches = (clean.match(ID_STOPWORDS) || []).length;
    const enMatches = (clean.match(EN_STOPWORDS) || []).length;

    if (idMatches > enMatches && idMatches >= 1) return 'id-ID';
    if (enMatches >= idMatches && enMatches >= 1) return 'en-US';
    return currentLang;
  }

  /**
   * 5. Sentence-Chunk Compiler (<= 160 chars per chunk to prevent Chromium freeze)
   */
  function splitIntoChunks(text, langCode, maxLen) {
    const limit = maxLen || 160;
    const clean = sanitizeForSpeech(text, langCode);
    if (!clean) return [];

    const rawSentences = clean.split(/(?<=[.!?])\s+|\n+/);
    const chunks = [];

    rawSentences.forEach(sentence => {
      const trimmed = sentence.trim();
      if (!trimmed) return;
      if (trimmed.length <= limit) {
        chunks.push(trimmed);
      } else {
        const words = trimmed.split(/\s+/);
        let buf = '';
        words.forEach(w => {
          if ((buf + ' ' + w).trim().length > limit) {
            if (buf.trim()) chunks.push(buf.trim());
            buf = w;
          } else {
            buf = (buf ? buf + ' ' : '') + w;
          }
        });
        if (buf.trim()) chunks.push(buf.trim());
      }
    });

    return chunks;
  }

  /**
   * 6. Compile TTS Payload (Used at Build Time for public/ AND Client-Side on 1st Play)
   */
  function compileTtsPayload(rawText, langCode) {
    const lang = normalizeLang(langCode || detectLanguage(rawText));
    const hash = fnv1aHash(rawText);
    const chunksEn = splitIntoChunks(rawText, 'en-US', 160);
    const chunksId = splitIntoChunks(rawText, 'id-ID', 160);
    return {
      hash: hash,
      defaultLang: lang,
      chunks: {
        'en-US': chunksEn,
        'id-ID': chunksId
      },
      compiledAt: Date.now()
    };
  }

  /**
   * 7. 3-STAGE HYBRID TTS RESOLVER:
   *    Stage 1: Play Compiled in public/ (precompiledPayload or window.__ARCADE_PRECOMPILED_TTS__)
   *    Stage 2: Play Compiled from Client localStorage (`arcade_tts_v1_<hash>_<lang>`)
   *    Stage 3: Compile Client-Side First -> Save to localStorage -> Return Chunks
   */
  function resolveCompiledChunks(rawText, langCode, precompiledPayload) {
    const lang = normalizeLang(langCode);
    const hash = fnv1aHash(rawText);
    const storageKey = `${CACHE_PREFIX}${hash}`;

    // STAGE 1: Check Pre-Compiled Payload from public/ build
    if (precompiledPayload && precompiledPayload.hash === hash && precompiledPayload.chunks && Array.isArray(precompiledPayload.chunks[lang])) {
      lastCacheSource = 'PUBLIC';
      return precompiledPayload.chunks[lang].slice();
    }
    if (typeof window !== 'undefined' && window.__ARCADE_PRECOMPILED_TTS__ && window.__ARCADE_PRECOMPILED_TTS__[hash]) {
      const pubEntry = window.__ARCADE_PRECOMPILED_TTS__[hash];
      if (pubEntry && pubEntry.chunks && Array.isArray(pubEntry.chunks[lang])) {
        lastCacheSource = 'PUBLIC';
        return pubEntry.chunks[lang].slice();
      }
    }

    // STAGE 2: Check Client localStorage Compiled Cache
    if (typeof localStorage !== 'undefined') {
      try {
        const rawSaved = localStorage.getItem(storageKey);
        if (rawSaved) {
          const parsed = JSON.parse(rawSaved);
          if (parsed && parsed.hash === hash && parsed.chunks && Array.isArray(parsed.chunks[lang])) {
            lastCacheSource = 'LOCAL_CACHE';
            return parsed.chunks[lang].slice();
          }
        }
      } catch (e) {}
    }

    // STAGE 3: Compile Client-Side First & Store in Client localStorage
    const compiled = compileTtsPayload(rawText, lang);
    lastCacheSource = 'CLIENT_COMPILED';
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(compiled));
      } catch (e) {}
    }
    return (compiled.chunks[lang] || []).slice();
  }

  /**
   * 8. Voice Resolver & Playback Engine
   */
  function refreshVoices() {
    if (!isSupported()) return [];
    try {
      const list = window.speechSynthesis.getVoices();
      if (Array.isArray(list) && list.length > 0) {
        cachedVoices = list;
      }
    } catch (e) {}
    return cachedVoices;
  }

  function pickBestVoice(langCode) {
    const voices = cachedVoices.length > 0 ? cachedVoices : refreshVoices();
    if (!voices || voices.length === 0) return null;

    const targetPrefix = normalizeLang(langCode).slice(0, 2); // 'id' or 'en'
    const matching = voices.filter(v => String(v.lang || '').toLowerCase().replace('_', '-').startsWith(targetPrefix));
    if (matching.length === 0) return null;

    // Prefer reliable local OS voices first so offline/isolated profiles never stall
    const scored = matching.slice().sort((a, b) => {
      const score = (v) => {
        const name = String(v.name || '').toLowerCase();
        let s = 0;
        if (v.localService) s += 5;
        if (name.includes('natural') || name.includes('google') || name.includes('gadis') || name.includes('ardi') || name.includes('david') || name.includes('zira') || name.includes('aria')) s += 3;
        if (v.default) s += 1;
        return s;
      };
      return score(b) - score(a);
    });

    return scored[0] || matching[0];
  }

  function notifyStateChange() {
    const stateStr = isPlaying ? 'speaking' : 'idle';
    const payload = {
      state: stateStr,
      isPlaying: isPlaying,
      lang: currentLang,
      shortLang: currentLang.startsWith('id') ? 'ID' : 'EN',
      source: lastCacheSource,
      supported: isSupported()
    };
    if (typeof activeOptionsCallback === 'function') {
      try { activeOptionsCallback(stateStr, currentLang, payload); } catch (e) {}
    }
    stateListeners.forEach(fn => {
      try { fn(payload, stateStr, currentLang); } catch (e) {}
    });
  }

  function clearTimers() {
    if (cancelTimer) {
      clearTimeout(cancelTimer);
      cancelTimer = null;
    }
    if (watchdogTimer) {
      clearTimeout(watchdogTimer);
      watchdogTimer = null;
    }
  }

  function playNextChunk(useFallbackDefaultVoice) {
    if (!isSupported() || !isPlaying || chunkQueue.length === 0) {
      isPlaying = false;
      activeUtterance = null;
      notifyStateChange();
      return;
    }

    const nextText = chunkQueue.shift();
    try {
      const synth = window.speechSynthesis;
      if (synth.paused) {
        try { synth.resume(); } catch (e) {}
      }

      const utter = new window.SpeechSynthesisUtterance(nextText);
      utter.lang = currentLang;
      utter.rate = 1.0;
      utter.pitch = 1.0;
      utter.volume = 1.0;

      if (!useFallbackDefaultVoice) {
        const voice = pickBestVoice(currentLang);
        if (voice) {
          try { utter.voice = voice; } catch (e) {}
        }
      }

      let hasStarted = false;
      utter.onstart = function () {
        hasStarted = true;
        if (watchdogTimer) {
          clearTimeout(watchdogTimer);
          watchdogTimer = null;
        }
      };

      utter.onend = function () {
        if (watchdogTimer) {
          clearTimeout(watchdogTimer);
          watchdogTimer = null;
        }
        if (isPlaying) {
          playNextChunk(useFallbackDefaultVoice);
        }
      };

      utter.onerror = function (ev) {
        if (watchdogTimer) {
          clearTimeout(watchdogTimer);
          watchdogTimer = null;
        }
        if (ev && (ev.error === 'interrupted' || ev.error === 'canceled')) {
          return;
        }
        // If custom voice failed, retry this chunk once with browser default voice
        if (!useFallbackDefaultVoice && isPlaying) {
          chunkQueue.unshift(nextText);
          playNextChunk(true);
          return;
        }
        if (isPlaying && chunkQueue.length > 0) {
          playNextChunk(true);
          return;
        }
        isPlaying = false;
        chunkQueue = [];
        activeUtterance = null;
        notifyStateChange();
      };

      activeUtterance = utter;
      synth.speak(utter);

      // Watchdog: if Chromium speech queue is paused/stuck after 700ms, kick resume()
      watchdogTimer = setTimeout(function () {
        if (isPlaying && !hasStarted && isSupported()) {
          try {
            window.speechSynthesis.resume();
          } catch (e) {}
        }
      }, 700);
    } catch (e) {
      isPlaying = false;
      chunkQueue = [];
      activeUtterance = null;
      notifyStateChange();
    }
  }

  function speak(rawText, options) {
    if (!isSupported()) return false;
    const opts = options || {};
    if (typeof opts.onStateChange === 'function') {
      activeOptionsCallback = opts.onStateChange;
    }

    clearTimers();

    const synth = window.speechSynthesis;
    const hadActiveSpeech = Boolean(synth && (synth.speaking || synth.pending));
    if (hadActiveSpeech) {
      try { synth.cancel(); } catch (e) {}
    }

    if (opts.lang) {
      currentLang = normalizeLang(opts.lang);
    } else if (opts.autoDetect) {
      currentLang = detectLanguage(rawText, opts.hintLang);
    }

    // 3-Stage Hybrid Resolution: 1. Public Pre-Compiled -> 2. Client LocalStorage -> 3. Client Compile First
    chunkQueue = resolveCompiledChunks(rawText, currentLang, opts.precompiled);
    if (chunkQueue.length === 0) {
      isPlaying = false;
      notifyStateChange();
      return false;
    }

    isPlaying = true;
    notifyStateChange();

    if (hadActiveSpeech) {
      cancelTimer = setTimeout(function () {
        cancelTimer = null;
        if (isPlaying) playNextChunk(false);
      }, 50);
    } else {
      playNextChunk(false);
    }
    return true;
  }

  function stop() {
    clearTimers();
    chunkQueue = [];
    isPlaying = false;
    activeUtterance = null;
    if (isSupported()) {
      try {
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
          window.speechSynthesis.cancel();
        }
      } catch (e) {}
    }
    notifyStateChange();
  }

  function toggleSpeak(rawText, options) {
    if (options && typeof options.onStateChange === 'function') {
      activeOptionsCallback = options.onStateChange;
    }
    if (isPlaying) {
      stop();
      return false;
    }
    return speak(rawText, options);
  }

  function saveLang(langCode) {
    currentLang = normalizeLang(langCode);
    if (typeof localStorage !== 'undefined') {
      try { localStorage.setItem(STORAGE_KEY_LANG, currentLang); } catch (e) {}
    }
    notifyStateChange();
  }

  function toggleLanguage(rawTextIfRestart, precompiled) {
    const next = currentLang.startsWith('id') ? 'en-US' : 'id-ID';
    const wasPlaying = isPlaying;
    saveLang(next);
    if (wasPlaying && rawTextIfRestart) {
      speak(rawTextIfRestart, { lang: next, precompiled: precompiled });
    }
    return currentLang;
  }

  function onStateChange(callback) {
    if (typeof callback === 'function') {
      stateListeners.push(callback);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANG);
      if (saved === 'id-ID' || saved === 'en-US') currentLang = saved;
    } catch (e) {}

    if (isSupported()) {
      refreshVoices();
      try {
        if ('onvoiceschanged' in window.speechSynthesis) {
          window.speechSynthesis.addEventListener('voiceschanged', refreshVoices);
        }
      } catch (e) {}
    }
    window.addEventListener('pagehide', stop);
    window.addEventListener('beforeunload', stop);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && isPlaying) stop();
    });
  }

  return {
    fnv1aHash: fnv1aHash,
    compileTtsPayload: compileTtsPayload,
    resolveCompiledChunks: resolveCompiledChunks,
    isSupported: isSupported,
    speak: speak,
    stop: stop,
    toggle: toggleSpeak,
    toggleSpeak: toggleSpeak,
    toggleLanguage: toggleLanguage,
    detectLanguage: detectLanguage,
    sanitizeForSpeech: sanitizeForSpeech,
    getLanguage: function () { return currentLang; },
    getLang: function () { return currentLang; },
    setLanguage: saveLang,
    setLang: saveLang,
    getCacheSource: function () { return lastCacheSource; },
    isSpeaking: function () { return isPlaying; },
    onStateChange: onStateChange
  };
});
