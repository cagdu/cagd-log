import fs from "node:fs";
import path from "node:path";
import util from "node:util";
import { pathToFileURL } from "node:url";
import {
	DEFAULT_CONFIG_FILENAME,
	DEFAULT_LOG_DIR,
	SUPPORTED_CONFIG_EXTENSIONS,
	ENV_VARS,
	TIME_FORMAT,
	DEFAULT_TIME_CONFIG,
	LOG_LEVELS,
	COLORS,
} from "./src/constants.js";
import { CONFIG_TEMPLATE } from "./src/config-template.js";

/**
 * Configuration options for the logger
 */
export interface LogConfigOptions {
	dev_mode?: boolean;
	log?: {
		arg_splitter?: string;
		path?: string;
		type?: "json" | "text";
		merge?: boolean;
	};
	time?: {
		locales?: string;
		zone?: string;
	};
	types?: {
		[key: string]: () => string;
	};
}

export type LogLevel = "debug" | "info" | "warn" | "error" | "log" | string;

/**
 * Scoped logger interface
 */
export interface ScopedLogger {
	debug: (...args: unknown[]) => void;
	info: (...args: unknown[]) => void;
	warn: (...args: unknown[]) => void;
	error: (...args: unknown[]) => void;
	log: (level: LogLevel, ...args: unknown[]) => void;
}

/**
 * JSON log entry interface
 */
interface LogEntry {
	timestamp: number;
	filename: string;
	message: Record<number, string>;
	category?: string;
	type?: string;
}

/**
 * Get caller filename using Error stack trace
 * This is ESM-compatible alternative to module.parent
 */
function getCallerFile(): string {
	const originalPrepareStackTrace = (Error as any).prepareStackTrace;
	try {
		const err = new Error();
		(Error as any).prepareStackTrace = (_: Error, stack: any) => stack;
		const stack = err.stack as unknown as any[];
		
		// Find first external caller (not this file)
		const currentFile = stack[0]?.getFileName?.();
		for (let i = 1; i < stack.length; i++) {
			const callerFile = stack[i]?.getFileName?.();
			if (callerFile && callerFile !== currentFile) {
				const cwd = process.cwd();
				return callerFile.startsWith(cwd)
					? callerFile.substring(cwd.length)
					: callerFile;
			}
		}
		return "";
	} finally {
		(Error as any).prepareStackTrace = originalPrepareStackTrace;
	}
}

/**
 * CagD-Log - Main logger class (Singleton pattern)
 *
 * A flexible and easy-to-use logging utility for Node.js applications.
 * Supports multiple log levels, custom levels, scoped/namespaced logging,
 * and stores logs in JSON or plain text format.
 *
 * @class Log
 * @example
 * ```typescript
 * import log from "cagd-log";
 * log.info("Server started");
 * log.error("Connection failed", { code: 500 });
 * ```
 *
 * @example
 * ```typescript
 * // Scoped logging
 * const paymentLog = log.log("payment");
 * paymentLog.error("Transaction failed");
 * ```
 *
 * @see https://github.com/cagdu/cagd-log
 */
class Log {
	private static instance: Log;
	private options: LogConfigOptions = {};
	private configPath: string | null = null;

	/**
	 * Constructor - implements singleton pattern
	 * Initializes config path and loads configuration
	 * Shows helpful message on first use if using default config
	 * @private
	 */
	constructor() {
		if (!Log.instance) {
			this.configPath = this._resolveConfigPath();
			this._initializeConfig();
			Log.instance = this;
		}
		return Log.instance;
	}

	/**
	 * Get current Unix timestamp in milliseconds
	 * @returns Current timestamp
	 * @example
	 * ```typescript
	 * const now = log.timestamp(); // 1706234567890
	 * ```
	 */
	timestamp = (): number => new Date().getTime();

	/**
	 * Get formatted current time string based on config.time settings
	 * @returns Formatted time string
	 * @example
	 * ```typescript
	 * const timeStr = log.time(); // "01/26/26, 14:30:45"
	 * ```
	 */
	time = (): string =>
		new Date().toLocaleString(this.options.time?.locales || DEFAULT_TIME_CONFIG.locales, {
			timeZone: this.options.time?.zone || DEFAULT_TIME_CONFIG.zone,
			day: TIME_FORMAT.DAY,
			hour: TIME_FORMAT.HOUR,
			hourCycle: TIME_FORMAT.HOUR_CYCLE,
			minute: TIME_FORMAT.MINUTE,
			month: TIME_FORMAT.MONTH,
			second: TIME_FORMAT.SECOND,
			year: TIME_FORMAT.YEAR,
		});

