# 📄 Changelog

All notable changes to this project will be documented in this file.

---

## [0.2.4] – 2025-07-24

### ✨ Added

- Emoji 🔺 "upload"
- Emoji 🔻 "download"
- Emoji 🫆 "fingerprint"
- Emoji 🔐 "secure"
- Introduced color and mode to context based logging allowing to switch colors and decide whether to use full frame layout, marking start and end of context only or not visually render any context styles at all

### 🧼 Improved

- Accidently had typescript ^5 in peerDependencies causing some conflicts/warnings when installing Loggify to projects

### 🐛 Fixed

- Fixed space on some emojis being rendered to close to the next information

---

## [0.2.3] – 2025-07-21

### 🐛 Fixed

- Error => ReferenceError: \_\_filename is not defined

---

## [0.2.2] – 2025-07-21

### 🐛 Fixed

- Error => needs an import attribute of type "json" in combination with package.json

---

## [0.2.1] – 2025-07-20

### ✨ Added

- GrafanaLoki support for REST API Authorization has been implemented, supporting basic as well as bearer token

---

## [0.2.0] – 2025-07-20

> **Highlights:** Native integration to GrafanaLoki

### ✨ Added

- ![implemented](https://img.shields.io/badge/status-implemented-brightgreen) ![beta](https://img.shields.io/badge/stability-beta-yellow)  
  **Native Grafana Loki Integration** via HTTP Push API – no dependencies required

### 🧼 Improved

- Added indentation to the JSON object to move it more away from the left border
- Introduced "logTypeBadge" with modes: "off", "tiny", "mini", "full"

### 🐛 Fixed

- Fixed broken frame rendering in context mode when using object

### ⚠️ Breaking

- ![breaking](https://img.shields.io/badge/change-breaking-red)  
  The boolean "typeTagUseEmoji" to control whether an emoji should be shown as log type indicator has been removed in favor of "logTypeBadge"

---
