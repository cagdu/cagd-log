/**
 * Default configuration for cagd-log
 * 
 * This file contains the default settings used when no custom configuration is provided.
 * You can override any of these settings using log.setConfig() or by creating your own config file.
 * 
 * @see https://github.com/cagdu/cagd-log#configuration
 */
module.exports = {
    /**
     * Development mode
     * 
     * When true: All log levels (including info and debug) are displayed in console
     * When false: Only warn, error, and custom levels are shown in console
     * 
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
         * 
         * @default "|"
         * @example "arg1 | arg2 | arg3"
         */
        arg_splitter: "|",
        
        /**
         * Directory path where log files will be stored (relative to process.cwd())
         * 
         * @default "/log/"
         * @example "/logs/", "./my-logs/", "/var/log/myapp/"
         */
        path: "/log/",
        
        /**
         * Log file format
         * 
         * "json" - Structured JSON format (recommended for parsing)
         * "text" - Plain text format (human-readable)
         * 
         * @default "json"
         */
        type: "json",
        
        /**
         * Merge all log levels into a single file
         * 
         * false - Each level gets its own file (info.json, error.json, etc.)
         * true - All logs are merged into all.json or all.log
         * 
         * @default false
         * @note Scoped logs still create separate files per scope-level combination
         */
        merge: false
    },
    
    /**
     * Timestamp configuration
     */
    time: {
        /**
         * Locale string for timestamp formatting
         * 
         * @default "en-US"
         * @example "en-US", "tr-TR", "de-DE", "fr-FR"
         * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#locales_argument
         */
        locales: "en-US",
        
        /**
         * Timezone for timestamps
         * 
         * @default "UTC"
         * @example "UTC", "Europe/Istanbul", "America/New_York", "Asia/Tokyo"
         * @see https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
         */
        zone: "UTC"
    },
    
    /**
     * Custom formatting functions for log level labels in console output
     * 
     * Each function receives an optional label string and returns a formatted string.
     * Use ANSI escape codes for colors.
     * 
     * You can add custom levels here to style scoped loggers:
     * payment: () => "\x1b[32m💳 PAYMENT\x1b[0m"
     * 
     * @see https://en.wikipedia.org/wiki/ANSI_escape_code#Colors
     */
    types: {
        /** Info level - Green */
        info: (a = "\x1b[32m INFO \x1b[0m") => `${a}`,
        
        /** Warning level - Yellow */
        warn: (a = "\x1b[33m WARN  \x1b[0m") => `${a}`,
        
        /** Error level - Red */
        error: (a = "\x1b[31m ERROR \x1b[0m") => `${a}`,
        
        /** Debug level - Blue */
        debug: (a = "\x1b[34m DEBUG \x1b[0m") => `${a}`,
        
        /** Custom log level - Gray */
        log: (a = "\x1b[38m LOG   \x1b[0m") => `${a}`,
    },
};
