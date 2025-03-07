# 🗃️ Logger

A simple and flexible logging utility for Node.js applications. This project provides an easy way to log messages of different severity levels (`info`, `warn`, `error`, `debug`) and store them in JSON or plain text format. Logs can be stored locally and optionally merged into a single file.

## Features

- **Logging Levels**: Supports `info`, `warn`, `error`, and `debug` levels for logging messages.
- **Multiple Output Formats**: Logs can be saved in JSON or plain text format.
- **Customizable Log Path**: Customize the location of log files.
- **Merging Logs**: Optionally merge all logs into a single file.
- **Development Mode**: Toggle development mode to control console output.

## Installation

```bash
npm install cagd-log
```

## Example

```javascript
const log = require("cagd-log");

log.debug({ user: "AG", action: "Blocked." });
```

## Usage

### `.info(message: string)`

If "dev_mode" is set to "false", the logs will not be visible in the console.

### `warn(message: string)`

### `error(message: string)`

### `debug(message: object | string)`

Logs a debug message. This method also inspects objects and logs them as strings.

### `log(level: "info" | "warn" | "error" | "debug", message: string)`

Logs a message with a specified log level.

## Configuration

The logger configuration is defined in the `log_config.js` file, which is generated the first time the logger is used. You can modify the configuration to fit your needs.

### Options

- **`dev_mode`**: Set to `true` to display logs in the console during development. This option only hide info logs on the console.
- **`log.path`**: Define the path where log files will be stored. Default is `/log/`.
- **`log.type`**: Define the log format. Available options: `json` or `log`.
- **`log.arg_splitter`**: If you using `log` type, this option is split when multiple args used in function. Default is `|` (e.g., `.warn("HIGH", "LOW"); // 00/00/00, 00:00:00 [WARN]:  HIGH | LOW`)
- **`log.merge`**: Set to `true` to merge all logs into a single file.
- **`time.locales`**: Locale for formatting timestamps (e.g., `tr-TR`).
- **`time.zone`**: Time zone for timestamps (e.g., `Europe/Istanbul`).
- **`types`**: Customize log level labels and colors.


### Default Options 

```javascript
module.exports = {
    dev_mode: false,
    log: {
        "arg_splitter": "|",
        "path": "/log/",
        "type": "json",
        "merge": false
    },
    time: {
        "locales": "en-US",
        "zone": "UTC"
    },
    types: {
        info: (a = "\x1b[32m INFO \x1b[0m") => `${a}`,
        warn: (a = "\x1b[33m WARN  \x1b[0m") => `${a}`,
        error: (a = "\x1b[31m ERROR \x1b[0m") => `${a}`,
        debug: (a = "\x1b[34m DEBUG \x1b[0m") => `${a}`
    }
};
```