	/**
	 * Resolve config file path from environment variables or defaults
	 *
	 * Priority:
	 * 1. CAGD_CONFIG - full path (new recommended way)
	 * 2. CAGD_LOG_CONFIG_LOCATION + CAGD_LOG_CONFIG_FILENAME (legacy)
	 * 3. Default: {cwd}/cagd-log.config.(ts|js)
	 *
	 * @private
	 * @returns Resolved absolute config file path
	 */
	private _resolveConfigPath(): string {
		// Priority 1: CAGD_CONFIG environment variable
		if (process.env[ENV_VARS.CONFIG_PATH]) {
			let configPath = process.env[ENV_VARS.CONFIG_PATH]!;
			if (!path.isAbsolute(configPath)) {
				configPath = path.resolve(process.cwd(), configPath);
			}
			return configPath;
		}

		// Priority 2: Legacy environment variables
		if (process.env[ENV_VARS.CONFIG_LOCATION] || process.env[ENV_VARS.CONFIG_FILENAME]) {
			let envLocation = process.env[ENV_VARS.CONFIG_LOCATION] || DEFAULT_LOG_DIR;
			let envFilename = process.env[ENV_VARS.CONFIG_FILENAME] || DEFAULT_CONFIG_FILENAME;

			if (!path.isAbsolute(envLocation)) {
				envLocation = path.resolve(process.cwd(), envLocation);
			}
			if (!envFilename.endsWith(".js") && !envFilename.endsWith(".ts")) {
				envFilename += ".js";
			}

			return path.join(envLocation, envFilename);
		}

		// Priority 3: Default - try to find existing config with any supported extension
		const cwd = process.cwd();
		for (const ext of SUPPORTED_CONFIG_EXTENSIONS) {
			const configPath = path.join(cwd, `${DEFAULT_CONFIG_FILENAME}${ext}`);
			if (fs.existsSync(configPath)) {
				return configPath;
			}
		}

		// If no config exists, return default .ts path
		return path.join(cwd, `${DEFAULT_CONFIG_FILENAME}.ts`);
	}

	/**
	 * Initialize configuration: load or create config file
	 * @private
	 */
	private async _initializeConfig(): Promise<void> {
		try {
			if (!this.configPath) {
				this.options = this._getDefaultConfig();
				return;
			}

			// Check if config file exists
			if (!fs.existsSync(this.configPath)) {
				// Create default config file
				await this._createDefaultConfigFile();
				console.info(
					`${COLORS.CYAN}[cagd-log]${COLORS.RESET} Created default config at: ${COLORS.YELLOW}${this.configPath}${COLORS.RESET}\n` +
					`  Edit this file to customize your logger settings.`
				);
			}

			// Load config
			this.options = await this._loadConfig();
		} catch (error) {
			console.error(
				`${COLORS.RED_BG}[cagd-log ERROR]${COLORS.RESET} Failed to initialize config:`,
				error instanceof Error ? error.message : String(error)
			);
			this.options = this._getDefaultConfig();
		}
	}

	/**
	 * Create default config file at resolved path
	 * @private
	 */
	private async _createDefaultConfigFile(): Promise<void> {
		if (!this.configPath) return;

		const configDir = path.dirname(this.configPath);
		if (!fs.existsSync(configDir)) {
			fs.mkdirSync(configDir, { recursive: true });
		}

		fs.writeFileSync(this.configPath, CONFIG_TEMPLATE, { encoding: "utf8" });
	}

	/**
	 * Load configuration using dynamic import (ESM-compatible)
	 * @private
	 */
	private async _loadConfig(): Promise<LogConfigOptions> {
		if (!this.configPath || !fs.existsSync(this.configPath)) {
			return this._getDefaultConfig();
		}

		try {
			// Use dynamic import for ESM compatibility
			const fileUrl = pathToFileURL(this.configPath).href;
			// Add timestamp to bypass module cache
			const module = await import(`${fileUrl}?t=${Date.now()}`);
			const userConfig = module.default || module;

			return this._mergeConfig(userConfig);
		} catch (error) {
			console.error(
				`${COLORS.YELLOW_BG}[cagd-log WARNING]${COLORS.RESET} Error loading config from ${this.configPath}:`,
				error instanceof Error ? error.message : String(error)
			);
			return this._getDefaultConfig();
		}
	}

