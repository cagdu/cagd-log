/**
 * Default configuration template for cagd-log
 * This template is used to create a new config file on first run
 */

export const CONFIG_TEMPLATE = `/**
 * CagD-Log Configuration
 * 
 * This file contains your logger settings.
 * All properties are optional and will fall back to defaults if not provided.
 * 
 * @see https://github.com/cagdu/cagd-log#configuration
 */

export default {
    /**
     * Development mode
     * When true: All log levels (including info and debug) are displayed in console
     * When false: Only warn, error, and custom levels are shown
     * @default true
     * @note Automatically forced to false when NODE_ENV=production
     */
    dev_mode: true,
    
    /**
     * Log file configuration
     */
    log: {
        /**
         * Character used to separate multiple arguments in log messages (text format only)
         * @default "|"
         */
        arg_splitter: "|",
        
        /**
         * Directory path where log files will be stored (relative to process.cwd())
         * @default "/log/"
         */
        path: "/log/",
        
        /**
         * Log file format
         * "json" - Structured JSON format (recommended)
         * "text" - Plain text format
         * @default "json"
         */
        type: "json",
        
        /**
         * Merge all logs into single file
         * When true: All logs go to "all.json" or "all.log"
         * When false: Each level gets its own file (info.json, error.json, etc.)
         * @default false
         */
        merge: false,
    },
    
    /**
     * Timestamp configuration
     */
    time: {
        /**
         * Locale for time formatting
         * @default "en-US"
         * @example "tr-TR", "de-DE", "ja-JP"
         */
        locales: "en-US",
        
        /**
         * Timezone for timestamps
         * @default "UTC"
         * @example "Europe/Istanbul", "America/New_York", "Asia/Tokyo"
         */
        zone: "UTC",
    },
    
    /**
     * Custom formatters for log levels and scopes
     * Return ANSI color-formatted strings for console output
     */
    types: {
        // Example: Custom level formatter
        // critical: () => "\\x1b[41m\\x1b[37mCRITICAL\\x1b[0m",
        
        // Example: Scoped logger formatter
        // payment: () => "\\x1b[35mPAYMENT\\x1b[0m",
    },
};
`;
