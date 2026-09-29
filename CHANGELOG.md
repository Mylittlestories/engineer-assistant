# Changelog

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
