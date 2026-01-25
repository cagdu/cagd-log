# 🗃️ CagD-Log

📝 **cagd-log** is a flexible and easy-to-use logging library for Node.js applications. It supports multiple log levels and can store logs in JSON or plain text format.

## 📢 Upgrade Notice - v1.0.0

**Upgrading from v0.0.8?** See [Upgrade Guide](#-upgrade-guide) below for details. Old code still works but will show deprecation warnings.

## Changelog  
For the latest changes, see [CHANGELOG.md](CHANGELOG.md) or follow updates on [GitHub](https://github.com/cagdu/cagd-log/commits/main/).

## 🚀 Installation  

Install the package using npm:  

```sh
npm install cagd-log
```  

## 📌 Usage  

```javascript
const log = require("cagd-log");

// Standard log levels
log.debug({ user: "AG", action: "Blocked." });
log.info("Server started");
log.warn("High memory usage");
log.error("Database connection failed");

// Custom log levels (new feature!)
log.log("security", "Suspicious login attempt detected");
log.log("audit", "User profile updated");
```

## ⚠️ Configuration

### Using Environment Variables

Set config path via environment variables:

```bash
# Use custom config path
export CAGD_LOG_CONFIG_PATH="/path/to/config.js"

# Or set location and filename separately (default: location="log", filename="cagd-log.config")
export CAGD_LOG_CONFIG_LOCATION="config"
export CAGD_LOG_CONFIG_FILENAME="logger"

# Force production mode (overrides dev_mode setting)
export NODE_ENV="production"
```

### Using setConfig() Method

```javascript
const log = require("cagd-log");

// Config is automatically saved and reloaded without restart
log.setConfig({
    dev_mode: true,
    log: {
        arg_splitter: "|",
        path: "/log/",
        type: "json",
        merge: false
    },
    time: {
        locales: "en-US",
        zone: "UTC"
    }
});
```

**Note:** No restart required! Configuration changes are applied immediately.

### Dev Mode & Production

- `dev_mode: true` → All logs (including `info` and `debug`) are displayed in console
- `dev_mode: false` → Only `warn`, `error`, and custom levels are displayed in console
- If `NODE_ENV=production`, `dev_mode` is **forced to false** regardless of config

## 🔧 Configuration Options  

By default, `cagd-log` uses built-in defaults. If a config file exists at your specified location, it will be loaded. Otherwise, defaults are used.

### Available Options  

| Option             | Type       | Default Value | Description                                                                                 |
|--------------------|------------|---------------|---------------------------------------------------------------------------------------------|
| `dev_mode`         | `boolean`  | `false`       | If `true`, logs will always be displayed in the console, even for `info` and `debug` level. Forced to `false` in production. |
| `log.arg_splitter` | `string`   | `\|`          | Character used to separate arguments in logs.                                               |
| `log.path`         | `string`   | `/log/`       | Directory where logs are stored.                                                            |
| `log.type`         | `string`   | `json`        | Log file format (`json` or `text`).                                                         |
| `log.merge`        | `boolean`  | `false`       | If `true`, all logs are merged into a single file instead of separate files for each level. |
| `time.locales`     | `string`   | `en-US`       | Locale for formatting timestamps.                                                           |
| `time.zone`        | `string`   | `UTC`         | Time zone used for timestamps. (e.g. `Europe/Istanbul`)                                     |
| `types.info`       | `function` | Green `INFO`  | Function returning the formatting of `info` log level.                                      |
| `types.warn`       | `function` | Yellow `WARN` | Function returning the formatting of `warn` log level.                                      |
| `types.error`      | `function` | Red `ERROR`   | Function returning the formatting of `error` log level.                                     |
| `types.debug`      | `function` | Blue `DEBUG`  | Function returning the formatting of `debug` log level.                                     |
| `types.log`        | `function` | White `LOG`   | Function returning the formatting of `log` log level.                                       |

## 🛠️ Log Methods  

### `log.info(...messages)`  
Logs an informational message.  

### `log.warn(...messages)`  
Logs a warning message.  

### `log.error(...messages)`  
Logs an error message.  

### `log.debug(...messages)`  
Logs a debug message (useful for development).  

### `log.log(level, ...messages)` ⭐ **NEW: Custom Levels**
Logs a message with a custom log level. The custom level:
- Is saved to a file with that level name (`custom-level.json` or `custom-level.log`)
- Is displayed in the console output
- Uses `console.log()` for output (since custom levels don't exist in console API)

## 🎯 Example  

```javascript
const log = require("cagd-log");

// Standard levels
log.info("Server started on port 3000");
log.warn("Memory usage is high");
log.error("Failed to connect to the database");
log.debug({ user: "admin", action: "login" }, "Debug info");

// Custom levels
log.log("audit", "User deleted account");
log.log("security", "Brute force attempt detected from 192.168.1.1");
log.log("payment", "Transaction failed: insufficient funds");

// Results in:
// - log/audit.json (or audit.log)
// - log/security.json (or security.log)
// - log/payment.json (or payment.log)
```

## 📂 Log Storage  

Logs are saved in the directory specified in config (`/log/` by default).  

- **JSON format (`.json`)** – Logs are stored as structured JSON data.  
- **Plain text format (`.log`)** – Logs are saved in a human-readable format.  
- **Merged logs** – If `merge: true`, all logs are stored in `all.json` or `all.log`
- **Custom levels** – Each custom level gets its own file

## � Upgrade Guide

### Upgrading from v0.0.8 to v1.0.0

#### Breaking Changes

- **Config API changed:** Old `{ location, filename }` format is **deprecated** but still works
- **Package no longer includes `config.json`** at the root

#### Backward Compatibility

Your old code will still work with deprecation warnings:

```javascript
// ⚠️ OLD WAY (v0.0.8) - Still works but shows warning
const log = require("cagd-log");
log.setConfig({ location: "log", filename: "cagd-log.config" });
```

```
⚠️  DEPRECATED: The setConfig({ location, filename }) API is deprecated.
Use environment variables or the new config object format instead.
```

#### Migration Options

**Option A: No changes needed** (Keep using old API)
- Code continues to work
- You'll see deprecation warnings in console
- Works indefinitely for backward compatibility

**Option B: Migrate to new API** (Recommended)

```javascript
// ✅ NEW WAY - No warnings, cleaner code
const log = require("cagd-log");
log.setConfig({
    dev_mode: true,
    log: { path: "/log/", type: "json" },
    time: { zone: "Europe/Istanbul" }
});
```

**Option C: Use environment variables** (Best for production)

```bash
export NODE_ENV=production
export CAGD_LOG_CONFIG_PATH="/etc/myapp/logger.config.js"
# or
export CAGD_LOG_CONFIG_LOCATION="config"
export CAGD_LOG_CONFIG_FILENAME="logger.config"
```

#### What's New in v1.0.0

✨ **Features:**
- Custom log levels support (`.log("security", ...)`)
- Hot-reload configuration without restart
- Environment variable configuration
- Production mode auto-detection
- Better error handling and path resolution

🔧 **Improvements:**
- No restart needed after `setConfig()`
- Sensible defaults (no required setup)
- Full TypeScript support
- Better error messages

See [CHANGELOG.md](CHANGELOG.md) for full details.

## �📜 License  

This project is licensed under the MIT License.