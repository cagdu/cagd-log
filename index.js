const fs = require("fs");
const path = require("path");
const util = require("util");

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
		}

		return Log.instance;
	}

	timestamp = () => Date.now();

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

	_deepMerge(defaultConfig, customConfig) {
		if (typeof defaultConfig !== "object" || defaultConfig === null) return customConfig;
		if (typeof customConfig !== "object" || customConfig === null) return customConfig === undefined ? defaultConfig : customConfig;

		const merged = Array.isArray(defaultConfig) ? [...defaultConfig] : { ...defaultConfig };

		for (const key of Object.keys(customConfig)) {
			const customValue = customConfig[key];
			const defaultValue = merged[key];

			if (typeof customValue === "object" && customValue !== null && !Array.isArray(customValue) && typeof defaultValue === "object" && defaultValue !== null && !Array.isArray(defaultValue)) merged[key] = this._deepMerge(defaultValue, customValue);
			else merged[key] = customValue;
		}

		return merged;
	}

	_stripNonSerializable(value) {
		if (typeof value === "function") {
			this._hasNonSerializable = true;
			return undefined;
		}

		if (Array.isArray(value)) return value.map((item) => this._stripNonSerializable(item)).filter((item) => item !== undefined);

		if (value && typeof value === "object") {
			const output = {};
			for (const key of Object.keys(value)) {
				const stripped = this._stripNonSerializable(value[key]);
				if (stripped !== undefined) output[key] = stripped;
			}
			return output;
		}

		return value;
	}

	_getConfig() {
		const defaultConfig = require("./default_config.js");

		try {
			if (fs.existsSync(this.configPath)) {
				delete require.cache[require.resolve(this.configPath)];
				const config = require(this.configPath);

				if (typeof config !== "object" || config === null) throw new Error("Config file must export an object.");

				const mergedConfig = this._deepMerge(defaultConfig, config);
				if (process.env.NODE_ENV === "production") mergedConfig.dev_mode = false;
				return mergedConfig;
			}
		} catch (error) {
			console.error(`[cagd-log] Error loading config from ${this.configPath}: ${error.message}`);
		}

		if (process.env.NODE_ENV === "production") defaultConfig.dev_mode = false;
		return defaultConfig;
	}

	_ensureConfigDir() {
		const configDir = path.dirname(this.configPath);
		if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
	}

	_checkFolderOrFile(folder, file, filevalue) {
		if (folder && !fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

		if (file) {
			const fileDir = path.dirname(file);
			if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir, { recursive: true });
			if (!fs.existsSync(file)) fs.writeFileSync(file, filevalue, { encoding: "utf8" });
		}
	}

	_readIt(file, type = this.options.log.type) {
		try {
			if (!fs.existsSync(file)) {
				const initialValue = type === "json" ? "[]" : "";
				this._checkFolderOrFile(null, file, initialValue);
			}

			let value = fs.readFileSync(file, { encoding: "utf8" });

			if (type === "json") {
				const trimmed = value.trim();
				if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return [];
				value = JSON.parse(value);
				if (!Array.isArray(value)) return [];
			}

			return value;
		} catch (error) {
			console.error(`[cagd-log] Error reading log file: ${error.message}`);
			return type === "json" ? [] : "";
		}
	}

	_saveIt(level, filename, ...args) {
		try {
			const dir = path.isAbsolute(this.options.log.path) ? this.options.log.path : path.resolve(process.cwd(), this.options.log.path);

			this._checkFolderOrFile(dir);
			const file = path.join(dir, `${this.options.log.merge ? "all" : level}.${this.options.log.type}`);
			let value = this._readIt(file);

			args = args.map((val) => {
				if (typeof val === "function") return util.inspect(val);
				return val;
			});

			if (this.options.log.type === "json") {
				const record = { timestamp: this.timestamp(), filename, level, message: args.length === 1 ? args[0] : args };

				if (this.options.log.merge) record.type = level;
				value.push(record);
				value = JSON.stringify(value, null, 2);
			} else value = `${value}${this.time()} file:${filename} [${String(level).toUpperCase()}]: ${String(args.join(` ${this.options.log.arg_splitter} `))}\n`;

			fs.writeFileSync(file, value, { encoding: "utf8" });
		} catch (error) {
			console.error(`[cagd-log] Error writing log: ${error.message}`);
		}
	}

	_LogIt(level, ...args) {
		const caller = module.parent?.filename || process.argv[1] || __filename;
		const filename = caller ? path.relative(process.cwd(), path.resolve(caller)) : __filename;

		this._saveIt(level, filename, ...args);

		if (!this.options.dev_mode && ["info", "debug"].includes(String(level).toLowerCase())) return;

		const consoleMethod = typeof console[level] === "function" ? console[level] : console.log;
		const levelLabel = typeof this.options.types[level] === "function" ? `[${this.options.types[level]()}]` : `[\x1b[37m${String(level).toUpperCase()}\x1b[0m]`;

		return consoleMethod(`[\x1b[35m${this.time()}\x1b[0m] • [\x1b[36m${filename}\x1b[0m] • ${levelLabel} •>`, ...args);
	}

	setConfig(cfg = {}) {
		try {
			if (!cfg || typeof cfg !== "object" || Object.keys(cfg).length === 0) return void console.warn(`\x1b[41mWARNING:\x1b[43m Config must be a non-empty object.\x1b[0m`);

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
			this._hasNonSerializable = false;
			const safeConfig = this._stripNonSerializable(cfg);

			if (this._hasNonSerializable) console.warn("[cagd-log] Warning: functions in config cannot be persisted to disk and will only apply for the current process.");

			const configContent = `module.exports = ${JSON.stringify(safeConfig, null, 2)};`;
			fs.writeFileSync(this.configPath, configContent, { encoding: "utf8" });
			this.options = this._getConfig();
			console.info(`\x1b[42m✓ Config updated successfully at: ${this.configPath}\x1b[0m`);
		} catch (error) {
			console.error(`[cagd-log] Error setting config: ${error.message}`);
		}
	}

	debug = (...a) => this._LogIt("debug", ...a);
	error = (...a) => this._LogIt("error", ...a);
	info = (...a) => this._LogIt("info", ...a);
	warn = (...a) => this._LogIt("warn", ...a);
	log = (a, ...b) => this._LogIt(a, ...b);
}

module.exports = new Log();
