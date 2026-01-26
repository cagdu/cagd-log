# 🗃️ CagD-Log

[![npm version](https://img.shields.io/npm/v/cagd-log.svg)](https://www.npmjs.com/package/cagd-log)
[![license](https://img.shields.io/npm/l/cagd-log.svg)](https://github.com/cagdu/cagd-log/blob/main/LICENSE)
[![node version](https://img.shields.io/node/v/cagd-log.svg)](https://nodejs.org)
[![npm downloads](https://img.shields.io/npm/dm/cagd-log.svg)](https://www.npmjs.com/package/cagd-log)

📝 **cagd-log** is a flexible and easy-to-use logging library for Node.js applications. It supports multiple log levels, scoped/namespaced logging, and can store logs in JSON or plain text format.

## 📢 Upgrade Notice - v1.1.0

**New in v1.1.0:** Scoped/Namespaced logging support! See [Scoped Logger Guide](SCOPED-LOGGER-GUIDE.md) for details.

**Upgrading from v0.0.8?** See [Upgrade Guide](#-upgrade-guide) below for details. Old code still works but will show deprecation warnings.

## Changelog  
For the latest changes, see [CHANGELOG.md](CHANGELOG.md) or follow updates on [GitHub](https://github.com/cagdu/cagd-log/commits/main/).

## 🚀 Installation  

Install the package using npm:  

```sh
npm install cagd-log
```  

## 📌 Quick Start

```javascript
const log = require("cagd-log");

// First run - you'll see a helpful message about configuration
log.info("Hello World!");
// [cagd-log] Using default configuration. To customize, use:
//   log.setConfig({ dev_mode: true, log: { path: "/log/" } })
//   Or set: CAGD_LOG_CONFIG_PATH environment variable

// Configure once to silence the message
log.setConfig({
    dev_mode: true,
    log: { path: "/logs/", type: "json" }
});

// Now use it freely
log.info("Application started");
log.error("Something went wrong");
log.log("custom", "Custom level message");
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

// Scoped/Namespaced logging (new feature!)
const paymentLog = log.log("payment");
paymentLog.warn("High transaction volume");
paymentLog.error("Payment failed", { orderId: 123 });

// Or chain directly
log.log("database").info("Connected to database");
log.log("database").error("Connection timeout");
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

### `log.log(level, ...messages)` ⭐ **NEW: Custom Levels & Scoped Logging**

**Two usage modes:**

1. **Custom Level Mode** (with 2+ arguments):
   ```javascript
   log.log("security", "Failed login attempt");
   // Creates: security.json
   // Output: [SECURITY] Failed login attempt
   ```

2. **Scoped Logger Mode** (with 1 argument - returns a logger):
   ```javascript
   const paymentLog = log.log("payment");
   paymentLog.warn("High volume");    // Creates: payment-warn.json
   paymentLog.error("Failed");        // Creates: payment-error.json
   
   // Or chain directly:
   log.log("database").info("Connected");  // Creates: database-info.json
   ```

**Benefits of Scoped Logging:**
- Organize logs by category/module (payment, database, api, etc.)
- Use standard severity levels (warn, error, info, debug) within each category
- Files are named: `{category}-{level}.json` (e.g., `payment-error.json`)
- JSON logs include `"category"` field for easy filtering
- Can be styled by adding custom formatters to the `types` configuration

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

### � Scoped Logger Examples

Organize your logs by category/module:

```javascript
const log = require("cagd-log");

// Configure custom colors for categories
log.setConfig({
    dev_mode: true,
    log: { path: "/logs/", type: "json" },
    types: {
        payment: () => "\x1b[32m💳 PAYMENT\x1b[0m",
        security: () => "\x1b[41m🔒 SECURITY\x1b[0m",
        database: () => "\x1b[36m🗄️  DATABASE\x1b[0m"
    }
});

// Create scoped loggers for different modules
const paymentLog = log.log("payment");
const dbLog = log.log("database");
const securityLog = log.log("security");

// Each category uses standard severity levels
paymentLog.info("Payment gateway initialized");
paymentLog.warn("High transaction volume detected");
paymentLog.error("Payment processing failed", { orderId: 123 });

dbLog.info("Connected to database");
dbLog.warn("Slow query detected", { duration: "2.5s" });
dbLog.error("Connection pool exhausted");

securityLog.warn("Multiple failed login attempts");
securityLog.error("Brute force attack detected", { ip: "192.168.1.1" });

// Or use one-liners for quick logging
log.log("api").info("Server started on port 3000");
log.log("api").error("Route not found: /invalid");

// Results in organized log files:
// logs/payment-info.json, payment-warn.json, payment-error.json
// logs/database-info.json, database-warn.json, database-error.json
// logs/security-warn.json, security-error.json
// logs/api-info.json, api-error.json
```

### �🎨 Custom Level Styling

You can define custom formatters for your custom log levels:

```javascript
const log = require("cagd-log");

// Configure custom levels with their own colors and formatting
log.setConfig({
    dev_mode: true,
    log: {
        path: "/log/",
        type: "json"
    },
    types: {
        // Standard levels (optional, can override defaults)
        info: () => "\x1b[32mINFO\x1b[0m",
        warn: () => "\x1b[33mWARN\x1b[0m",
        error: () => "\x1b[31mERROR\x1b[0m",
        debug: () => "\x1b[34mDEBUG\x1b[0m",
        
        // Custom levels with colors
        audit: () => "\x1b[35m🔍 AUDIT\x1b[0m",      // Magenta
        security: () => "\x1b[41m🔒 SECURITY\x1b[0m", // Red background
        payment: () => "\x1b[32m💳 PAYMENT\x1b[0m",   // Green
        critical: () => "\x1b[31m\x1b[1m⚠️  CRITICAL\x1b[0m" // Bold red
    }
});

// Now use them with beautiful formatting
log.log("audit", "User profile updated");
log.log("security", "Failed login attempt");
log.log("payment", "Transaction completed: $150");
log.log("critical", "Database connection lost!");

// You can still use standard methods
log.error("Standard error message");
log.info("Standard info message");
```

**ANSI Color Codes:**
- `\x1b[31m` - Red
- `\x1b[32m` - Green  
- `\x1b[33m` - Yellow
- `\x1b[34m` - Blue
- `\x1b[35m` - Magenta
- `\x1b[36m` - Cyan
- `\x1b[37m` - White
- `\x1b[1m` - Bold
- `\x1b[41m` - Red background
- `\x1b[0m` - Reset

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

## 🔧 Troubleshooting

### Config file not found warning

**Problem:** You see: `[cagd-log] Config not found at: /path/to/config, using defaults`

**Solution:**
- If you want to use custom config, create the file at the specified path
- Or use `log.setConfig()` to create it automatically
- Or ignore it - default config works fine!

### Logs not appearing in console

**Problem:** `log.info()` or `log.debug()` doesn't show in console

**Possible causes:**
1. **dev_mode is false** - Set `dev_mode: true` in config
2. **NODE_ENV=production** - This forces dev_mode to false
   ```bash
   unset NODE_ENV  # or set NODE_ENV=development
   ```

### Log files not being created

**Problem:** No log files in the specified directory

**Solutions:**
1. Check if directory path is correct (relative to `process.cwd()`)
2. Ensure write permissions for the directory
3. Check console for error messages
4. Try absolute path: `log: { path: "/absolute/path/logs/" }`

### TypeError: Cannot read properties of undefined

**Problem:** `TypeError: Cannot read properties of undefined (reading 'locales')`

**Solution:** Your config is incomplete. Use `log.setConfig()` with full config or let it merge with defaults automatically (v1.1.0+).

### Scoped logger not working

**Problem:** `log.log("category")` doesn't return a logger object

**Solution:** Make sure you're using only ONE argument:
```javascript
// ✓ Correct - returns scoped logger
const paymentLog = log.log("payment");

// ✗ Wrong - logs with custom level
log.log("payment", "message");  // This is custom level mode
```

### ANSI colors not showing

**Problem:** Console output shows escape codes instead of colors

**Solution:**
- Some terminals don't support ANSI colors
- Try a different terminal (VS Code terminal, iTerm2, Windows Terminal)
- Or disable colors by customizing `types` config

### Permission denied error

**Problem:** `EACCES: permission denied, mkdir '/log'`

**Solution:**
- Log path `/log/` is absolute (root directory)
- Use relative path: `log: { path: "log/" }` or `log: { path: "./logs/" }`
- Or use absolute path in your home dir: `path: "/home/user/logs/"`

## 📜 License  

This project is licensed under the MIT License.