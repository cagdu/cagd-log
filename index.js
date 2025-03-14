const fs = require("node:fs"), path = require("node:path"), util = require("node:util");

class Log {
    static instance;

    options = {}
    default_options = require("./default_config");
    config_name = "log_config.js"

    constructor() {
        if (!Log.instance) {
            this.options = this._checkTheConfig(path.join(process.cwd(), this.config_name));
            Log.instance = this;
        }
        return Log.instance;
    }

    timestamp = () => new Date().getTime();
    time = () => new Date().toLocaleString(this.options.time.locales, { timeZone: this.options.time.zone, day: "2-digit", hour: "2-digit", hourCycle: "h24", minute: "2-digit", month: "2-digit", second: "2-digit", year: "2-digit" });

    _checkTheConfig(a) {
        if (fs.existsSync(a)) return require(a); else fs.copyFileSync(path.join(__dirname, "/default_config.js"), a);
        return this.default_options;
    }

    _checkFolderOrFile(folder, file, filevalue) {
        if (folder) { if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true }) }
        if (file) { if (!fs.existsSync(file)) fs.writeFileSync(file, filevalue, { encoding: "utf8" }) }
    }

    _readIt(file, type = this.options.log.type) {
        let value = type === "json" ? "[]" : "";

        this._checkFolderOrFile(null, file, value);
        value = fs.readFileSync(file, { encoding: "utf8" });

        if (type === "json") {
            if (!value.startsWith("[") && !value.endsWith("]")) value = "[]";
            value = JSON.parse(value);
        }

        return value;
    }

    _saveIt(level, filename, ...args) {
        let dir = path.join(process.cwd(), this.options.log.path);

        this._checkFolderOrFile(dir);
        let file = path.join(dir, `${this.options.log.merge ? "all" : level}.${this.options.log.type}`), value = this._readIt(file);

        args.map((val, i) => { switch (typeof val) { case "function": args[i] = util.inspect(val); break; case "object": args[i] = JSON.stringify(val, null, 0); break; }; return args[i] })

        if (this.options.log.type === "json") {
            value.push({ timestamp: this.timestamp(), filename, message: args.reduce((a, b, c) => { a[c] = b; return a; }, {}), ...(this.options.log.merge ? { type: level } : {}) }); value = JSON.stringify(value, null, 0);
        }
        else value = `${value}${this.time()} file:${filename} [${String(level).toUpperCase()}]: ${String(args.join(` ${this.options.log.arg_splitter} `))}\n`;

        return fs.writeFileSync(file, value, { encoding: "utf8" });
    }

    _LogIt(level, ...args) {
        let paths = [path.resolve(module.parent?.filename), path.resolve(process.cwd() + "\\")], filename = paths[0].startsWith(paths[1]) ? paths[0].replace(paths[1], "") : paths[0];
        this._saveIt(level, filename, ...args);

        if (!this.options.dev_mode && ["info", "debug"].find(_ => _ === String(level).toLowerCase())) return;

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