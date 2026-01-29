import fs from "node:fs";
import path from "node:path";

import { CONFIG_TEMPLATE } from "./config-template";
import { LogTypes } from "./util";

interface Config {
	dev_mode: boolean;
	log: {
		arg_splitter?: string;
		path?: string;
		type?: "json" | "text";
		merge?: boolean;
	};
	time: {
		locales?: string;
		zone?: string;
	};
	types: {
		[key: string]: () => string;
	};
	levels: {
		[key: string]: () => string;
	}
}



class Util{
	private defaultConfigFile = "cagd-log.config.js";
	private configFile = process.env.CAGD_LOG_CONFIG_LOCATION || this.defaultConfigFile;
	private cwd = process.cwd();
	static config: Config;

	private _resolveConfigPath(): string {
		let lct = "";
		if (!path.isAbsolute(this.configFile)) lct = path.resolve(process.cwd(), this.configFile);
		if (!lct.endsWith(".js")) lct += ".js";

		if (!fs.existsSync(lct) && lct !== this.defaultConfigFile) throw new Error(`Config file not found at path: ${lct}\nContinueing with creating configuration at ${lct}.`);

		return lct;
	}

	private _createConfigFile(): void {
		const configPath = this._resolveConfigPath();
		fs.writeFileSync(configPath, CONFIG_TEMPLATE, { encoding: "utf-8" });
		console.log(`Configuration file created at: ${configPath}`);
	}

	

	

	// Console message handler


	static time() {}
	static logLevels() {}
	static colors() {}
}

export const Variables = new Util();
export default Variables;