# Android APK — Cloud Build Guide

This guide gets you an installable Android APK without any local tools.
Everything builds on GitHub's servers using Expo EAS.

---

## One-time setup (5 minutes)

### Step 1 — Get your Expo token

1. Go to **https://expo.dev** → sign up / log in (free)
2. Click your avatar → **Account Settings** → **Access Tokens**
3. Click **Create token** → name it `github-actions` → copy the token

### Step 2 — Add the token to GitHub

1. Open your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
   - Name: `EXPO_TOKEN`
   - Value: paste the token from Step 1
3. Click **Add secret**

### Step 3 — Push this code to GitHub

In Replit, open the **Git** pane (left sidebar or version control icon):
1. Commit any uncommitted changes
2. Add a GitHub remote (if not done yet):  
   `git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git`
3. Push to main

The workflow starts automatically as soon as the push is received.

---

## Triggering a build manually

1. Open your GitHub repo → **Actions** tab
2. Click **Build Android APK** in the left sidebar
3. Click **Run workflow** → **Run workflow**
4. Wait ~20-30 minutes

---

## Downloading your APK

1. Open the completed workflow run
2. Scroll to the bottom → **Artifacts** section
3. Click **daily-planner-android-apk** → a `.zip` downloads
4. Unzip → you have `daily-planner.apk`

### Installing on Android

1. Transfer `daily-planner.apk` to your phone (email, Drive, USB, etc.)
2. On the phone: **Settings → Apps → Special app access → Install unknown apps**
3. Enable for your browser or Files app
4. Tap the APK → Install

---

## App details

| Field | Value |
|-------|-------|
| App name | My Daily Planner / مخططي اليومي |
| Package | `com.dailyplanner.app` |
| Build profile | `preview` (direct APK) |
| Min Android | 5.0 (API 21) |
| Offline | ✅ fully offline, AsyncStorage |
| Notifications | ✅ local scheduled reminders |
| RTL / Arabic | ✅ full RTL layout |
