# 📄 Changelog

All notable changes to this project will be documented in this file.

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
