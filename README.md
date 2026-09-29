# Engineer Assistant

<p align="center">
  <img src="public/icons/icon-192.png" alt="Engineer Assistant app icon" width="128" height="128" />
</p>

<p align="center">
  <strong>Professional Marine Engineering Toolkit</strong><br />
  Offline-first troubleshooting, safety checklists, calculators, PDF.js manual vault, static GitHub Pages Browser Gemini AI, and desktop/server Gemini AI for shipboard use.
</p>

<p align="center">
  <a href="https://mylittlestories.github.io/engineer-assistant/"><strong>Launch the Static Web App</strong></a>
  ·
  <a href="https://github.com/Mylittlestories/engineer-assistant/releases">Download Desktop Releases</a>
</p>

## What it does

- Searchable offline troubleshooting database for propulsion engines, generators, fuel systems, pumps, separators, and safety-critical alarms.
- Chief Engineer AI panel with three modes:
  - **Browser Gemini mode for GitHub Pages:** the user enters their own Gemini API key in the app; the key is stored only in that browser's local storage.
  - **Desktop/server mode:** uses Gemini through the local Node API when a backend key is configured.
  - **Offline database mode:** no internet or key required; answers are matched from the onboard records.
- Friendlier card-based UI with quick search, category filters, safety-first fault cards, and sticky AI assistant.
- Unit converter for pressure, temperature, viscosity, and torque.
- LOTO and quick-reference panels.
- PDF.js-powered manual/PDF text extraction in the static web app.
- PWA support for installable/offline browser use.
- Electron desktop packaging for Windows, Linux, and macOS.
- Proper app icons for web/PWA, Windows, macOS, Linux, and Android launcher assets.

Professional Engineer Suite modules include manual vault, guided troubleshooting trees, safety/PTW checklists, watch logbook, PMS planner, spare parts inventory, alarm decoder, defect reports, photo evidence, backup/restore, ship profile, emergency mode, training, and technical language helper.

## AI on static GitHub Pages

GitHub Pages cannot run a private Node backend, so the static site cannot safely use a repository-stored secret. The implemented solution is **Browser Gemini**:

1. Deploy the static PWA to GitHub Pages.
2. Open the app.
3. Click the **AI Settings** gear in the AI panel.
4. Paste your own Gemini API key from Google AI Studio.
5. Ask questions normally.

The key is saved only in that browser with `localStorage`. It is not committed to the repo and is not added to the build artifact.

PDF.js is bundled into the static build, so PDF manuals can be uploaded and converted to local searchable text directly in the browser before being sent as AI context.

> Security note: browser-side Gemini is convenient for personal/static use, but the key is still visible to that browser session. For a public production app, restrict the key by HTTP referrer in Google Cloud, monitor quotas, or use Firebase AI Logic / a private backend.

## Live web app on GitHub Pages

This repository includes a GitHub Actions workflow that builds and deploys the static PWA to GitHub Pages.

### Enable Pages once

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push to `main`/`master`, or run **Deploy GitHub Pages** manually from the Actions tab.

After deployment, the app will be available at:

```text
https://mylittlestories.github.io/engineer-assistant/
```

## Desktop executables

The release workflow builds downloadable desktop packages:

| Platform | Output |
| --- | --- |
| Windows | NSIS installer `.exe` and portable `.exe` |
| Linux | `.AppImage` and `.deb` |
| macOS | Universal `.dmg` |

### Create a release from GitHub Actions

1. Commit the changes.
2. Create and push a version tag, for example:

   ```bash
   git tag v2.0.1
   git push origin v2.0.1
   ```

3. The **Build Desktop Apps** workflow will build all platforms and attach the files to a GitHub Release.

You can also run the workflow manually from **Actions → Build Desktop Apps** and enter a tag such as `v2.0.1`.

## Local development

Requirements:

- Node.js **22.12.0 or newer**
- npm 10+

```bash
npm ci
npm run dev
```

Open the local URL printed in the terminal.

## Useful commands

```bash
npm run lint          # Type-check
npm run build:web     # Build the static web/PWA app
npm run build:pages   # Build GitHub Pages artifact with 404 fallback and .nojekyll
npm run build         # Build web app + Node server bundle
npm run start         # Start the production Node server from dist/
npm run electron:dev  # Build and launch Electron locally
npm run dist:win      # Build Windows installer + portable EXE
npm run dist:linux    # Build Linux AppImage + DEB
npm run dist:mac      # Build universal macOS DMG
npm run clean         # Remove generated artifacts
```

## Configure Gemini AI in desktop/server mode

### Option 1: In-app settings

1. Open the desktop/server build.
2. Click the **AI Settings** gear in the AI panel.
3. Paste your Gemini API key in the desktop/server section and save.

The desktop app stores the key in the OS app-data directory, not in the repository.

### Option 2: Environment variable

Create `.env.local` or `.env` locally:

```bash
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
```

Then run:

```bash
npm run build
npm run start
```

## Using a separate API backend with the static frontend

If you deploy the Node server elsewhere and want the GitHub Pages frontend to call it, build with:

```bash
VITE_API_BASE_URL=https://your-api.example.com npm run build:pages
```

Set the backend environment variable `ALLOWED_ORIGINS` so the server permits the Pages origin, for example:

```bash
ALLOWED_ORIGINS=https://mylittlestories.github.io
```

## Security and safety notes

- GitHub Pages builds do **not** store or ship a private Gemini key.
- Browser Gemini stores a user-supplied key only in that user's browser local storage.
- Electron uses `contextIsolation`, renderer sandboxing, a local loopback API server, and restricted external navigation.
- The app is a decision-support tool. Always verify exact limits, torque values, clearances, alarms, and procedures against the vessel-specific maker manual and company SMS.

## License

See [LICENSE](LICENSE).
