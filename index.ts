import Variables from "./src/variables";
import { Util, LogLevels, LogTypes } from "./src/util";

class Log extends LogLevels {
	private static instance: Log;
	constructor() { super(); if (!Log.instance) Log.instance = this; return Log.instance; }

	private time(): string {
		const now = new Date();
		return now.toISOString();
	}

	private message(type: LogTypes, level: string, ...args: any[]): void {
		var time = this.time(),
			triggerFrom = Util.getCallerFile(),
			text_level = (typeof Variables.config.levels[level] !== "string" ? "" : Variables.config.levels[level]) || "",
			text_type = (typeof Variables.config.types[type] !== "string" ? "" : Variables.config.types[type]) || "",
			fn = typeof console[type] === "function" ? console[type] : console.log;
		return fn(`[${time}] • [${triggerFrom}] •${text_level !== "" ? ` [${text_level}] •` : ""}${text_type !== "" ? ` [${text_type}] •` : ""}> `, ...args);
	}

	async setConfig(options: any): Promise<void> {
		// Implementation here
	}

	private caller(type: LogTypes, level: string, ...args: any[]): void {
		this.message(type, level, ...args);
	}
	

	public level(level: string): LogLevels;
	public level(level: string, ...args: any[]): void;
	public level(level: string, ...args: any[]): void | LogLevels {
        if (args.length === 0) {
            const self = this;
            return new class extends LogLevels {
                public debug(...dbgArgs: any[]): void {
                    self.caller("debug", level, ...dbgArgs);
                }
			};
		} else {
			this.caller("log", level, ...args);
		}
    }
}



export const log = new Log();
export default log;
