# Engineer Assistant

Professional desktop/web assistant for marine engineering troubleshooting, vessel calculations, offline knowledge cards, and online AI support through Gemini.

## What is fixed

- Proper Vite/React configuration.
- Clean production build from source instead of committed generated asset references.
- Local Express API with health check and AI settings endpoints.
- Online AI works in browser or desktop through a locally stored Gemini API key.
- Safer professional prompt for marine engineering diagnostics.
- Electron desktop shell so non-technical users can run the app as a normal desktop program.
- Windows `.exe` build scripts through `electron-builder`.

## Requirements for developers

- Node.js 20 LTS or newer
- npm
- For Windows `.exe` release: build on Windows for the most reliable result

## Run locally as a web app

```bash
npm install
npm run dev
```

Open the local URL printed by the server.

Optional: create `.env` or `.env.local`:

```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
```

You can also configure the API key from inside the app using **AI Settings**.

## Run locally as a desktop app

```bash
npm install
npm run electron:dev
```

This builds the web app, starts a private local backend, then opens the Electron desktop window.

## Build a Windows `.exe`

On a Windows machine:

```bash
npm install
npm run dist:win
```

The installer and portable `.exe` will be created in `release/`.

## Build Linux/macOS packages

```bash
npm run dist:linux
npm run dist:mac
```

## User workflow

1. Install/open **Engineer Assistant**.
2. Use offline tables, calculators, and saved lessons without internet.
3. For online AI help, open **AI Settings** and paste a Gemini API key.
4. Ask engineering questions in the Diagnostic AI Workstation.

## Important safety note

The assistant is a decision-support tool. Always verify limits, torque values, clearances, alarms, isolation procedures, and maintenance actions against the vessel-specific maker manual, SMS, class/flag requirements, and chief engineer/superintendent instructions.

## Automatic GitHub publishing

This repository includes `.github/workflows/release.yml`.

To publish a professional GitHub release with Windows `.exe` artifacts:

```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions will build and attach the Windows installer/portable `.exe` to the release. You can also run the workflow manually from the GitHub **Actions** tab.

## Offline/adaptive AI design

The app is built for ships with limited internet:

- The troubleshooting database, calculators, saved lessons, and exports work offline.
- If online AI is unavailable, the assistant searches the local troubleshooting records and the Offline Lessons Vault.
- **Adaptive Memory** can automatically save successful online AI answers locally.
- Those saved AI/engineer answers become part of the offline answer engine for future similar cases.

This means the app can gradually become more useful for each vessel and crew without requiring constant connectivity.

## PWA / Android preparation release

Version 1.1.0 adds a PWA layer so the same React app can be installed from Android Chrome or desktop browsers where supported.

### PWA offline behavior

- `public/sw.js` caches the app shell and static assets.
- `public/manifest.webmanifest` provides Android/desktop install metadata.
- The app registers the service worker from `src/pwa.ts`.
- A small install/offline prompt appears in the UI when installation is available or when the device goes offline.
- API/AI calls are intentionally not cached. If internet is unavailable, the existing Offline Engineering Advisor searches local records and Adaptive Memory.

### Android Capacitor path

Capacitor dependencies and configuration are included, but the large native `android/` project is not committed yet. Generate it on a development machine with Android Studio installed:

```bash
npm install
npm run android:add
npm run android:sync
npm run android:open
```

For a debug APK after the Android project is generated:

```bash
npm run android:build:debug
```

Recommended production path:

1. Test the PWA on Android Chrome first.
2. Improve phone/tablet UI where needed.
3. Generate the Capacitor Android project.
4. Build a signed `.aab` in Android Studio for Google Play or a signed `.apk` for private distribution.

The already published Windows desktop release remains separate. PWA/Android preparation is published under its own version tag.

## Android native alpha release

Version 1.2.0 adds the generated Capacitor Android project and a GitHub Actions Android build job.

### Android debug APK from GitHub Releases

On version tags, GitHub Actions now builds and attaches a debug APK named like:

```txt
Engineer-Assistant-Android-v1.2.0-debug.apk
```

This APK is for shipboard/private testing, not Google Play production. For production release, build a signed release APK/AAB in Android Studio with your own keystore.

### Build Android locally

Requirements:

- Android Studio
- Android SDK
- Java 17

Commands:

```bash
npm install
npm run android:sync
cd android
./gradlew assembleDebug
```

The debug APK will be created under:

```txt
android/app/build/outputs/apk/debug/app-debug.apk
```

### Production Android note

Before Google Play publication, still needed:

- signed release keystore
- app icon/splash polish
- privacy policy
- final mobile UI testing on real phones/tablets
- release `.aab` build