	/**
	 * Get default configuration
	 * @private
	 */
	private _getDefaultConfig(): LogConfigOptions {
		const config: LogConfigOptions = {
			dev_mode: process.env.NODE_ENV !== "production",
			log: {
				arg_splitter: "|",
				path: "/log/",
				type: "json",
				merge: false,
			},
			time: {
				locales: DEFAULT_TIME_CONFIG.locales,
				zone: DEFAULT_TIME_CONFIG.zone,
			},
			types: {},
		};

		return config;
	}

	/**
	 * Merge user config with defaults
	 * @private
	 */
	private _mergeConfig(userConfig: Partial<LogConfigOptions>): LogConfigOptions {
		const defaultConfig = this._getDefaultConfig();

		const config: LogConfigOptions = {
			dev_mode:
				userConfig.dev_mode !== undefined
					? userConfig.dev_mode
					: defaultConfig.dev_mode,
			log: { ...defaultConfig.log, ...userConfig.log },
			time: { ...defaultConfig.time, ...userConfig.time },
			types: { ...defaultConfig.types, ...userConfig.types },
		};

		if (process.env.NODE_ENV === "production") config.dev_mode = false;

		return config;
	}

	/**
	 * Ensure directory exists, create if not
	 * @private
	 */
	private _ensureDir(dirPath: string): void {
		if (!fs.existsSync(dirPath)) {
			fs.mkdirSync(dirPath, { recursive: true });
		}
	}

	/**
	 * Check and create folder/file if they don't exist
	 *
	 * @private
	 * @param folder - Folder path to create
	 * @param file - File path to create
	 * @param filevalue - Initial content for file
	 */
	private _checkFolderOrFile(
		folder: string | null,
		file?: string | null,
		filevalue?: string
	): void {
		if (folder) {
			this._ensureDir(folder);
		}
		if (file && !fs.existsSync(file)) {
			fs.writeFileSync(file, filevalue || "", { encoding: "utf8" });
		}
	}

