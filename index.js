const fs = require("node:fs"), path = require("node:path"), util = require("node:util");

/**
 * CagD-Log - Main logger class (Singleton pattern)
 * 
 * A flexible and easy-to-use logging utility for Node.js applications.
 * Supports multiple log levels, custom levels, scoped/namespaced logging,
 * and stores logs in JSON or plain text format.
 * 
 * @class Log
 * @example
 * const log = require("cagd-log");
 * log.info("Server started");
 * log.error("Connection failed", { code: 500 });
 * 
 * @example
 * // Scoped logging
 * const paymentLog = log.log("payment");
 * paymentLog.error("Transaction failed");
 * 
 * @see https://github.com/cagdu/cagd-log
 */
class Log {
    static instance;
    options = {};
    configPath = null;

    /**
     * Constructor - implements singleton pattern
     * Initializes config path and loads configuration
     * Shows helpful message on first use if using default config
     * @private
     */
    constructor() { 
        if (!Log.instance) { 
            this.configPath = this._resolveConfigPath();
            this.options = this._getConfig();
            
            if (!fs.existsSync(this.configPath)) {
                if (process.env.CAGD_LOG_CONFIG_PATH || process.env.CAGD_LOG_CONFIG_LOCATION || process.env.CAGD_LOG_CONFIG_FILENAME) {
                    console.warn(`[cagd-log] Config not found at: ${this.configPath}, using defaults`);
                } else {
                    console.info(`\x1b[36m[cagd-log]\x1b[0m Using default configuration. To customize, use:\n  \x1b[33mlog.setConfig({ dev_mode: true, log: { path: "/log/" } })\x1b[0m\n  Or set: \x1b[33mCAGD_LOG_CONFIG_PATH\x1b[0m environment variable`);
                }
            }
            Log.instance = this; 
        };
        return Log.instance; 
    }

    /**
     * Get current Unix timestamp in milliseconds
     * @returns {number} Current timestamp
     * @example
     * const now = log.timestamp(); // 1706234567890
     */
    timestamp = () => new Date().getTime();
    
    /**
     * Get formatted current time string based on config.time settings
     * @returns {string} Formatted time string
     * @example
     * const timeStr = log.time(); // "01/26/26, 14:30:45"
     */
    time = () => new Date().toLocaleString(this.options.time.locales, { timeZone: this.options.time.zone, day: "2-digit", hour: "2-digit", hourCycle: "h24", minute: "2-digit", month: "2-digit", second: "2-digit", year: "2-digit" });

    /**
     * Resolve config file path from environment variables or defaults
     * 
     * Priority:
     * 1. CAGD_LOG_CONFIG_PATH - full path
     * 2. CAGD_LOG_CONFIG_LOCATION + CAGD_LOG_CONFIG_FILENAME
     * 3. Default: {cwd}/log/cagd-log.config.js
     * 
     * @private
     * @returns {string} Resolved absolute config file path
     */
    _resolveConfigPath() {
        if (process.env.CAGD_LOG_CONFIG_PATH) {
            let configPath = process.env.CAGD_LOG_CONFIG_PATH;
            if (!path.isAbsolute(configPath)) configPath = path.resolve(process.cwd(), configPath); 
            return configPath;
        }

        let envLocation = process.env.CAGD_LOG_CONFIG_LOCATION || "log";
        let envFilename = process.env.CAGD_LOG_CONFIG_FILENAME || "cagd-log.config";
        
        if (!path.isAbsolute(envLocation)) envLocation = path.resolve(process.cwd(), envLocation);
        if (!envFilename.endsWith(".js")) envFilename += ".js";
        
        return path.join(envLocation, envFilename);
    }

