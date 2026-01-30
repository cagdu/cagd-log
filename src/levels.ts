import { Methods } from "./methods";
import { Util } from "./util";

/**
 * Logger class with support for custom log levels.
 * 
 * This class extends the standard logging functionality by allowing users to define
 * and use custom log levels defined in the configuration. Custom levels can be used
 * to categorize logs by specific contexts (e.g., database operations, API calls, authentication).
 */
export class Levels extends Methods {
	/**
	 * Creates a logger with a custom level or logs a message with a custom level.
	 * 
	 * This method has two distinct behaviors:
	 * - When called with only a level name, it returns a Methods instance that will use that level
	 * - When called with a level name and additional arguments, it immediately logs the message with that level
	 * 
	 * Custom levels must be defined in the configuration file under the `levels` property.
	 * 
	 * @param level - The custom level name (must be defined in config)
	 * @param args - Optional arguments to be logged
	 * @returns {Methods | void} Returns a Methods instance when called without arguments, void otherwise
	 * 
	 * @example
	 * // Chain with standard methods
	 * log.level("database").info("Connection established");
	 * 
	 * @example
	 * // Direct logging with custom level
	 * log.level("api", "Request received:", { endpoint: "/users" });
	 */
	public level(level: string): Methods;
	public level(level: string, ...args: any[]): void;
	public level(level: string, ...args: any[]): void | Methods { if (args.length === 0) return new Methods(); else Util.caller("log", level, ...args); }

	/**
	 * Alias for the `level` method.
	 * 
	 * Provides a shorter syntax for working with custom log levels while maintaining
	 * the same functionality as the `level` method.
	 * 
	 * @param level - The custom level name (must be defined in config)
	 * @param args - Optional arguments to be logged
	 * @returns {Methods | void} Returns a Methods instance when called without arguments, void otherwise
	 * 
	 * @example
	 * // Chain with standard methods
	 * log.lvl("redis").debug("Cache hit:", key);
	 * 
	 * @example
	 * // Direct logging with custom level
	 * log.lvl("mongodb", "Query executed:", query);
	 */
	public lvl(level: string): Methods;
	public lvl(level: string, ...args: any[]): void;
	public lvl(level: string, ...args: any[]): void | Methods { return this.level(level, ...args); }
}