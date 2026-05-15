# 📄 Changelog

All notable changes to this project will be documented in this file.

---

## [0.5.6] – 2026-05-15

### ✨ Added

- You can now get the current log level that your instnace of loggify is set to

## [0.5.5] – 2026-05-06

### 🐛 Fixed

- Fixed an issue where getSizeObject when sending an object to console caused an unhandeled exception on circular objects

## [0.5.4] – 2026-05-01

### ✨ Added

- Enhanced callerInformation options on console method to hide information for specific log line or force it when globally enabled or disabled
- Added new feature on console method to render a badge that comes in quite handy if you want to show combind logging of services or namespaces in one console. Define label and set color and inverse to immitate badge look-like

## [0.5.3] – 2025-09-03

### 🧼 Improved

- Added styling for logging when message values is boolean

---

## [0.5.2] – 2025-09-03

### ✨ Added

- Added logType mapping when initializing Loggify letting you use logType emojis on console level and overwriting with what ever value in GrafanaLoki log level

### 🧼 Improved

- Added styling for logging when message values are undefined, null or number

---

## [0.5.1] – 2025-08-15

### 🐛 Fixed

- Banner did not use a default color and caused an ansi replace issue, when no frame color was set

---

## [0.5.0] – 2025-08-01

### ✨ Added

- Loggify banner method allows to render a banner - a frame containing a title and description

---

## [0.4.1] – 2025-07-31

### ✨ Added

- Emoji 🙂 "smiley"

### 🧼 Improved

- Space between emoji for log type metrics and the timestamp information

---

## [0.4.0] – 2025-07-29

### ✨ Added

- When using the caller information you can now disable the function information

### ⚠️ Breaking

- ![breaking](https://img.shields.io/badge/change-breaking-red)  
  The caller level possibilities have been extended and thus the options have been rebuild as an object inside the console options

---

## [0.3.3] – 2025-07-28

### ✨ Added

- Emoji ✨ "create"
- Emoji ➕ "add"
- Emoji ➖ "remove"
- Emoji 🐞 "debug"

### 🧼 Improved

- Optimized the color schema for log types showing the same colors for tiny, mini and full
- Optimized file structure by using asset files

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
