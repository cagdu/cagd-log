# Changelog

All notable changes to **cagd-log** will be documented in this file.

---

## [1.1.0] - 2026-05-07

### Breaking Changes
- **JSON log record format changed.** The `message` field in JSON logs previously stored arguments as a numbered object (`{ "0": "foo", "1": "bar" }`). It now stores a single value directly (`"foo"`) or an array (`["foo", "bar"]`) when multiple arguments are passed. Update any code that parses existing log files.
- **`level` field added to JSON records.** All JSON log records now include an explicit `level` field (e.g. `"level": "error"`). In merged mode, this replaces the previous `type` field (which has been removed).

### Added
- `_deepMerge()` — user config is now deep-merged with defaults instead of fully replacing them. Partial configs (e.g. only setting `log.type`) no longer break unset options.
- `_stripNonSerializable()` — functions inside a config object passed to `setConfig()` are now detected and stripped before writing to disk, with a clear warning message.
- Absolute path support for `log.path` config option. Previously only relative paths (resolved from `cwd`) were accepted.

### Fixed
- **JSON parse safety in `_readIt()`** — the malformed-file guard used `&&` (both conditions had to be true) instead of `||`, causing `JSON.parse` to run on partially-broken files like `[abc` and throw. Fixed to `||`.
- **Null-safety in `_LogIt()`** — `module.parent?.filename` could be `null` (e.g. when the module is the entry point). Calling `path.resolve(null)` threw a runtime error. The caller is now resolved with a fallback chain: `module.parent?.filename || process.argv[1] || __filename`.
- **Unexpected object serialization in `_saveIt()`** — objects passed as log arguments were silently converted to JSON strings before being handed to `console`. Native `console` formatting (e.g. `util.inspect`) is now used instead.
- **Missing parent-directory creation in `_checkFolderOrFile()`** — when a log file's parent directory did not exist, writing the file would throw. The parent directory is now created automatically.

### Changed
- Removed `fs-extra` dependency. All file operations now use the built-in `fs` module, removing the only external runtime dependency. This improves Bun compatibility and reduces install size.
- `timestamp()` now uses `Date.now()` instead of `new Date().getTime()` (equivalent, but cleaner).

---

## [1.0.1] - 2026-05-02

### Fixed
- Switched from `node:`-prefixed imports (e.g. `node:path`) to bare imports (e.g. `path`) to fix errors in environments that do not support the `node:` protocol prefix.

---

## [1.0.0] - 2026-04-01

### Breaking Changes
- **Config API changed.** The old `setConfig({ location, filename })` format is deprecated. It still works but logs a deprecation warning. See the [Upgrade Guide](#-upgrade-guide) in the README.
- **`config.json` removed** from the package root.

### Added
- Custom log levels via `log.log("level", ...)`.
- Hot-reload configuration — `setConfig()` applies changes immediately without a process restart.
- Environment variable configuration (`CAGD_LOG_CONFIG_PATH`, `CAGD_LOG_CONFIG_LOCATION`, `CAGD_LOG_CONFIG_FILENAME`).
- Production mode auto-detection via `NODE_ENV=production`.
- TypeScript type definitions.

---

## [0.0.8] and earlier

Legacy releases. No changelog kept.
