declare class Log {
    log(level: "info" | "warn" | "error" | "debug", message: string): void;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
    debug(message: object | string): void;
}

declare const logger: Log;
export = logger;
