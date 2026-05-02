const fs = require("fs-extra"), path = require("path"), util = require("util");

class Log {
    static instance;
    options = {};
    configPath = null;

    constructor() { 
        if (!Log.instance) { 
            this.configPath = this._resolveConfigPath();
            this.options = this._getConfig();
            
            if (!fs.existsSync(this.configPath) && (process.env.CAGD_LOG_CONFIG_PATH || process.env.CAGD_LOG_CONFIG_LOCATION || process.env.CAGD_LOG_CONFIG_FILENAME)) console.warn(`[cagd-log] Config not found at: ${this.configPath}, using defaults`);
            Log.instance = this; 
        };
        return Log.instance; 
    }

    timestamp = () => new Date().getTime();
    time = () => new Date().toLocaleString(this.options.time.locales, { timeZone: this.options.time.zone, day: "2-digit", hour: "2-digit", hourCycle: "h24", minute: "2-digit", month: "2-digit", second: "2-digit", year: "2-digit" });

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

    _getConfig() {
        try {
            if (fs.existsSync(this.configPath)) {
                delete require.cache[require.resolve(this.configPath)];
                var config = require(this.configPath);
            } else var config = require("./default_config.js");
            if (process.env.NODE_ENV === "production") config.dev_mode = false;
            
            return config;
        } catch (error) {
            console.error(`[cagd-log] Error loading config from ${this.configPath}: ${error.message}`);
            var defaultConfig = require("./default_config.js");
            if (process.env.NODE_ENV === "production") defaultConfig.dev_mode = false;
            return defaultConfig;
        }
    }

    _ensureConfigDir() {
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
                if (!value.trim().startsWith("[") && !value.trim().endsWith("]")) value = "[]";
                value = JSON.parse(value);
            }

            return value;
        } catch (error) {
            console.error(`[cagd-log] Error reading log file: ${error.message}`);
            return type === "json" ? [] : "";
        }
    }

    _saveIt(level, filename, ...args) {
        try {
            let dir = path.join(process.cwd(), this.options.log.path);

            this._checkFolderOrFile(dir);
            let file = path.join(dir, `${this.options.log.merge ? "all" : level}.${this.options.log.type}`), value = this._readIt(file);

            args.map((val, i) => { switch (typeof val) { case "function": args[i] = util.inspect(val); break; case "object": args[i] = JSON.stringify(val, null, 2); break; }; return args[i] })

            if (this.options.log.type === "json") {
                value.push({ timestamp: this.timestamp(), filename, message: args.reduce((a, b, c) => { a[c] = b; return a; }, {}), ...(this.options.log.merge ? { type: level } : {}) }); value = JSON.stringify(value, null, 2);
            }
            else value = `${value}${this.time()} file:${filename} [${String(level).toUpperCase()}]: ${String(args.join(` ${this.options.log.arg_splitter} `))}\n`;

            return fs.writeFileSync(file, value, { encoding: "utf8" });
        } catch (error) { console.error(`[cagd-log] Error writing log: ${error.message}`); }
    }

    _LogIt(level, ...args) {
        let paths = [path.resolve(module.parent?.filename), path.resolve(process.cwd())], filename = paths[0].startsWith(paths[1]) ? paths[0].substring(paths[1].length) : paths[0];
        this._saveIt(level, filename, ...args);

        if (!this.options.dev_mode && ["info", "debug"].includes(String(level).toLowerCase())) return;

        const consoleMethod = typeof console[level] === "function" ? console[level] : console.log;
        const levelLabel = this.options.types[level] ? `[${(this.options.types[level])()}]` : `[\x1b[37m${String(level).toUpperCase()}\x1b[0m]`;
        
        return consoleMethod(`[\x1b[35m${this.time()}\x1b[0m] • [\x1b[36m${filename}\x1b[0m] • ${levelLabel} •>`, ...args);
    }

    setConfig(cfg = {}) {
        try {
            if (!cfg || typeof cfg !== "object" || Object.keys(cfg).length === 0) {
                return void console.warn(`\x1b[41mWARNING:\x1b[43m Config must be a non-empty object.\x1b[0m`);
            }

            // Backward compatibility: eski API (location/filename) desteği
            if (cfg.location && cfg.filename && !cfg.log) {
                console.warn(`\x1b[43m⚠️  DEPRECATED:\x1b[0m The setConfig({ location, filename }) API is deprecated.\nUse environment variables or the new config object format instead.\nSee: https://github.com/cagdu/cagd-log#upgrade-guide`);
                // Eski API'yi yeni sistem'e adapte et
                process.env.CAGD_LOG_CONFIG_LOCATION = cfg.location;
                process.env.CAGD_LOG_CONFIG_FILENAME = cfg.filename;
                this.configPath = this._resolveConfigPath();
                this.options = this._getConfig();
                console.info(`\x1b[42m✓ Config applied successfully\x1b[0m`);
                return;
            }

            // Yeni API: tam config object
            this._ensureConfigDir();
            const configContent = `module.exports = ${JSON.stringify(cfg, null, 2)};`;
            fs.writeFileSync(this.configPath, configContent, { encoding: "utf8" });
            this.options = this._getConfig();
            console.info(`\x1b[42m✓ Config updated successfully at: ${this.configPath}\x1b[0m`);
        } catch (error) {
            console.error(`[cagd-log] Error setting config: ${error.message}`);
        }
    }

    debug   = (...a)    => this._LogIt("debug", ...a);
    error   = (...a)    => this._LogIt("error", ...a);
    info    = (...a)    => this._LogIt("info", ...a);
    warn    = (...a)    => this._LogIt("warn", ...a);
    log     = (a, ...b) => this._LogIt(a, ...b);
}

module.exports = new Log();