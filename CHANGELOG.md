# Changelog

## 2.4.0

- Added a dedicated top-level Manuals page so PDF/manual upload is easy to find and no longer hidden inside the engineer tools.
- Rebuilt the manual vault upload flow with one clear “Choose PDF / text file” action, better PDF.js status messages, scanned/protected PDF warnings, browser storage quota handling, manual search, and saved-section management.
- Simplified navigation to Fix, Manuals, Faults, AI, and More across desktop and mobile.
- Refined typography and card styling for a more consistent look across the static page and desktop app.
- Kept Real Troubleshooting Mode, static GitHub Pages Browser Gemini, PDF.js local extraction, PWA/offline support, app icons, and desktop packaging.

## 2.3.0

- Added Real Troubleshooting Mode on the first screen: structured equipment, alarm, symptom, readings, recent work, and checked-items input.
- Added offline expert diagnostic packs for main engine, diesel generators, purifiers, pumps, compressors, boilers, electrical/automation, and general first-principles faults.
- The assistant now builds a safe diagnostic path without needing large PDF uploads: safety actions, missing questions, likely causes, proof checks, stop/escalate criteria, manual data needed, logbook draft, defect draft, and an AI-ready case prompt.
- Simplified the start page further around one primary workflow, with direct shortcuts only for known fault cards, AI, manuals/PDF, and unit conversion.
- Kept static GitHub Pages Browser Gemini, PDF.js manual extraction, PWA/offline support, app icons, and desktop packaging.

## 2.2.0

- Rebuilt the app shell again as a mobile-first workflow instead of a wrapped dashboard: compact top bar, fixed bottom navigation on phones, and clear Start/Faults/AI/Tools screens.
- Simplified the first screen around the question “What do you need right now?” with search, four clear actions, and install/download links.
- Reduced oversized mobile typography, removed header/menu pile-ups, and added calmer module overrides so fault cards, AI, PDF manuals, and engineer tools remain readable.
- Kept static GitHub Pages Browser Gemini mode, PDF.js manual extraction, PWA/offline support, app icons, and desktop packaging.

## 2.1.0

### Changed
- Rebuilt the static page and desktop app shell with a calmer Material Design layout.
- First screen is now a focused dashboard with large action cards instead of showing database, AI, and tools all at once.
- Added clean top navigation for Home, Faults, AI, and Engineer Suite.
- Default theme is now calm light mode, with dark mode still available.

## 2.0.1

### Added
- PDF.js-powered PDF text extraction for the static GitHub Pages manual vault.
- Prominent static web app launch link on the app home screen and at the top of the README.
- README displays the app icon at the top.

### Changed
- Static/PWA cache bumped so GitHub Pages refreshes the updated app shell and icon assets.

## 2.0.0

### Added
- Static GitHub Pages Browser Gemini mode using a user-supplied browser-local Gemini API key.
- Manual / knowledge vault with local search and AI context injection for manual-style citations.
- Professional Engineer Suite with:
  - Guided troubleshooting trees
  - Safety / PTW / LOTO checklists
  - Watch handover logbook with CSV export
  - Running-hour PMS planner
  - Spare parts and special tools inventory
  - Marine calculators
  - Alarm text decoder
  - Defect report generator
  - Photo evidence storage
  - Ship profile
  - Full local backup / restore
  - Emergency mode
  - Training / quiz modules
  - English/Greek technical language helper
- Vitest unit tests for calculators, manual search, alarm decoder, and backup parsing.
- Unique Engineer Assistant icon set for web, PWA, Windows, macOS, Linux, and Android.

### Changed
- GitHub Pages and desktop release workflows now run unit tests before builds.
- AI assistant now enriches Gemini prompts with matching manual snippets and ship profile context.
- UI updated for friendlier daily engine-room use with cards, category filters, and sticky AI assistant.

### Safety
- AI prompts continue to forbid invented torque values, clearances, alarm limits, or procedures when vessel/manual data is not provided.