    /**
     * Load and merge configuration from file or use defaults
     * 
     * Merges user config with default config (user overrides defaults).
     * Handles NODE_ENV=production to force dev_mode=false.
     * Includes error handling with fallback to defaults.
     * 
     * @private
     * @returns {Object} Merged configuration object
     */
    _getConfig() {
        try {
            let defaultConfig = require("./default_config.js");
            let userConfig = {};
            
            if (fs.existsSync(this.configPath)) {
                delete require.cache[require.resolve(this.configPath)];
                userConfig = require(this.configPath);
            }
            
            // Merge configs (user config overrides defaults)
            let config = {
                dev_mode: userConfig.dev_mode !== undefined ? userConfig.dev_mode : defaultConfig.dev_mode,
                log: { ...defaultConfig.log, ...(userConfig.log || {}) },
                time: { ...defaultConfig.time, ...(userConfig.time || {}) },
                types: { ...defaultConfig.types, ...(userConfig.types || {}) }
            };
            
            if (process.env.NODE_ENV === "production") config.dev_mode = false;
            return config;
        } catch (error) {
            console.error(`[cagd-log] Error loading config from ${this.configPath}: ${error.message}`);
            let defaultConfig = require("./default_config.js");
            if (process.env.NODE_ENV === "production") defaultConfig.dev_mode = false;
            return defaultConfig;
        }
    }
    /**
     * Check and create folder/file if they don't exist
     * 
     * @private
     * @param {string|null} folder - Folder path to create
     * @param {string|null} file - File path to create
     * @param {string} [filevalue=""] - Initial content for file
     * @returns {void}
     */
    
    _ensureConfigDir() {
    /**
     * Read log file content
     * 
     * Creates file with initial value if doesn't exist.
     * Parses JSON files and validates format.
     * 
     * @private
     * @param {string} file - File path to read
     * @param {string} [type] - File type: "json" or "text" (defaults to config.log.type)
     * @returns {Array|string} Parsed JSON array or text string
     */
        const configDir = path.dirname(this.configPath);
        if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
    }

