const fs = require("node:fs"), path = require("node:path");

class Log {
    static instance;

    options = { dev_mode: false, log: { arg_splitter: "|", path: "/log/", type: "json", merge: false }, time: { locales: "en-US", zone: "UTC" }, types: { info: (a = "\x1b[32m INFO \x1b[0m") => `${a}`, warn: (a = "\x1b[33m WARN  \x1b[0m") => `${a}`, error: (a = "\x1b[31m ERROR \x1b[0m") => `${a}`, debug: (a = "\x1b[34m DEBUG \x1b[0m") => `${a}`, } }

    constructor() {
        if (!Log.instance) {
            let dir = process.cwd();
            this._checkFolderOrFile(dir, path.join(dir, "log_config.js"), `module.exports = {\n` + `    dev_mode: ${this.options.dev_mode},\n` + `    log: ${JSON.stringify(this.options.log, null, 8)},\n` + `    time: ${JSON.stringify(this.options.time, null, 8)},\n` + `    types: {\n` + Object.entries(this.options.types).map(([key, value]) => `        ${key}: ${value.toString()}`).join(",\n") + `\n    }\n` + `};`);

            this.options = require(path.join(dir, "log_config.js"));
            Log.instance = this;
        }
        return Log.instance;
    }

    timestamp = () => new Date().getTime();
    time = () => new Date().toLocaleString(this.options.time.locales, { timeZone: this.options.time.zone, day: "2-digit", hour: "2-digit", hourCycle: "h24", minute: "2-digit", month: "2-digit", second: "2-digit", year: "2-digit" });

    _checkFolderOrFile(folder, file, filevalue) {
        if (folder) { if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true }) }
        if (file) { if (!fs.existsSync(file)) fs.writeFileSync(file, filevalue, { encoding: "utf8" }) }
    }

    _readIt(file, type = this.options.log.type) {
        let value = type === "json" ? "[]" : "";

        this._checkFolderOrFile(null, file, value);
        value = fs.readFileSync(file, { encoding: "utf8" });

        return (type === "json" ? JSON.parse(value) : value);
    }

    _saveIt(level, ...args) {
        let dir = path.join(__dirname, this.options.log.path);
        this._checkFolderOrFile(dir);

        let file = path.join(dir, `${this.options.log.merge ? "all" : level}.${this.options.log.type}`), value = this._readIt(file);

        if (this.options.log.type === "json") {
            value.push({ timestamp: this.timestamp(), message: args.reduce((a, b, c) => { a[c] = b; return a; }, {}), ...(this.options.log.merge ? { type: level } : {}) }); value = JSON.stringify(value, null, 4);
        }
        else value = `${value}${this.time()} [${String(level).toUpperCase()}]: ${String(args.join(" | "))}\n`;

        return fs.writeFileSync(file, value, { encoding: "utf8" });
    }

    _LogIt(level, ...args) {
        this._saveIt(level, ...args);

        if (!this.options.dev_mode && String(level).toLowerCase() === "info") return;
        return console.log(`[\x1b[35m${this.time()}\x1b[0m][${(this.options.types[level])()}]> `, ...args);
    }

    debug = (...a) => {
        a.map((b, c) => {
            switch (typeof b) {
                case "function": a[c] = require("node:util").inspect(b); break;
                case "object": a[c] = JSON.stringify(b, null, 0); break;
            }
            return a[c];
        })

        this._LogIt("debug", ...a);
    };
    error = (...a) => this._LogIt("error", ...a);
    info = (...a) => this._LogIt("info", ...a);
    warn = (...a) => this._LogIt("warn", ...a);

    log = (a, ...b) => this._LogIt(a, ...b);
}

module.exports = new Log();
