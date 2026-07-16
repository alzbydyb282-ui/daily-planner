---
name: RTL initialization fix
description: How to prevent layout flash when app starts in Arabic mode
---

In LanguageContext, initialize `language` state from `I18nManager.isRTL` rather than hardcoding `'en'`:

```tsx
const [language, setLanguageState] = useState<Language>(I18nManager.isRTL ? 'ar' : 'en');
```

**Why:** After switching to Arabic, the app calls `I18nManager.forceRTL(true)` then `reloadAppAsync()`. React Native persists the RTL flag across restarts, so `I18nManager.isRTL` is already `true` on the first frame. But `language` defaulted to `'en'`, causing all isRTL-dependent styles to render LTR for a flash before AsyncStorage resolved.

**How to apply:** Any Expo app that derives layout direction from a language stored in AsyncStorage should seed the state from `I18nManager.isRTL` synchronously, then let AsyncStorage confirm it.
