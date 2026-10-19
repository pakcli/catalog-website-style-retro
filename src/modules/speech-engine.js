/**
 * ============================================================================
 * MODULE: Language-Aware Text-to-Speech Engine (src/modules/speech-engine.js)
 * Milestone: v01-03_bento-layout-playground
 * Purpose: Fault-tolerant, zero-dependency Web Speech API wrapper with:
 *   1. Feature-Detection Guard (zero crashes on unsupported browsers)
 *   2. Sentence-Chunk Queue (prevents Chrome 15-second utterance freeze)
 *   3. Async Voice Resolver (id-ID Bahasa Indonesia & en-US English)
 *   4. Code & ASCII Wireframe Sanitizer (skips code blocks & box chars)
 *   5. Lifecycle Auto-Cancel (stops ghost audio on navigation/hide)
 * ============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ArcadeSpeech = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEY_LANG = 'arcade_tts_lang';
  const ID_STOPWORDS = /\b(yang|dan|untuk|dengan|pada|adalah|dari|ini|itu|bisa|tanpa|atau|dalam|ke|di|oleh|akan|dapat|secara|langsung|halaman|tombol|klik|geser|layar|aplikasi|kode|langkah)\b/gi;
  const EN_STOPWORDS = /\b(the|and|for|with|from|this|that|without|using|into|click|drag|screen|button|slide|code|step|live|browser|offline|pure|native)\b/gi;

  let cachedVoices = [];
  let isPlaying = false;
  let currentLang = 'en-US'; // 'id-ID' or 'en-US'
  let chunkQueue = [];
  let activeUtterance = null;
  let stateListeners = [];

  /**
   * 1. Feature-Detection Guard
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
   * Load persisted language preference ('id-ID' or 'en-US')
   */
  function loadSavedLang() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANG);
      if (saved === 'id-ID' || saved === 'en-US') {
        currentLang = saved;
      }
    } catch (e) {}
    return currentLang;
  }

  function saveLang(langCode) {
    currentLang = langCode === 'id-ID' ? 'id-ID' : 'en-US';
    try {
      localStorage.setItem(STORAGE_KEY_LANG, currentLang);
    } catch (e) {}
    notifyStateChange();
  }

  /**
   * 3. Async Voice Resolver (id-ID & en-US)
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

    const targetPrefix = (langCode || 'en-US').toLowerCase().slice(0, 2); // 'id' or 'en'
    const matching = voices.filter(v => (v.lang || '').toLowerCase().replace('_', '-').startsWith(targetPrefix));
    if (matching.length === 0) return null;

    // Prefer natural / Google / Microsoft neural voices
    const scored = matching.slice().sort((a, b) => {
      const score = (v) => {
        const name = (v.name || '').toLowerCase();
        let s = 0;
        if (name.includes('natural') || name.includes('online')) s += 5;
        if (name.includes('google') || name.includes('gadis') || name.includes('ardi') || name.includes('aria') || name.includes('guy')) s += 4;
        if (v.localService) s += 2;
        if (v.default) s += 1;
        return s;
      };
      return score(b) - score(a);
    });

    return scored[0] || matching[0];
  }

  /**
   * 4. Code & ASCII Sanitizer
   */
  function sanitizeForSpeech(rawInput) {
    if (!rawInput) return '';
    let text = String(rawInput);

    // Strip <pre>...</pre> and <code>...</code> blocks
    text = text.replace(/<pre[\s\S]*?<\/pre>/gi, ' ');
    text = text.replace(/```[\s\S]*?```/g, ' ');
    // Keep inline <code> text readable but remove tags
    text = text.replace(/<\/?[^>]+(>|$)/g, ' ');
    // Strip URLs
    text = text.replace(/https?:\/\/\S+/gi, ' ');
    // Strip ASCII box-drawing, arrows, and decorative symbols
    text = text.replace(/[\u2500-\u257F\u2580-\u259F═━│┃┌┐└┘├┤┬┴┼▸▾◀▶●★⚡📺🔬📋⬇️↗🐙🔊⏹🌐]/g, ' ');
    // Strip markdown formatting chars
    text = text.replace(/[#*_`~>|]/g, ' ');
    // Collapse whitespace
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  }

  /**
   * Lexical Language Auto-Detector ('id-ID' vs 'en-US')
   */
  function detectLanguage(text, explicitHint) {
    if (explicitHint) {
      const h = String(explicitHint).toLowerCase().trim();
      if (h.startsWith('id') || h === 'indonesian' || h === 'bahasa') return 'id-ID';
      if (h.startsWith('en') || h === 'english') return 'en-US';
    }
    const clean = sanitizeForSpeech(text);
    if (!clean) return currentLang;

    const idMatches = (clean.match(ID_STOPWORDS) || []).length;
    const enMatches = (clean.match(EN_STOPWORDS) || []).length;

    if (idMatches > enMatches && idMatches >= 2) return 'id-ID';
    if (enMatches > idMatches && enMatches >= 2) return 'en-US';
    return currentLang;
  }

  /**
   * 2. Sentence-Chunk Splitter (<= 160 chars per chunk to prevent Chrome freeze)
   */
  function splitIntoChunks(text, maxLen) {
    const limit = maxLen || 160;
    const clean = sanitizeForSpeech(text);
    if (!clean) return [];

    const rawSentences = clean.split(/(?<=[.!?।])\s+|\n+/);
    const chunks = [];

    rawSentences.forEach(sentence => {
      const trimmed = sentence.trim();
      if (!trimmed) return;
      if (trimmed.length <= limit) {
        chunks.push(trimmed);
      } else {
        // Split long sentence by comma or space
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

  let activeOptionsCallback = null;
  let cancelTimer = null;

  function notifyStateChange() {
    const stateStr = isPlaying ? 'speaking' : 'idle';
    const payload = {
      state: stateStr,
      isPlaying: isPlaying,
      lang: currentLang,
      shortLang: currentLang.startsWith('id') ? 'ID' : 'EN',
      supported: isSupported()
    };
    if (typeof activeOptionsCallback === 'function') {
      try { activeOptionsCallback(stateStr, currentLang, payload); } catch (e) {}
    }
    stateListeners.forEach(fn => {
      try { fn(payload, stateStr, currentLang); } catch (e) {}
    });
  }

  function playNextChunk() {
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

      const voice = pickBestVoice(currentLang);
      if (voice) {
        try { utter.voice = voice; } catch (e) {}
      }

      utter.onend = function () {
        if (isPlaying) {
          playNextChunk();
        }
      };

      utter.onerror = function (ev) {
        // Ignore 'interrupted' or 'canceled' events triggered by prior cancel()
        if (ev && (ev.error === 'interrupted' || ev.error === 'canceled')) {
          return;
        }
        if (isPlaying && chunkQueue.length > 0) {
          playNextChunk();
          return;
        }
        isPlaying = false;
        chunkQueue = [];
        activeUtterance = null;
        notifyStateChange();
      };

      activeUtterance = utter;
      synth.speak(utter);
    } catch (e) {
      isPlaying = false;
      chunkQueue = [];
      activeUtterance = null;
      notifyStateChange();
    }
  }

  /**
   * Speak text in current or detected language
   */
  function speak(rawText, options) {
    if (!isSupported()) return false;
    const opts = options || {};
    if (typeof opts.onStateChange === 'function') {
      activeOptionsCallback = opts.onStateChange;
    }

    if (cancelTimer) {
      clearTimeout(cancelTimer);
      cancelTimer = null;
    }

    const synth = window.speechSynthesis;
    const hadActiveSpeech = Boolean(synth && (synth.speaking || synth.pending));
    if (hadActiveSpeech) {
      try { synth.cancel(); } catch (e) {}
    }

    if (opts.lang) {
      currentLang = String(opts.lang).toLowerCase().startsWith('id') ? 'id-ID' : 'en-US';
    } else if (opts.autoDetect) {
      currentLang = detectLanguage(rawText, opts.hintLang);
    }

    chunkQueue = splitIntoChunks(rawText, 160);
    if (chunkQueue.length === 0) {
      isPlaying = false;
      notifyStateChange();
      return false;
    }

    isPlaying = true;
    notifyStateChange();

    // Chromium Windows bug workaround: if synth.cancel() was just called,
    // wait 45ms before calling synth.speak() so Chromium doesn't cancel the new utterance.
    if (hadActiveSpeech) {
      cancelTimer = setTimeout(function () {
        cancelTimer = null;
        if (isPlaying) playNextChunk();
      }, 45);
    } else {
      playNextChunk();
    }
    return true;
  }

  /**
   * 5. Stop / Cancel Active Speech Safely
   */
  function stop() {
    if (cancelTimer) {
      clearTimeout(cancelTimer);
      cancelTimer = null;
    }
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

  function toggleLanguage(rawTextIfRestart) {
    const next = currentLang.startsWith('id') ? 'en-US' : 'id-ID';
    const wasPlaying = isPlaying;
    saveLang(next);
    if (wasPlaying && rawTextIfRestart) {
      speak(rawTextIfRestart, { lang: next });
    }
    return currentLang;
  }

  function onStateChange(callback) {
    if (typeof callback === 'function') {
      stateListeners.push(callback);
    }
  }

  // Initialize Voices & Lifecycle Auto-Cancel
  if (typeof window !== 'undefined') {
    loadSavedLang();
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
    isSpeaking: function () { return isPlaying; },
    onStateChange: onStateChange
  };
});
