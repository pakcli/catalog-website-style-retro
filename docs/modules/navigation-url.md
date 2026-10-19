---
title: Hash & Query URL Router
module: navigation-url.js
path: src/modules/navigation-url.js
target: page-apps.js, page-playground.js
status: active
version: 2.1.0
---

# 🔗 `navigation-url.js` — URL Router Engine

Handles client-side routing, URL synchronization, and deep-linking without page reloads.

---

## 1. Overview & Architecture

* **State Synchronization**: Uses `history.pushState` and `history.replaceState` to reflect active catalog filters or playground cartridge slugs.
* **Query Parameters**:
  - `?app=<slug>`: Direct link to specific software cartridge.
  - `?view=grid|detail`: Toggles catalog display mode.
  - `?slide=<n>`: Deep-links to specific slide index in Slidev presentation mode.
* **History Listener**: Intercepts `popstate` events to update UI without reloading.

---

## 2. Exported / Internal Functions

* `getParam(name)`: Retrieves query parameter value from current URL.
* `setParam(name, value)`: Updates query parameter in URL without page reload.
* `removeParam(name)`: Cleans parameter from URL bar.
