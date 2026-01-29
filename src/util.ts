import * as fs from "node:fs";
import * as path from "node:path";

export const Util = new class {
    cwd = process.cwd();
	// Get the caller file path
	getCallerFile(): string {
		const stackTrace = (Error as any).prepareStackTrace;
		try {
			const err = new Error();
			(Error as any).prepareStackTrace = (_: Error, stack: any) => stack;
			const stack = err.stack as unknown as any[];

			var file = stack[0]?.getFileName?.();
			for (let i = 1; i < stack.length; i++) {
				const callerFile = stack[i]?.getFileName?.();
				if (callerFile && callerFile !== file) return callerFile.startsWith(this.cwd) ? callerFile.substring(this.cwd.length) : callerFile;
			}
			return "";
		} finally {
			(Error as any).prepareStackTrace = stackTrace;
		}
	}

	resolveConfigPath(file: string, defaultFile = "cagd-log.config.js", directory = ""): string {
		if (!path.isAbsolute(file)) directory = path.resolve(this.cwd, file);
		if (!directory.endsWith(".js")) directory += ".js";

		if (!fs.existsSync(directory) && directory !== defaultFile) throw new Error(`Config file not found at path: ${directory}\nContinueing with creating configuration at ${directory}.`);

		return directory;
	}
}

export class LogLevels {
    public debug(...args: any[]): void {}
	public error(...args: any[]): void {}
	public info (...args: any[]): void {}
	public log  (...args: any[]): void {}
	public warn (...args: any[]): void {}
}

export type LogTypes = "debug" | "error" | "log" | "info" | "warn";