    _checkFolderOrFile(folder, file, filevalue) {
        if (folder) { if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true }) }
        if (file) { if (!fs.existsSync(file)) fs.writeFileSync(file, filevalue, { encoding: "utf8" }) }
    }

    _readIt(file, type = this.options.log.type) {
        try {
            let value = type === "json" ? "[]" : "";

            this._checkFolderOrFile(null, file, value);
            value = fs.readFileSync(file, { encoding: "utf8" });

            if (type === "json") {
    /**
     * Save log entry to file
     * 
     * Handles file naming for scoped/unscoped logs.
     * Formats log entry based on file type (JSON or text).
     * Creates directory structure if necessary.
     * 
     * @private
     * @param {string} level - Log level (info, warn, error, debug, or custom)
     * @param {string} filename - Source file name where log was called
     * @param {string|null} scope - Category/scope name for namespaced logs
     * @param {...*} args - Values to log
     * @returns {void}
     */
                if (!value.trim().startsWith("[") && !value.trim().endsWith("]")) value = "[]";
                value = JSON.parse(value);
            }

            return value;
        } catch (error) {
            console.error(`[cagd-log] Error reading log file: ${error.message}`);
            return type === "json" ? [] : "";
        }
    }

    _saveIt(level, filename, scope, ...args) {
        try {
            let dir = path.join(process.cwd(), this.options.log.path);

            this._checkFolderOrFile(dir);
    /**
     * Core logging function - saves to file and outputs to console
     * 
     * Handles both standard and scoped logging.
     * Respects dev_mode for info/debug levels.
     * Formats console output with colors and labels.
     * 
     * @private
     * @param {string} level - Log level
     * @param {string|null} scope - Category/scope name (null for standard logs)
     * @param {...*} args - Values to log
     * @returns {void}
     */
            let fileLevel = scope ? (this.options.log.merge ? "all" : `${scope}-${level}`) : (this.options.log.merge ? "all" : level);
            let file = path.join(dir, `${fileLevel}.${this.options.log.type}`), value = this._readIt(file);

            args.map((val, i) => { switch (typeof val) { case "function": args[i] = util.inspect(val); break; case "object": args[i] = JSON.stringify(val, null, 2); break; }; return args[i] })

            if (this.options.log.type === "json") {
    /**
     * Create a scoped logger object
     * 
     * Returns an object with standard log methods (info, warn, error, debug, log)
     * that are bound to the specified scope/category.
     * 
     * @private
     * @param {string} scope - Category/scope name
     * @returns {Object} Scoped logger with standard methods
     * 
     * @example
     * const paymentLog = this._createScopedLogger("payment");
     * paymentLog.error("Failed"); // Logs to payment-error.json
     */
                value.push({ timestamp: this.timestamp(), filename, message: args.reduce((a, b, c) => { a[c] = b; return a; }, {}), ...(scope ? { category: scope } : {}), ...(this.options.log.merge ? { type: level } : {}) }); value = JSON.stringify(value, null, 2);
            }
            else value = `${value}${this.time()} file:${filename}${scope ? ` [${String(scope).toUpperCase()}]` : ""} [${String(level).toUpperCase()}]: ${String(args.join(` ${this.options.log.arg_splitter} `))}\n`;

            return fs.writeFileSync(file, value, { encoding: "utf8" });
        } catch (error) { console.error(`[cagd-log] Error writing log: ${error.message}`); }
    }

    _LogIt(level, scope, ...args) {
        let paths = [path.resolve(module.parent?.filename), path.resolve(process.cwd())], filename = paths[0].startsWith(paths[1]) ? paths[0].substring(paths[1].length) : paths[0];
        this._saveIt(level, filename, scope, ...args);

        if (!this.options.dev_mode && ["info", "debug"].includes(String(level).toLowerCase())) return;

        // Get custom level formatter if exists, or use standard console methods
        const consoleMethod = typeof console[level] === "function" ? console[level] : console.log;
        const levelLabel = this.options.types && this.options.types[level] 
            ? `[${(this.options.types[level])()}]` 
            : `[\x1b[37m${String(level).toUpperCase()}\x1b[0m]`;
        
        const scopeLabel = scope && this.options.types && this.options.types[scope]
            ? `[${(this.options.types[scope])()}]`
            : scope ? `[\x1b[36m${String(scope).toUpperCase()}\x1b[0m]` : "";
        
        return consoleMethod(`[\x1b[35m${this.time()}\x1b[0m] • [\x1b[36m${filename}\x1b[0m]${scopeLabel ? ` • ${scopeLabel}` : ""} • ${levelLabel} •>`, ...args);
    }

    _createScopedLogger(scope) {
        return {
            debug: (...args) => this._LogIt("debug", scope, ...args),
            error: (...args) => this._LogIt("error", scope, ...args),
            info: (...args) => this._LogIt("info", scope, ...args),
            warn: (...args) => this._LogIt("warn", scope, ...args),
            log: (level, ...args) => this._LogIt(level, scope, ...args)
        };
    }

    /**
     * Set or update logger configuration
     * 
     * Changes are applied immediately without restart.
     * Config is saved to disk at the configured path.
     * Supports both new config format and legacy format (with deprecation warning).
     * 
     * @param {Object} cfg - Configuration object
     * @param {boolean} [cfg.dev_mode] - Enable development mode (shows info/debug logs)
     * @param {Object} [cfg.log] - Log file configuration
     * @param {string} [cfg.log.path="/log/"] - Directory path for log files
     * @param {string} [cfg.log.type="json"] - Log format: "json" or "text"
     * @param {boolean} [cfg.log.merge=false] - Merge all logs into single file
     * @param {string} [cfg.log.arg_splitter="|"] - Argument separator character
     * @param {Object} [cfg.time] - Timestamp configuration
     * @param {string} [cfg.time.locales="en-US"] - Locale for time formatting
     * @param {string} [cfg.time.zone="UTC"] - Timezone for timestamps
     * @param {Object} [cfg.types] - Custom formatters for log levels
     * 
     * @returns {void}
     * 
     * @example
     * // Basic configuration
     * log.setConfig({
     *   dev_mode: true,
     *   log: { path: "/logs/", type: "json" }
     * });
    /**
     * Log a debug message
     * 
     * Only displayed in console when dev_mode=true.
     * Always saved to file (debug.json or all.json).
     * 
     * @param {...*} args - Values to log (objects, strings, numbers, etc.)
     * @returns {void}
     * 
     * @example
     * log.debug("Query executed", { sql: "SELECT * FROM users", time: "45ms" });
     * log.debug({ requestId: "abc123", data: responseData });
     */
    debug(...a) { return this._LogIt("debug", null, ...a); }
    
    /**
     * Log an error message
     * 
     * Always displayed in console and saved to file.
     * 
     * @param {...*} args - Values to log (errors, objects, strings, etc.)
     * @returns {void}
     * 
     * @example
     * log.error("Database connection failed");
     * log.error("Payment processing error", new Error("Timeout"));
     * log.error("Critical error", { code: 500, details: errorObj });
     */
    error(...a) { return this._LogIt("error", null, ...a); }
    
    /**
     * Log an informational message
     * 
     * Only displayed in console when dev_mode=true.
     * Always saved to file (info.json or all.json).
     * 
     * @param {...*} args - Values to log
     * @returns {void}
     * 
     * @example
     * log.info("Server started on port 3000");
     * log.info("User logged in", { userId: 123, username: "john" });
     */
    info(...a) { return this._LogIt("info", null, ...a); }
    
    /**
     * Log a warning message
     * 
     * Always displayed in console and saved to file.
     * 
     * @param {...*} args - Values to log
     * @returns {void}
     * 
     * @example
     * log.warn("High memory usage detected");
     * log.warn("Deprecated API usage", { endpoint: "/old-api" });
     */
    warn(...a) { return this._LogIt("warn", null, ...a); }
    
    /**
     * Log with custom level OR create a scoped logger
     * 
     * **Two usage modes:**
     * 
     * 1. **Custom Level Mode** (2+ arguments):
     *    Creates a log with a custom level name
     * 
     * 2. **Scoped Logger Mode** (1 argument):
     *    Returns a scoped logger object with standard methods (info, warn, error, debug)
     * 
     * @param {string} a - Log level name (custom level) or category name (scoped logger)
     * @param {...*} b - Values to log (only in custom level mode)
     * @returns {void|Object} void if custom level mode, ScopedLogger object if scoped mode
     * 
     * @example
     * // Custom level mode
     * log.log("security", "Failed login attempt", { ip: "192.168.1.1" });
     * log.log("audit", "User deleted account");
     * 
     * @example
     * // Scoped logger mode - create variable
     * const paymentLog = log.log("payment");
     * paymentLog.warn("High transaction volume");
     * paymentLog.error("Payment failed", { orderId: 123 });
     * 
     * @example
     * // Scoped logger mode - chain directly
     * log.log("database").info("Connected");
     * log.log("database").error("Connection timeout");
     *
     *   dev_mode: true,
     *   types: {
     *     payment: () => "\x1b[32m💳 PAYMENT\x1b[0m",
     *     security: () => "\x1b[41m🔒 SECURITY\x1b[0m"
     *   }
     * });
     */
    setConfig(cfg = {}) {
        try {
            if (!cfg || typeof cfg !== "object" || Object.keys(cfg).length === 0) {
                return void console.warn(`\x1b[41mWARNING:\x1b[43m Config must be a non-empty object.\x1b[0m`);
            }

            if (cfg.location && cfg.filename && !cfg.log) {
                console.warn(`\x1b[43m⚠️  DEPRECATED:\x1b[0m The setConfig({ location, filename }) API is deprecated.\nUse environment variables or the new config object format instead.\nSee: https://github.com/cagdu/cagd-log#upgrade-guide`);
                
                process.env.CAGD_LOG_CONFIG_LOCATION = cfg.location;
                process.env.CAGD_LOG_CONFIG_FILENAME = cfg.filename;
                this.configPath = this._resolveConfigPath();
                this.options = this._getConfig();
                console.info(`\x1b[42m✓ Config applied successfully\x1b[0m`);
                return;
            }

            this._ensureConfigDir();
            const configContent = `module.exports = ${JSON.stringify(cfg, null, 2)};`;
            fs.writeFileSync(this.configPath, configContent, { encoding: "utf8" });
            this.options = this._getConfig();
            console.info(`\x1b[42m✓ Config updated successfully at: ${this.configPath}\x1b[0m`);
        } catch (error) {
            console.error(`[cagd-log] Error setting config: ${error.message}`);
        }
    }

    debug(...a) { return this._LogIt("debug", null, ...a); }
    error(...a) { return this._LogIt("error", null, ...a); }
    info(...a) { return this._LogIt("info", null, ...a); }
    warn(...a) { return this._LogIt("warn", null, ...a); }
    log(a, ...b) {
        if (arguments.length === 1 && typeof a === "string") {
            return this._createScopedLogger(a);
        }
        return this._LogIt(a, null, ...b);
    }
}

module.exports = new Log();