# 🗃️ CagD-Log

📝 **cagd-log** is a flexible and easy-to-use logging library for Node.js applications. It supports multiple log levels and can store logs in JSON or plain text format.  

## 🚀 Installation  

Install the package using npm:  

```sh
npm install cagd-log
```  

## 📌 Usage  

```javascript
const log = require("cagd-log");

log.debug({ user: "AG", action: "Blocked." });
```  

## 🔧 Configuration  

By default, `cagd-log` creates a `log_config.js` file in the project root. You can modify it to customize the logging behavior.  

### Configuration Options  

| Option             | Type       | Default Value | Description                                                                                 |
|--------------------|------------|---------------|---------------------------------------------------------------------------------------------|
| `dev_mode`         | `boolean`  | `false`       | If `true`, logs will always be displayed in the console, even for `info` level.             |
| `log.arg_splitter` | `string`   | `\|`          | Character used to separate arguments in logs.                                               |
| `log.path`         | `string`   | `/log/`       | Directory where logs are stored.                                                            |
| `log.type`         | `string`   | `json`        | Log file format (`json` or `log`).                                                          |
| `log.merge`        | `boolean`  | `false`       | If `true`, all logs are merged into a single file instead of separate files for each level. |
| `time.locales`     | `string`   | `en-US`       | Locale for formatting timestamps.                                                           |
| `time.zone`        | `string`   | `UTC`         | Time zone used for timestamps. (e.g. `Europe/Istanbul`)                                     |
| `types.info`       | `function` | Green `INFO`  | Function returning the formatting of `info` log level.                                      |
| `types.warn`       | `function` | Yellow `WARN` | Function returning the formatting of `warn` log level.                                      |
| `types.error`      | `function` | Red `ERROR`   | Function returning the formatting of `error` log level.                                     |
| `types.debug`      | `function` | Blue `DEBUG`  | Function returning the formatting of `debug` log level.                                     |
| `types.log`        | `function` | White `LOG`   | Function returning the formatting of `log` log level.                                       |

### Example Configuration  

```javascript
module.exports = {
    dev_mode: false,
    log: {
        arg_splitter: "|",
        path: "/log/",
        type: "json",
        merge: false
    },
    time: {
        locales: "en-US",
        zone: "UTC"
    },
    types: {
        info: (a = "\x1b[32m INFO \x1b[0m") => `${a}`,
        warn: (a = "\x1b[33m WARN  \x1b[0m") => `${a}`,
        error: (a = "\x1b[31m ERROR \x1b[0m") => `${a}`,
        debug: (a = "\x1b[34m DEBUG \x1b[0m") => `${a}`,
        log: (a = "\x1b[38m LOG   \x1b[0m") => `${a}`,
    },
};
```  

## 📂 Log Storage  

Logs are saved in the directory specified in `log_config.js`.  

- **JSON format (`.json`)** – Logs are stored as structured JSON data.  
- **Plain text format (`.log`)** – Logs are saved in a human-readable format.  
- **Merged logs** – If `merge: true`, all logs are stored in a single file instead of separate ones.  

## 🛠️ Log Methods  

### `log.info(...messages)`  
Logs an informational message.  

### `log.warn(...messages)`  
Logs a warning message.  

### `log.error(...messages)`  
Logs an error message.  

### `log.debug(...messages)`  
Logs a debug message (useful for development).  

### `log.log(level, ...messages)`  
Logs a message with a custom log level.  

## 🎯 Example  

```javascript
const log = require("cagd-log");

log.info("Server started on port 3000");
log.warn("Memory usage is high");
log.error("Failed to connect to the database");
log.debug({ user: "admin", action: "login" }, "Hello World");
```  

## 📜 License  

This project is licensed under the MIT License.