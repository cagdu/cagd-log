import { Util } from "./util";

/**
 * Logger methods for different log levels.
 * 
 * This class provides standard logging methods that can be used to output
 * messages at different severity levels. Each method supports multiple arguments
 * and automatically includes timestamp, caller information, and log level formatting.
 */
export class Methods {
	/**
	 * Logs a debug message.
	 * 
	 * Debug messages are typically used for detailed diagnostic information
	 * during development and troubleshooting.
	 * 
	 * @param args - Any number of arguments to be logged
	 * @returns {void}
	 * 
	 * @example
	 * log.debug("User authentication started", { userId: 123 });
	 * log.debug("Processing data:", data);
	 */
	public debug = (...args: any[]): void => Util.caller("debug", "", ...args);
	
	/**
	 * Logs an error message.
	 * 
	 * Error messages indicate serious problems that have occurred and require attention.
	 * Use this method to log exceptions, failures, or critical issues.
	 * 
	 * @param args - Any number of arguments to be logged
	 * @returns {void}
	 * 
	 * @example
	 * log.error("Database connection failed", error);
	 * log.error("Failed to process request:", { code: 500, message: "Internal error" });
	 */
	public error = (...args: any[]): void => Util.caller("error", "", ...args);
	
	/**
	 * Logs an informational message.
	 * 
	 * Informational messages provide general information about application
	 * flow and significant events that are not errors.
	 * 
	 * @param args - Any number of arguments to be logged
	 * @returns {void}
	 * 
	 * @example
	 * log.info("Server started on port 3000");
	 * log.info("User logged in:", { username: "john_doe" });
	 */
	public info  = (...args: any[]): void => Util.caller("info" , "", ...args);
	
	/**
	 * Logs a general message.
	 * 
	 * General log messages for standard output that doesn't fit into
	 * other specific categories.
	 * 
	 * @param args - Any number of arguments to be logged
	 * @returns {void}
	 * 
	 * @example
	 * log.log("Application initialized");
	 * log.log("Current configuration:", config);
	 */
	public log 	 = (...args: any[]): void => Util.caller("log"  , "", ...args);
	
	/**
	 * Logs a warning message.
	 * 
	 * Warning messages indicate potential issues or unexpected situations
	 * that don't prevent the application from functioning but should be noted.
	 * 
	 * @param args - Any number of arguments to be logged
	 * @returns {void}
	 * 
	 * @example
	 * log.warn("Deprecated API usage detected");
	 * log.warn("High memory usage:", { usage: "85%" });
	 */
	public warn  = (...args: any[]): void => Util.caller("warn" , "", ...args);
}