	/**
	 * Read log file content
	 *
	 * Creates file with initial value if doesn't exist.
	 * Parses JSON files and validates format.
	 *
	 * @private
	 * @param file - File path to read
	 * @param type - File type: "json" or "text"
	 * @returns Parsed JSON array or text string
	 */
	private _readLogFile(
		file: string,
		type: "json" | "text" = this.options.log?.type || "json"
	): LogEntry[] | string {
		try {
			const initialValue = type === "json" ? "[]" : "";
			this._checkFolderOrFile(null, file, initialValue);

			const content = fs.readFileSync(file, { encoding: "utf8" });

			if (type === "json") {
				const trimmed = content.trim();
				if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) {
					return [];
				}
				return JSON.parse(content) as LogEntry[];
			}

			return content;
		} catch (error) {
			console.error(
				`${COLORS.RED_BG}[cagd-log ERROR]${COLORS.RESET} Error reading log file:`,
				error instanceof Error ? error.message : String(error)
			);
			return type === "json" ? [] : "";
		}
	}

	/**
	 * Format arguments for logging
	 * @private
	 */
	private _formatArgs(args: unknown[]): string[] {
		return args.map((val) => {
			switch (typeof val) {
				case "function":
					return util.inspect(val);
				case "object":
					return val === null ? "null" : JSON.stringify(val, null, 2);
				default:
					return String(val);
			}
		});
	}

	/**
	 * Save log entry to file
	 *
	 * Handles file naming for scoped/unscoped logs.
	 * Formats log entry based on file type (JSON or text).
	 * Creates directory structure if necessary.
	 *
	 * @private
	 * @param level - Log level (info, warn, error, debug, or custom)
	 * @param filename - Source file name where log was called
	 * @param scope - Category/scope name for namespaced logs
	 * @param args - Values to log
	 */
	private _saveToFile(
		level: string,
		filename: string,
		scope: string | null,
		...args: unknown[]
	): void {
		try {
			const logDir = path.join(process.cwd(), this.options.log?.path || "/log/");
			this._ensureDir(logDir);

			const fileLevel = scope
				? this.options.log?.merge
					? "all"
					: `${scope}-${level}`
				: this.options.log?.merge
				? "all"
				: level;

			const fileType = this.options.log?.type || "json";
			const logFile = path.join(logDir, `${fileLevel}.${fileType}`);

			const formattedArgs = this._formatArgs(args);

			if (fileType === "json") {
				const logs = this._readLogFile(logFile, "json") as LogEntry[];
				const entry: LogEntry = {
					timestamp: this.timestamp(),
					filename,
					message: formattedArgs.reduce((acc: Record<number, string>, val, idx) => {
						acc[idx] = val;
						return acc;
					}, {}),
				};

				if (scope) entry.category = scope;
				if (this.options.log?.merge) entry.type = level;

				logs.push(entry);
				fs.writeFileSync(logFile, JSON.stringify(logs, null, 2), { encoding: "utf8" });
			} else {
				const currentContent = this._readLogFile(logFile, "text") as string;
				const separator = this.options.log?.arg_splitter || "|";
				const scopeLabel = scope ? ` [${scope.toUpperCase()}]` : "";
				const logLine = `${this.time()} file:${filename}${scopeLabel} [${level.toUpperCase()}]: ${formattedArgs.join(` ${separator} `)}\n`;
				fs.writeFileSync(logFile, currentContent + logLine, { encoding: "utf8" });
			}
		} catch (error) {
			console.error(
				`${COLORS.RED_BG}[cagd-log ERROR]${COLORS.RESET} Error writing log:`,
				error instanceof Error ? error.message : String(error)
			);
		}
	}

	/**
	 * Core logging function - saves to file and outputs to console
	 *
	 * Handles both standard and scoped logging.
	 * Respects dev_mode for info/debug levels.
	 * Formats console output with colors and labels.
	 *
	 * @private
	 * @param level - Log level
	 * @param scope - Category/scope name (null for standard logs)
	 * @param args - Values to log
	 */
	private _logIt(level: string, scope: string | null, ...args: unknown[]): void {
		const filename = getCallerFile();
		this._saveToFile(level, filename, scope, ...args);

		// Skip console output for info/debug in production mode
		const levelLower = level.toLowerCase();
		if (!this.options.dev_mode && (levelLower === LOG_LEVELS.INFO || levelLower === LOG_LEVELS.DEBUG)) {
			return;
		}

		// Get console method
		const consoleAny = console as any;
		const consoleMethod =
			typeof consoleAny[level] === "function"
				? consoleAny[level]
				: console.log;

		// Format level label
		const levelLabel =
			this.options.types?.[level]
				? `[${this.options.types[level]()}]`
				: `[${COLORS.WHITE}${level.toUpperCase()}${COLORS.RESET}]`;

		// Format scope label
		const scopeLabel = scope
			? this.options.types?.[scope]
				? ` • [${this.options.types[scope]()}]`
				: ` • [${COLORS.CYAN}${scope.toUpperCase()}${COLORS.RESET}]`
			: "";

		consoleMethod(
			`[${COLORS.PURPLE}${this.time()}${COLORS.RESET}] • [${COLORS.CYAN}${filename}${COLORS.RESET}]${scopeLabel} • ${levelLabel} •>`,
			...args
		);
	}

	/**
	 * Create a scoped logger object
	 *
	 * Returns an object with standard log methods (info, warn, error, debug, log)
	 * that are bound to the specified scope/category.
	 *
	 * @private
	 * @param scope - Category/scope name
	 * @returns Scoped logger with standard methods
	 *
	 * @example
	 * ```typescript
	 * const paymentLog = this._createScopedLogger("payment");
	 * paymentLog.error("Failed"); // Logs to payment-error.json
	 * ```
	 */
	private _createScopedLogger(scope: string): ScopedLogger {
		return {
			debug: (...args: unknown[]) => this._logIt(LOG_LEVELS.DEBUG, scope, ...args),
			error: (...args: unknown[]) => this._logIt(LOG_LEVELS.ERROR, scope, ...args),
			info: (...args: unknown[]) => this._logIt(LOG_LEVELS.INFO, scope, ...args),
			warn: (...args: unknown[]) => this._logIt(LOG_LEVELS.WARN, scope, ...args),
			log: (level: LogLevel, ...args: unknown[]) => this._logIt(level, scope, ...args),
		};
	}

	/**
	 * Log a debug message
	 *
	 * Only displayed in console when dev_mode=true.
	 * Always saved to file (debug.json or all.json).
	 *
	 * @param args - Values to log (objects, strings, numbers, etc.)
	 *
	 * @example
	 * ```typescript
	 * log.debug("Query executed", { sql: "SELECT * FROM users", time: "45ms" });
	 * log.debug({ requestId: "abc123", data: responseData });
	 * ```
	 */
	debug(...args: unknown[]): void {
		this._logIt(LOG_LEVELS.DEBUG, null, ...args);
	}

	/**
	 * Log an error message
	 *
	 * Always displayed in console and saved to file.
	 *
	 * @param args - Values to log (errors, objects, strings, etc.)
	 *
	 * @example
	 * ```typescript
	 * log.error("Database connection failed");
	 * log.error("Payment processing error", new Error("Timeout"));
	 * log.error("Critical error", { code: 500, details: errorObj });
	 * ```
	 */
	error(...args: unknown[]): void {
		this._logIt(LOG_LEVELS.ERROR, null, ...args);
	}

	/**
	 * Log an informational message
	 *
	 * Only displayed in console when dev_mode=true.
	 * Always saved to file (info.json or all.json).
	 *
	 * @param args - Values to log
	 *
	 * @example
	 * ```typescript
	 * log.info("Server started on port 3000");
	 * log.info("User logged in", { userId: 123, username: "john" });
	 * ```
	 */
	info(...args: unknown[]): void {
		this._logIt(LOG_LEVELS.INFO, null, ...args);
	}

	/**
	 * Log a warning message
	 *
	 * Always displayed in console and saved to file.
	 *
	 * @param args - Values to log
	 *
	 * @example
	 * ```typescript
	 * log.warn("High memory usage detected");
	 * log.warn("Deprecated API usage", { endpoint: "/old-api" });
	 * ```
	 */
	warn(...args: unknown[]): void {
		this._logIt(LOG_LEVELS.WARN, null, ...args);
	}

	/**
	 * Set or update logger configuration
	 *
	 * Changes are applied immediately without restart.
	 * Config is saved to disk at the configured path.
	 *
	 * @param cfg - Configuration object
	 *
	 * @example
	 * ```typescript
	 * // Basic configuration
	 * log.setConfig({
	 *   dev_mode: true,
	 *   log: { path: "/logs/", type: "json" }
	 * });
	 * ```
	 */
	async setConfig(cfg: Partial<LogConfigOptions>): Promise<void> {
		try {
			if (!cfg || typeof cfg !== "object" || Object.keys(cfg).length === 0) {
				console.warn(
					`${COLORS.RED_BG}WARNING:${COLORS.YELLOW_BG} Config must be a non-empty object.${COLORS.RESET}`
				);
				return;
			}

			// Ensure config directory exists
			if (this.configPath) {
				const configDir = path.dirname(this.configPath);
				this._ensureDir(configDir);

				// Write config to file
				const configContent = `export default ${JSON.stringify(cfg, null, 2)};`;
				fs.writeFileSync(this.configPath, configContent, { encoding: "utf8" });
			}

			// Reload and merge config
			this.options = this._mergeConfig(cfg);

			console.info(
				`${COLORS.GREEN_BG}✓ Config updated successfully${COLORS.RESET}${
					this.configPath ? ` at: ${this.configPath}` : ""
				}`
			);
		} catch (error) {
			console.error(
				`${COLORS.RED_BG}[cagd-log ERROR]${COLORS.RESET} Error setting config:`,
				error instanceof Error ? error.message : String(error)
			);
		}
	}

	/**
	 * Log with custom level or create scoped logger
	 *
	 * When called with a string argument only, returns a scoped logger.
	 * When called with level and args, logs at the specified level.
	 *
	 * @param levelOrScope - Log level or scope name
	 * @param args - Values to log (if logging)
	 * @returns Void if logging, ScopedLogger if creating scope
	 *
	 * @example
	 * ```typescript
	 * // Create scoped logger
	 * const paymentLog = log.log("payment");
	 * paymentLog.error("Transaction failed");
	 *
	 * // Custom level logging
	 * log.log("critical", "System overload!");
	 * ```
	 */
	log(levelOrScope: string): ScopedLogger;
	log(levelOrScope: string, ...args: unknown[]): void;
	log(levelOrScope: string, ...args: unknown[]): void | ScopedLogger {
		if (args.length === 0) {
			return this._createScopedLogger(levelOrScope);
		}
		this._logIt(levelOrScope, null, ...args);
	}

	/**
	 * Alias for log() function
	 * @see log
	 */
	lvl(levelOrScope: string): ScopedLogger;
	lvl(levelOrScope: string, ...args: unknown[]): void;
	lvl(levelOrScope: string, ...args: unknown[]): void | ScopedLogger {
		return this.log(levelOrScope, ...args) as void | ScopedLogger;
	}

	/**
	 * Alias for log() function
	 * @see log
	 */
	level(levelOrScope: string): ScopedLogger;
	level(levelOrScope: string, ...args: unknown[]): void;
	level(levelOrScope: string, ...args: unknown[]): void | ScopedLogger {
		return this.log(levelOrScope, ...args) as void | ScopedLogger;
	}
}

export const logger = new Log();
export default logger;
