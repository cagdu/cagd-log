/**
 * CagD-Log - A flexible and easy-to-use logging library for Node.js
 * @see https://github.com/cagdu/cagd-log
 */

/**
 * Configuration object for the logger.
 * All properties are optional and will fall back to defaults if not provided.
 */
declare interface LogConfig {
    /**
     * Enable development mode.
     * When true, all log levels (including info and debug) are displayed in console.
     * When false, only warn, error, and custom levels are shown.
     * 
     * @default false
     * @note Automatically forced to false when NODE_ENV=production
     */
    dev_mode?: boolean;

    /**
     * Log file configuration
     */
    log?: {
        /**
         * Character used to separate multiple arguments in log messages
         * @default "|"
         */
        arg_splitter?: string;

        /**
         * Directory path where log files will be stored (relative to process.cwd())
         * @default "/log/"
         */
        path?: string;

        /**
         * Log file format
         * @default "json"
         */
        type?: "json" | "text";

        /**
         * If true, all log levels are merged into a single file (all.json or all.log).
         * If false, each log level gets its own file (info.json, error.json, etc.)
         * @default false
         */
        merge?: boolean;
    };

    /**
     * Timestamp configuration
     */
    time?: {
        /**
         * Locale string for timestamp formatting
         * @default "en-US"
         * @example "en-US", "tr-TR", "de-DE"
         */
        locales?: string;

        /**
         * Timezone for timestamps
         * @default "UTC"
         * @example "UTC", "Europe/Istanbul", "America/New_York"
         */
        zone?: string;
    };

    /**
     * Custom formatting functions for log level labels in console output.
     * Each function receives an optional label string and returns a formatted string.
     * 
     * @example
     * types: {
     *   info: () => "\x1b[32m INFO \x1b[0m",
     *   custom: () => "\x1b[35m CUSTOM \x1b[0m"
     * }
     */
    types?: {
        [level: string]: (label?: string) => string;
    };
}

/**
 * @deprecated Legacy configuration format (v0.0.8 and below)
 * Use LogConfig or environment variables instead.
 * This format still works but shows deprecation warnings.
 */
declare interface LegacyConfig {
    /**
     * @deprecated Use environment variable CAGD_LOG_CONFIG_LOCATION instead
     */
    location: string;

    /**
     * @deprecated Use environment variable CAGD_LOG_CONFIG_FILENAME instead
     */
    filename: string;
}

/**
 * Scoped logger interface - provides standard log methods within a category/namespace.
 * Created by calling log.log(category) with a single argument.
 * 
 * @example
 * const paymentLog = log.log("payment");
 * paymentLog.error("Payment failed");  // Creates: payment-error.json
 */
declare interface ScopedLogger {
    /**
     * Log an info message within this scope
     * @param args - Values to log
     */
    info(...args: any[]): void;

    /**
     * Log a warning message within this scope
     * @param args - Values to log
     */
    warn(...args: any[]): void;

    /**
     * Log an error message within this scope
     * @param args - Values to log
     */
    error(...args: any[]): void;

    /**
     * Log a debug message within this scope
     * @param args - Values to log
     */
    debug(...args: any[]): void;

    /**
     * Log a message with a custom level within this scope
     * @param level - Custom log level name
     * @param args - Values to log
     * 
     * @example
     * const apiLog = log.log("api");
     * apiLog.log("request", "GET /users");  // Creates: api-request.json
     */
    log(level: string, ...args: any[]): void;
}

/**
 * Main logger class (Singleton pattern).
 * 
 * Configuration Priority:
 * 1. process.env.CAGD_LOG_CONFIG_PATH - Full path to config file
 * 2. process.env.CAGD_LOG_CONFIG_LOCATION + CAGD_LOG_CONFIG_FILENAME
 * 3. Default: ./log/cagd-log.config.js
 * 4. If config file not found, uses built-in defaults
 * 
 * @example
 * const log = require("cagd-log");
 * 
 * // Configure
 * log.setConfig({
 *   dev_mode: true,
 *   log: { path: "/logs/", type: "json" }
 * });
 * 
 * // Use
 * log.info("Server started");
 * log.error("Connection failed", { code: 500 });
 * log.log("security", "Suspicious activity detected");
 */
