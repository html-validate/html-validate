import * as fs from "fs";
import * as path from "path";
import { Config } from "./config";

interface ConfigClass {
	empty(): Config;
	fromFile(filename: string): Config;
}

export class ConfigLoader {
	protected cache: Map<string, Config>;
	protected configClass: ConfigClass;

	constructor(configClass: ConfigClass){
		this.cache = new Map<string, Config>();
		this.configClass = configClass;
	}

	public fromTarget(filename: string): Config {
		if (filename === "inline"){
			return this.configClass.empty();
		}

		if (this.cache.has(filename)){
			return this.cache.get(filename);
		}

		let current = path.resolve(path.dirname(filename));
		let config = this.configClass.empty();

		for (;;){
			const search = path.join(current, ".htmlvalidate.json");

			if (fs.existsSync(search)){
				const local = this.configClass.fromFile(search);
				config = local.merge(config);
			}

			/* get the parent directory */
			const child = current;
			current = path.dirname(current);

			/* stop if this is the root directory */
			if (current === child){
				break;
			}
		}

		this.cache.set(filename, config);
		return config;
	}
}
