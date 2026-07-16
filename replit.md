# My Daily Planner / مخططي اليومي

A bilingual (Arabic/English) personal daily planner mobile app built with Expo. Users can create daily schedules, add/edit/delete tasks, track completions, and receive local reminders.

## Run & Operate

- `pnpm --filter @workspace/daily-planner run dev` — run the Expo dev server
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- Expo SDK 54 + Expo Router (file-based routing)
- React Native + TypeScript
- AsyncStorage for local persistence (no backend)
- expo-notifications for local scheduled reminders
- react-native-reanimated for animations
- Inter font (Google Fonts)

## Where things live

- `artifacts/daily-planner/` — the Expo mobile app
- `artifacts/daily-planner/app/(tabs)/` — main tabs: Today, Tasks, Settings
- `artifacts/daily-planner/app/task-form.tsx` — Add/Edit task modal
- `artifacts/daily-planner/context/TasksContext.tsx` — task CRUD + AsyncStorage + notifications
- `artifacts/daily-planner/context/LanguageContext.tsx` — Arabic/English toggle, translations, RTL
- `artifacts/daily-planner/constants/colors.ts` — indigo/dark theme tokens

## Architecture decisions

- Frontend-only: all data stored with AsyncStorage, no backend needed
- RTL via `I18nManager.forceRTL()` + `reloadAppAsync()` — language switch triggers app reload for true RTL
- expo-notifications pinned to ~0.32.17 (Expo SDK 54 compatible version)
- UUID generation uses `Date.now() + Math.random().toString(36)` pattern (no uuid package — crashes on iOS)

## Product

- **Today tab**: Date strip showing ±2 weeks, tasks for selected day sorted by time, stats bar
- **Tasks tab**: All tasks grouped by date in section list
- **Settings tab**: Language toggle (Arabic/English), notifications permission, about
- **Task form modal**: Title, description, date navigator, time spinner (hour/minute), category pills (Work/Personal/Health/Other), priority pills (Low/Medium/High), reminder toggle

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- expo-notifications requires ~0.32.17 for Expo SDK 54 (not the latest 57.x)
- AsyncStorage is already pre-installed as a devDependency at version 2.2.0
- Switching language reloads the app via `reloadAppAsync()` — this is intentional for RTL to take effect

## Pointers

- See the `pnpm-workspace` skill for workspace structure
- See the `expo` skill for Expo-specific guidelines