declare class Log {
    /**
     * Set logger configuration.
     * 
     * Changes are applied immediately without restart.
     * Config is saved to disk at the configured path.
     * 
     * @param config - Configuration object (LogConfig) or legacy format (LegacyConfig)
     * 
     * @remarks
     * - Environment variables:
     *   - CAGD_LOG_CONFIG_PATH: Full path to config file (absolute or relative)
     *   - CAGD_LOG_CONFIG_LOCATION: Config directory (default: "log")
     *   - CAGD_LOG_CONFIG_FILENAME: Config filename (default: "cagd-log.config", .js auto-added)
     *   - NODE_ENV=production: Forces dev_mode to false
     * 
     * - Legacy API (deprecated but still works):
     *   setConfig({ location: "log", filename: "config" })
     * 
     * @example
     * // New API (recommended)
     * log.setConfig({
     *   dev_mode: true,
     *   log: { path: "/logs/", type: "json", merge: false },
     *   time: { zone: "Europe/Istanbul" }
     * });
     * 
     * @example
     * // Legacy API (deprecated, shows warning)
     * log.setConfig({ location: "log", filename: "cagd-log.config" });
     */
    setConfig(config: LogConfig | LegacyConfig): void;

    /**
     * Log a message with a custom level OR create a scoped logger.
     * 
     * **Two usage modes:**
     * 
     * 1. **Custom Level Mode** (2+ arguments):
     *    Creates a log with a custom level name
     *    Example: log.log("security", "Failed login")
     *    Result: security.json file, [SECURITY] label
     * 
     * 2. **Scoped Logger Mode** (1 argument):
     *    Returns a scoped logger object with standard methods
     *    Example: const dbLog = log.log("database")
     *    Usage: dbLog.error("Connection failed")
     *    Result: database-error.json file, [DATABASE] [ERROR] labels
     * 
     * @param level - Log level or category name
     * @param args - Values to log (if 2+ arguments provided)
     * @returns void if used as custom level, or ScopedLogger if used as category
     * 
     * @example
     * // Custom level mode
     * log.log("security", "Failed login attempt", { ip: "192.168.1.1" });
     * 
     * @example
     * // Scoped logger mode
     * const paymentLog = log.log("payment");
     * paymentLog.warn("High transaction volume");
     * paymentLog.error("Payment failed", { orderId: 123 });
     * 
     * @example
     * // Chained scoped logger
     * log.log("database").info("Connected");
     * log.log("database").error("Connection timeout");
     */
    log(level: string, ...args: any[]): void | ScopedLogger;

    /**
     * Log an informational message.
     * 
     * @param args - Values to log
     * 
     * @remarks
     * Only displayed in console when dev_mode=true or NODE_ENV≠production
     * Always saved to file (info.json or all.json depending on config.log.merge)
     * 
     * @example
     * log.info("Server started on port 3000");
     * log.info("User logged in", { userId: 123, username: "john" });
     */
    info(...args: any[]): void;

    /**
     * Log a warning message.
     * 
     * @param args - Values to log
     * 
     * @remarks
     * Always displayed in console and saved to file
     * 
     * @example
     * log.warn("High memory usage detected");
     * log.warn("Deprecated API usage", { endpoint: "/old-api" });
     */
    warn(...args: any[]): void;

    /**
     * Log an error message.
     * 
     * @param args - Values to log
     * 
     * @remarks
     * Always displayed in console and saved to file
     * 
     * @example
     * log.error("Database connection failed");
     * log.error("Payment processing error", new Error("Timeout"));
     */
    error(...args: any[]): void;

    /**
     * Log a debug message.
     * 
     * @param args - Values to log
     * 
     * @remarks
     * Only displayed in console when dev_mode=true or NODE_ENV≠production
     * Always saved to file (debug.json or all.json depending on config.log.merge)
     * 
     * @example
     * log.debug("Query executed", { sql: "SELECT * FROM users", time: "45ms" });
     * log.debug({ requestId: "abc123", data: responseData });
     */
    debug(...args: any[]): void;

    /**
     * Get current Unix timestamp in milliseconds.
     * 
     * @returns Current timestamp
     * 
     * @example
     * const now = log.timestamp(); // 1706234567890
     */
    timestamp(): number;

    /**
     * Get formatted current time string based on config.time settings.
     * 
     * @returns Formatted time string
     * 
     * @example
     * const timeStr = log.time(); // "01/26/26, 14:30:45" (depends on config)
     */
    time(): string;
}

/**
 * Singleton instance of the logger.
 * Use this exported instance throughout your application.
 * 
 * @example
 * const log = require("cagd-log");
 * log.info("Application started");
 */
declare const logger: Log;

export = logger;
