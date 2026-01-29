/**
 * Constants for cagd-log
 */

// Default configuration file name
export const DEFAULT_CONFIG_FILENAME = "cagd-log.config";

// Default log directory
export const DEFAULT_LOG_DIR = "log";

export const SUPPORTED_CONFIG_EXTENSIONS = [".ts", ".js", ".mjs", ".cjs"] as const;

// Environment variable names
export const ENV_VARS = {
    /** Full config path (highest priority) */
    CONFIG_PATH: "CAGD_CONFIG",
    /** Legacy: Config directory location */
    CONFIG_LOCATION: "CAGD_LOG_CONFIG_LOCATION",
    /** Legacy: Config file name */
    CONFIG_FILENAME: "CAGD_LOG_CONFIG_FILENAME",
} as const;

// Time format constants
export const TIME_FORMAT = {
    DAY: "2-digit",
    HOUR: "2-digit",
    HOUR_CYCLE: "h24",
    MINUTE: "2-digit",
    MONTH: "2-digit",
    SECOND: "2-digit",
    YEAR: "2-digit",
} as const;

/**
 * Default time configuration
 */
export const DEFAULT_TIME_CONFIG = {
    locales: "en-US",
    zone: "UTC",
} as const;

/**
 * Log levels
 */
export const LOG_LEVELS = {
    DEBUG: "debug",
    INFO: "info",
    WARN: "warn",
    ERROR: "error",
} as const;

/**
 * ANSI color codes for console output
 */
export const COLORS = {
    RESET: "\x1b[0m",
    CYAN: "\x1b[36m",
    YELLOW: "\x1b[33m",
    PURPLE: "\x1b[35m",
    WHITE: "\x1b[37m",
    GREEN_BG: "\x1b[42m",
    RED_BG: "\x1b[41m",
    YELLOW_BG: "\x1b[43m",
} as const;
