declare type Config = {
    filename: string;
    location: string;
};

declare class Log {
    /** #### Restart the project after setting this. */
    setConfig(config: Config): void;
    log(level: "info" | "warn" | "error" | "debug" | "log", message: string): void;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
    debug(message: object | string): void;
}

declare const logger: Log;
export = logger;
