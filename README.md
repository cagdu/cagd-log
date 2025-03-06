# 🗃️ Logger

A simple and flexible logging utility for Node.js applications. This project provides an easy way to log messages of different severity levels (`info`, `warn`, `error`, `debug`) and store them in JSON or plain text format. Logs can be stored locally and optionally merged into a single file.

## Features

- **Logging Levels**: Supports `info`, `warn`, `error`, and `debug` levels for logging messages.
- **Multiple Output Formats**: Logs can be saved in JSON or plain text format.
- **Customizable Log Path**: Customize the location of log files.
- **Merging Logs**: Optionally merge all logs into a single file.
- **Development Mode**: Toggle development mode to control console output.

## Installation

1. Clone the repository or install via npm (if available).

```bash
npm install cagd-log
```

2. Import and initialize the logger in your project:

```javascript
const log = require("cagd-log");
```

## Usage

You can use the logger in your Node.js application by calling one of the following methods:

### `.info(message: string)`

Logs an informational message.

```javascript
log.info("This is an info message");
```

### `warn(message: string)`

Logs a warning message.

```javascript
log.warn("This is a warning message");
```

### `error(message: string)`

Logs an error message.

```javascript
log.error("This is an error message");
```

### `debug(message: object | string)`

Logs a debug message. This method also inspects objects and logs them as strings.

```javascript
log.debug({ userId: 123, action: "login" });
```

### `log(level: "info" | "warn" | "error" | "debug", message: string)`

Logs a message with a specified log level.

```javascript
log.log("info", "This is a custom log level message");
```

## Configuration

The logger configuration is defined in the `log_config.js` file, which is generated the first time the logger is used. You can modify the configuration to fit your needs.

### Options

- **`dev_mode`**: Set to `true` to display logs in the console during development.
- **`log.path`**: Define the path where log files will be stored. Default is `/log/`.
- **`log.type`**: Define the log format. Available options: `json` or `txt`.
- **`log.merge`**: Set to `true` to merge all logs into a single file.
- **`time.locales`**: Locale for formatting timestamps (e.g., `en-US`).
- **`time.zone`**: Time zone for timestamps (e.g., `UTC`).
- **`types`**: Customize log level labels (e.g., `info`, `warn`, `error`, `debug`).

## Example

```javascript
const log = require("cagd-log");

log.info("This is an informational log.");
log.warn("This is a warning.");
log.error("An error occurred.");
log.debug({ user: "AG", action: "Blocked." });
```