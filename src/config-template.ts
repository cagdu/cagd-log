export const DEFAULT_CONFIG = {
    dev_mode: false,

    config: {
        watch: true,
        throw_error_at_reload: false,
        reload_debounce_time: 300,
    },

    time: {
        timezone: "UTC",
        locale: "en-US",
        date_format: "DD-MM-YY HH:mm:ss",
    },

    log: {
        arg_splitter: " | ",

        save_to_file: true,
        save_path: "./logs",
        save_type: "json",
        save_merge: true,
        
        display_caller: true,
        display_date: true,
        display_level: true,

        hide_at_production: ["debug", "info"],
    },
    methods: {
        info    : "\x1b[37m INFO  \x1b[0m",
        debug   : "\x1b[34m DEBUG \x1b[0m",
        warn    : "\x1b[33m WARN  \x1b[0m",
        error   : "\x1b[31m ERROR \x1b[0m",
        log     : "\x1b[38m LOG   \x1b[0m",
    },
    levels: {
        redis: "\x1b[38;2;216;44;32m REDIS \x1b[0m",
        mysql: "\x1b[38;2;0;117;143m MY\x1b[38;2;242;145;17mSQL \x1b[0m",
        mongodb: "\x1b[38;2;77;179;61m MONGO\x1b[38;2;232;231;213mDB \x1b[0m",
        postgresql: "\x1b[38;2;0;139;185m POSTGRESQL \x1b[0m",

    },
};

export type CONFIG_TYPE = {
    dev_mode: boolean;
    config: {
        watch: boolean;
        throw_error_at_reload: boolean;
        reload_debounce_time: number;
    };
    time: {
        timezone: string;
        locale: string;
        date_format: string;
    };
    log: {
        arg_splitter: string;
        save_to_file: boolean;
        save_path: string;
        save_type: string;
        save_merge: boolean;
        display_caller: boolean;
        display_date: boolean;
        display_level: boolean;
        hide_at_production: string[];
    };
    methods: {
        info: string;
        debug: string;
        warn: string;
        error: string;
        log: string;
    };
    levels: Record<string, string>;
};

export const CONFIG_TEMPLATE = `/**
 * CagD-Log Configuration
 * 
 * This file contains your logger settings.
 * All properties are optional and will fall back to defaults if not provided.
 * 
 * @see https://github.com/cagdu/cagd-log#configuration
 */

module.exports = {
    dev_mode: true, // Enable or disable development mode (default: true)
    
    config: {
        /**
         * Watch configuration file for changes
         * 
         * If enabled, the logger will automatically reload the configuration
         * when the config file is modified.
         * 
         * Note: Enabling after disabling requires a restart to take effect.
         * 
         * Default: true
         */
        watch: true,
        throw_error_at_reload: false, // Throw error if config reload fails (default: false)
        reload_debounce_time: 300, // Debounce time in milliseconds for config reloads (default: 300)
    },

    time: {
        timezone: "UTC", // Timezone for log timestamps (default: "UTC")
        locale: "en-US", // Locale for date formatting (default: "en-US")
        date_format: "DD-MM-YY HH:mm:ss", // Date format for log timestamps (default: "DD-MM-YY HH:mm:ss")
    },

    log: {
        arg_splitter: " | ", // String to split log arguments (default: " | ")

        save_to_file: true, // Enable or disable saving logs to files (default: true)
        save_path: "./logs", // Directory to save log files (default: "./logs")
        save_type: "json", // Log file format: "json" or "txt" (default: "json")
        save_merge: true, // Logs will be merged. Otherwise, a new file will be created for each log statement. (default: true) 

        display_caller: true, // Show caller file and line number (default: true)
        display_date: true, // Show date and time in logs (default: true)
        display_level: true, // Show log level in logs (default: true)

        hide_at_production: ["debug", "info"], // Log levels to hide in production mode.
    },

    /**
     * Predefined log methods with colors
     * 
     * Use ANSI escape codes for colors.
     * @see https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit
     * 
     * You can customize these or add new ones in the "levels" section below.
     */
    methods: {
        info    : "\\x1b[37m INFO  \\x1b[0m",
        debug   : "\\x1b[34m DEBUG \\x1b[0m",
        warn    : "\\x1b[33m WARN  \\x1b[0m",
        error   : "\\x1b[31m ERROR \\x1b[0m",
        log     : "\\x1b[38m LOG   \\x1b[0m",
    },

    /**
     * Custom log levels
     * 
     * Define your own log levels and their colors here.
     * 
     * Use ANSI escape codes for colors.
     * @see https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit
     */
    levels: {
        db   : "\\x1b[36m DB   \\x1b[0m",
        api  : "\\x1b[32m API  \\x1b[0m",
        auth : "\\x1b[34m AUTH \\x1b[0m",

        
        redis: "\\x1b[38;2;216;44;32m REDIS \\x1b[0m",
        mysql: "\\x1b[38;2;0;117;143m MY\\x1b[38;2;242;145;17mSQL \\x1b[0m ",
        mongodb: "\\x1b[38;2;77;179;61m MONGO\\x1b[38;2;232;231;213mDB \\x1b[0m ",
        postgresql: "\\x1b[38;2;0;139;185m POSTGRESQL \\x1b[0m ",


        /**
         * Example of a custom hex color (RGB) log level
         * 
         * 38;2;R;G;B
         * R, G, B values range from 0 to 255
         * @see https://en.wikipedia.org/wiki/ANSI_escape_code#24-bit
         */
        custom_hex_color_schema: "\\x1b[38;2;255;255;255m CUSTOM \\x1b[0m",
    }
};`