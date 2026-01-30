import * as fs from "node:fs";
import * as path from "node:path";

import { CONFIG_TEMPLATE, CONFIG_TYPE, DEFAULT_CONFIG } from "./config-template";

export class U {
	static config = {} as CONFIG_TYPE;
	
	private cwd = process.cwd();
	private configWatcher: fs.FSWatcher | null = null;
	private isReloadAtTimeout = false;
	private configPath = process.env?.CAGD_LOG_CONFIG_PATH || "";

	readonly defaultConfigFileName = "cagd-log.config.js";
	
	// Resolve configuration file path
	private resolveConfigPath(file: string, directory = ""): string {
		if (!path.isAbsolute(file)) directory = path.resolve(this.cwd, file);
		if (!directory.endsWith(".js")) directory += ".js";
		return directory;
	}
	// Create default configuration file
	private createDefaultConfig(filePath: string): void {
		fs.writeFileSync(filePath, CONFIG_TEMPLATE, { encoding: "utf8" });
	}
	// Check if file exists
	private isThisFileExist(file: string): boolean {
		if (!path.isAbsolute(file)) file = path.resolve(this.cwd, file);
		return fs.existsSync(file);
	}
	// Reload configuration file
	private reloadConfig(filePath: string): void {
		try {
			if (this.isReloadAtTimeout) return; else this.isReloadAtTimeout = true;
			const resolvedPath = this.resolveConfigPath(filePath);
			delete require.cache[require.resolve(resolvedPath)];
			const userConfig = require(resolvedPath) as Partial<CONFIG_TYPE>;
			// If read success set timeout to prevent multiple reloads in short time
			setTimeout(() => (this.isReloadAtTimeout = false), U.config.config.reload_debounce_time || 300);
			U.config = { ...DEFAULT_CONFIG, ...userConfig };
			// Re-setup watcher if enabled
			if (U.config.config.watch) this.watchConfig(filePath);

			console.log(`[cagd-log] Config başarıyla güncellendi: ${filePath}`);
		} catch (error) {
			this.isReloadAtTimeout = false;
			if (U.config.config.throw_error_at_reload) console.error(`[cagd-log] Config dosyası yeniden yüklenirken hata oluştu:`, error instanceof Error ? error.message : error);
		};
	}
	// Setup config file watcher
	private watchConfig(filePath: string): void {
		if (this.configWatcher) this.configWatcher.close();
		try {
			const resolvedPath = this.resolveConfigPath(filePath);
			this.configWatcher = fs.watch(resolvedPath, (eventType) => (eventType === "change" ? this.reloadConfig(filePath) : null));
		} catch (error) {
			console.error(`[cagd-log] Config dosyası izlenemiyor:`, error instanceof Error ? error.message : error);
		}
	}

	constructor() {
		U.config = DEFAULT_CONFIG;

		// Load user configuration if available
		function re(self: U, p: string) {
			const userConfig = require(self.resolveConfigPath(p)) as Partial<CONFIG_TYPE>;
			U.config = { ...DEFAULT_CONFIG, ...userConfig };
			if (U.config.config.watch) self.watchConfig(p);
		}

		if (this.configPath && this.configPath !== "" && this.isThisFileExist(this.configPath)) re(this, this.configPath);
		else if (!this.isThisFileExist(this.defaultConfigFileName)) {
			this.createDefaultConfig(this.defaultConfigFileName);
			re(this, this.defaultConfigFileName);
		} else re(this, this.defaultConfigFileName);
	}

	// Get the caller file path
	public getCallerFile(): string {
		const stackTrace = (Error as any).prepareStackTrace;
		try {
			const err = new Error();
			(Error as any).prepareStackTrace = (_: Error, stack: any) => stack;
			const stack = err.stack as unknown as any[];

			// Find the first file that is not from dist folder
			for (let i = 0; i < stack.length; i++) {
				const callerFile = stack[i]?.getFileName?.();
				if (callerFile && !callerFile.includes('/dist/') && !callerFile.includes('\\dist\\')) {
					// Return relative path from cwd
					return callerFile.startsWith(this.cwd) ? callerFile.substring(this.cwd.length) : callerFile;
				}
			}
			return "";
		} finally {
			(Error as any).prepareStackTrace = stackTrace;
		}
	}


	public time(): string {
		// Here will be time formatting fn

		// Cheap ISO string for now
		return new Date().toISOString();
	}

	public message(method: T_LogMethods, level: string, ...args: any[]): void {
		var time = this.time(),
			text_level = (typeof U.config.levels[level] !== "string" ? "" : U.config.levels[level]) || "",
			text_method = (typeof U.config.methods[method] !== "string" ? "" : U.config.methods[method]) || "",
			fn = typeof console[method] === "function" ? console[method] : console.log;
		return fn(`\x1b[0m[${time}]${U.config.log.display_caller ? ` • [ \x1b[35m${this.getCallerFile()}\x1b[0m ]` : ""} •${text_level !== "" ? ` [${text_level}] •` : ""}${text_method !== "" ? ` [${text_method}] •` : ""}> `, ...args, "\x1b[0m");
	}

	public save(method: T_LogMethods, level: string, ...args: any[]): void {
		// Here will be saving fn
	}

	public caller(method: T_LogMethods, level: string, ...args: any[]): void {
		this.message(method, level, ...args);
		this.save(method, level, ...args);
	}
}

export const Util = new U();
export type T_LogMethods = keyof typeof U.config.methods;