---
title: Web Speech Command Recognition Engine
module: speech-engine.js
path: src/modules/speech-engine.js
target: page-apps.js, page-playground.js
status: active
version: 2.1.0
---

# 🎙️ `speech-engine.js` — Speech Command Recognition

Web Speech Recognition API wrapper allowing hands-free voice control across presentations and catalog navigation.

---

## 1. Overview & Architecture

* **Engine**: Wraps `window.SpeechRecognition` / `window.webkitSpeechRecognition`.
* **Voice Commands**:
  - `"next slide"` / `"maju"`: Advances Slidev presentation.
  - `"previous slide"` / `"mundur"`: Reverses Slidev presentation.
  - `"fullscreen"`: Toggles fullscreen sandbox mode.
  - `"theme amber"` / `"theme green"`: Swaps active CRT phosphor palette.
* **Telemetry**: Visual microphone status pill showing listening, recognizing, and idle states.

---

## 2. Exported / Internal Functions

* `initSpeechEngine(onCommandCallback)`: Initializes recognition listener.
* `startListening()` & `stopListening()`: Manages microphone recording state.
