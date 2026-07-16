---
name: Arabic textTransform uppercase
description: textTransform:'uppercase' corrupts Arabic text — never use it unconditionally
---

`textTransform: 'uppercase'` in StyleSheet has no valid meaning in Arabic (Arabic has no case) and causes React Native to render garbled characters on some devices.

**Why:** Arabic script is abjad — there are no uppercase/lowercase variants. The CSS/RN transformation pipeline can produce unexpected glyph substitutions.

**How to apply:** Remove `textTransform: 'uppercase'` from any style that may be applied to Arabic text. If you need visual emphasis, increase `letterSpacing` slightly or use `fontFamily: 'Inter_600SemiBold'` instead.
