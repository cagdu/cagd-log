import { Levels } from "./src/levels";

class Log extends Levels {
	private static instance: Log;
	constructor() { super(); if (!Log.instance) Log.instance = this; return Log.instance; }
}

const log = new Log();
export = log;