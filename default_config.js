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
