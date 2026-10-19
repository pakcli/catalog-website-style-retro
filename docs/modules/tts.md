---
title: Retro Voice Speech Synthesizer
module: tts.js
path: src/modules/tts.js
target: page-apps.js, page-playground.js
status: active
version: 2.1.0
---

# 🗣️ `tts.js` — Vintage Text-To-Speech Synthesizer

Web Speech Synthesis engine reading cartridge overviews and presenter notes in a vintage robotic voice.

---

## 1. Overview & Architecture

* **Engine**: Wraps `window.speechSynthesis`.
* **Retro Acoustic Filtering**:
  - Modulates pitch (`0.85`) and speech rate (`1.1`) to mimic vintage 80s speech synthesizers (Texas Instruments / DECtalk).
  - Selects local English/Indonesian robotic voices preferentially.
* **Speaker Controls**: Play, pause, resume, and stop controls with live progress callbacks.

---

## 2. Exported / Internal Functions

* `speak(text, onEndCallback)`: Synthesizes provided string with retro acoustic settings.
* `stop()`: Immediately cancels active voice playback.
* `isSpeaking()`: Returns boolean state of active synthesis.
