# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-26

### ⚠️ BREAKING CHANGES

- **Config API:** Old `setConfig({ location, filename })` format is deprecated but still works with warnings
- **Removed:** `config.json` no longer included in package (not needed)
- **Requires:** Node.js >= 5 (unchanged)

### ✨ NEW FEATURES

- **Custom Log Levels** - Use `log.log("level_name", ...)` for custom levels
- **Environment Variables** - Configure via:
  - `CAGD_LOG_CONFIG_PATH` - Full path to config file
  - `CAGD_LOG_CONFIG_LOCATION` - Config directory (relative or absolute)
  - `CAGD_LOG_CONFIG_FILENAME` - Config filename (with or without `.js`)
- **Hot-Reload Configuration** - No restart needed after `setConfig()`
- **Production Mode** - Auto-detect via `NODE_ENV=production` (forces `dev_mode=false`)
- **Custom Level Console Output** - Custom levels use `console.log()` if not in console API
- **Backward Compatibility** - Old API still works with deprecation warnings

### 🔧 IMPROVEMENTS

- **Better Error Handling** - Try-catch blocks for all file operations
- **Path Resolution** - Proper handling of relative/absolute paths
- **Filename Validation** - Auto-adds `.js` extension if missing
- **Config Fallback** - Gracefully falls back to defaults if config not found
- **Error Messages** - Include full config path in error logs
- **Console Warnings** - User notified when config file not found (if env vars specified)

### 📚 DOCUMENTATION

- Added Upgrade Guide to README.md
- Added CHANGELOG.md
- Added MIGRATION.md (detailed migration guide)
- Updated TypeScript definitions (index.d.ts)

### 🐛 BUG FIXES

- Fixed: Windows path separator handling (`path.sep` instead of hardcoded `\\`)
- Fixed: Filename output path stripping (using `substring` instead of `replace`)
- Fixed: JSON formatting indent (0 → 2 for readability)
- Fixed: Dev mode logic (was inverted, now correct)
- Fixed: Object search using `.includes()` instead of `.find()`

### 📦 Dependencies

- No changes (Node.js built-in modules only)

---

## [0.0.8] - Previous Release

- Initial public release
- Basic logging functionality
- JSON and text file formats
- Config.json based configuration
- Required restart after `setConfig()`
