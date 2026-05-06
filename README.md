# 🗃️ cagd-log

A flexible, zero-dependency logging library for **Node.js** and **Bun**. Supports multiple log levels, JSON or plain-text output, custom log levels, and hot-reload configuration — with no external runtime dependencies.

---

## 📢 Upgrade Notice

**Upgrading from v1.0.x?** See the [Upgrade Guide](#-upgrade-guide) for v1.1.0 breaking changes (JSON log format).  
**Upgrading from v0.0.8?** See the [v1.0.0 section](#upgrading-from-v008-to-v100) of the Upgrade Guide.

---

## 🚀 Installation

```sh
npm install cagd-log
```

```sh
bun add cagd-log
```

---

## 📌 Usage

```js
const log = require("cagd-log");

log.info("Server started on port 3000");
log.warn("High memory usage detected");
log.error("Database connection failed");
log.debug({ user: "admin", action: "login" });

// Custom log levels
log.log("security", "Suspicious login attempt from 192.168.1.1");
log.log("audit",    "User profile updated");
log.log("payment",  "Transaction failed: insufficient funds");
```

---

## ⚙️ Configuration

Configuration can be set via **environment variables**, the **`setConfig()` method**, or a **config file on disk**. All three approaches support hot-reload — no restart required.

### Option A: Environment variables *(recommended for production)*

```bash
# Point directly to a config file
export CAGD_LOG_CONFIG_PATH="/etc/myapp/logger.config.js"

# Or set location and filename separately
# Defaults: location="log", filename="cagd-log.config"
export CAGD_LOG_CONFIG_LOCATION="config"
export CAGD_LOG_CONFIG_FILENAME="logger"

# Force production mode (overrides dev_mode in config)
export NODE_ENV="production"
```

### Option B: `setConfig()` *(recommended for development)*

```js
const log = require("cagd-log");

log.setConfig({
    dev_mode: true,
    log: {
        path:          "/log/",
        type:          "json",    // "json" | "text"
        merge:         false,     // true → single "all.json" file
        arg_splitter:  "|"
    },
    time: {
        locales: "en-US",
        zone:    "Europe/Istanbul"
    }
});
```

Config is written to disk and reloaded immediately. **No restart needed.**

> **Note:** Functions (e.g. custom `types` formatters) cannot be persisted to disk. They apply for the current process only. A warning is shown when this happens.

### Option C: Config file

Place a `cagd-log.config.js` file in the `log/` directory (or at the path specified by environment variables):

```js
// log/cagd-log.config.js
module.exports = {
    dev_mode: true,
    log: { type: "json", merge: false },
    time: { zone: "Europe/Istanbul" }
};
```

Only the options you specify are overridden — all other options fall back to their defaults.

---

## 🔧 Configuration Reference

| Option             | Type       | Default    | Description |
|--------------------|------------|------------|-------------|
| `dev_mode`         | `boolean`  | `false`    | When `true`, `info` and `debug` logs are printed to the console. Forced to `false` when `NODE_ENV=production`. |
| `log.path`         | `string`   | `"log/"`   | Directory where log files are stored. Accepts absolute or relative paths. |
| `log.type`         | `string`   | `"json"`   | Log file format. `"json"` or `"text"`. |
| `log.merge`        | `boolean`  | `false`    | When `true`, all levels are written to a single `all.json` / `all.log` file. |
| `log.arg_splitter` | `string`   | `"\|"`     | Separator between arguments in plain-text logs. |
| `time.locales`     | `string`   | `"en-US"`  | Locale used to format timestamps. |
| `time.zone`        | `string`   | `"UTC"`    | Timezone for timestamps (e.g. `"Europe/Istanbul"`). |
| `types.info`       | `function` | Green INFO  | Returns the console label for `info` logs. |
| `types.warn`       | `function` | Yellow WARN | Returns the console label for `warn` logs. |
| `types.error`      | `function` | Red ERROR   | Returns the console label for `error` logs. |
| `types.debug`      | `function` | Blue DEBUG  | Returns the console label for `debug` logs. |
| `types.log`        | `function` | White LOG   | Returns the console label for custom `log` calls. |

---

## 🛠️ Methods

### `log.info(...args)`
Logs at the `info` level. Console output suppressed unless `dev_mode` is `true`.

### `log.debug(...args)`
Logs at the `debug` level. Console output suppressed unless `dev_mode` is `true`.

### `log.warn(...args)`
Logs at the `warn` level. Always printed to the console.

### `log.error(...args)`
Logs at the `error` level. Always printed to the console.

### `log.log(level, ...args)`
Logs at a **custom level**. The level name is used as the filename (`security.json`, `audit.log`, etc.) and is always printed to the console. Uses `console.log()` internally since custom levels are not part of the standard console API.

### `log.setConfig(cfg)`
Writes the given config object to disk and reloads options immediately. Merges with defaults — only keys you provide are changed. Passing functions is allowed but they will not be persisted across restarts (a warning is shown).

---

## 📂 Log Storage

By default, logs are saved in the `log/` directory relative to `process.cwd()`.

```
log/
├── info.json       # log.info() calls
├── warn.json       # log.warn() calls
├── error.json      # log.error() calls
├── debug.json      # log.debug() calls
├── security.json   # log.log("security", ...) calls
└── all.json        # everything, when merge: true
```

**JSON record format (v1.1.0+):**
```json
{
  "timestamp": 1746614400000,
  "filename": "src/server.js",
  "level": "error",
  "message": "Database connection failed"
}
```

When multiple arguments are passed, `message` is an array:
```json
{
  "timestamp": 1746614400000,
  "filename": "src/server.js",
  "level": "debug",
  "message": ["User object:", { "id": 1, "name": "Alice" }]
}
```

**Plain-text format:**
```
07/05/26, 14:00:00 file:src/server.js [ERROR]: Database connection failed
```

---

## 🔄 Dev Mode & Production

| Scenario | `info` / `debug` in console | `warn` / `error` in console |
|---|---|---|
| `dev_mode: false` (default) | ❌ | ✅ |
| `dev_mode: true` | ✅ | ✅ |
| `NODE_ENV=production` | ❌ (forced) | ✅ |

All levels are always **written to disk** regardless of `dev_mode`.

---

## 🔼 Upgrade Guide

### Upgrading from v1.0.x to v1.1.0

#### Breaking changes

**JSON log `message` field format changed.**

Previously, multiple arguments were stored as a numbered object:
```json
{ "message": { "0": "hello", "1": "world" } }
```

They are now stored as a plain array:
```json
{ "message": ["hello", "world"] }
```

Single arguments are stored directly (not wrapped):
```json
{ "message": "hello" }
```

If you parse existing `.json` log files programmatically, update your parsing logic accordingly.

**`type` field replaced by `level` in merged mode.**

In `merge: true` mode, the per-record `type` field has been renamed to `level` for consistency with non-merged records.

---

### Upgrading from v0.0.8 to v1.0.0

#### Breaking changes

The old `setConfig({ location, filename })` API is **deprecated** but still works — you will see a deprecation warning in the console.

#### Migration

```js
// ⚠️ Old (v0.0.8) — still works, shows deprecation warning
log.setConfig({ location: "log", filename: "cagd-log.config" });

// ✅ New (v1.0.0+) — recommended
log.setConfig({
    dev_mode: true,
    log:  { path: "log/", type: "json" },
    time: { zone: "Europe/Istanbul" }
});
```

Alternatively, use environment variables (see [Option A](#option-a-environment-variables-recommended-for-production) above) — the cleanest approach for production.

---

## 📜 License

MIT


---

*README and CHANGELOG were written with AI assistance.*