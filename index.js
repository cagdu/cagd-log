const fs = require("node:fs"), path = require("node:path"), util = require("node:util");

class Log {
    static instance;

    options = {}
    default_options = { dev_mode: false, log: { arg_splitter: "|", path: "/log/", type: "json", merge: false }, time: { locales: "en-US", zone: "UTC" }, types: { info: (a = "\x1b[32m INFO \x1b[0m") => `${a}`, warn: (a = "\x1b[33m WARN  \x1b[0m") => `${a}`, error: (a = "\x1b[31m ERROR \x1b[0m") => `${a}`, debug: (a = "\x1b[34m DEBUG \x1b[0m") => `${a}`, log: (a = "\x1b[38m LOG   \x1b[0m") => `${a}` } }
    config_name = "log_config.js"

    constructor() {
        if (!Log.instance) {
            this._checkFolderOrFile(process.cwd(), path.join(process.cwd(), this.config_name), "module.exports = {};");
            this.options = this._checkTheConfig(require(path.join(process.cwd(), this.config_name)), this.default_options, true);
            Log.instance = this;
        }
        return Log.instance;
    }

    // This one is ChatGPT code. i don't write every sentence. I just minified and little changes. :)
    _checkTheConfig = (n, o, t = !1) => { for (const t in o) "object" != typeof o[t] || null === o[t] || Array.isArray(o[t]) ? t in n || (n[t] = o[t]) : (n[t] && "object" == typeof n[t] || (n[t] = {}), this._checkTheConfig(n[t], o[t])); if (t) { var i = "module.exports = {\n", e = n => i = `${i}${n}\n`; for (const o in n) if ("object" == typeof n[o] && null !== n[o]) if ("types" === o) { e(`    ${o}: {`); for (const t in n[o]) "function" == typeof n[o][t] ? e(`        ${t}: ${n[o][t].toString()},`) : e(`        ${t}: ${JSON.stringify(n[o][t])},`); e("    },") } else e(`    ${o}: ${JSON.stringify(n[o], null, 8)},`); else "function" == typeof n[o] ? e(`    ${o}: ${n[o].toString()},`) : e(`    ${o}: ${JSON.stringify(n[o])},`); e("};"), fs.writeFileSync(path.join(process.cwd(), this.config_name), i, { encoding: "utf8" }) } return n };

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

    _saveIt(level, filename, ...args) {
        let dir = path.join(process.cwd(), this.options.log.path);

        this._checkFolderOrFile(dir);
        let file = path.join(dir, `${this.options.log.merge ? "all" : level}.${this.options.log.type}`), value = this._readIt(file);

        args.map((val, i) => { switch (typeof val) { case "function": args[i] = util.inspect(val); break; case "object": args[i] = JSON.stringify(val, null, 0); break; }; return args[i] })

        if (this.options.log.type === "json") {
            value.push({ timestamp: this.timestamp(), filename, message: args.reduce((a, b, c) => { a[c] = b; return a; }, {}), ...(this.options.log.merge ? { type: level } : {}) }); value = JSON.stringify(value, null, 4);
        }
        else value = `${value}${this.time()} file:${filename} [${String(level).toUpperCase()}]: ${String(args.join(" | "))}\n`;

        return fs.writeFileSync(file, value, { encoding: "utf8" });
    }

    _LogIt(level, ...args) {
        let paths = [path.resolve(module.parent?.filename), path.resolve(process.cwd() + "\\")], filename = paths[0].startsWith(paths[1]) ? paths[0].replace(paths[1], "") : paths[0];

        this._saveIt(level, filename, ...args);

        if (!this.options.dev_mode && String(level).toLowerCase() === "info") return;

        return console[level](`[\x1b[35m${this.time()}\x1b[0m] • [\x1b[36m${filename}\x1b[0m] • [${(this.options.types[level])()}] •>`, ...args);
    }

    debug = (...a) => this._LogIt("debug", ...a);
    error = (...a) => this._LogIt("error", ...a);
    info = (...a) => this._LogIt("info", ...a);
    warn = (...a) => this._LogIt("warn", ...a);

    log = (a, ...b) => {
        let wh = ["debug", "error", "info", "warn", "log"];
        if (!wh.find(c => c === a)) { void console.warn(`\x1b[41mWARNING:\x1b[43m"${a}"\x1b[44m Custom level not allowed. Level is gonna be \x1b[47m"log"\x1b[44m for now.\x1b[0m`); a = "log"; }
        this._LogIt(a, ...b);
    };
}

module.exports = new Log();