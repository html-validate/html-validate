import fs from "fs";
import path from "path";
import { Config } from "./config";

/**
 * @hidden
 */
interface ConfigClass {
	empty(): Config;
	fromFile(filename: string): Config;
}

/**
 * Configuration loader.
 *
 * Handles configuration lookup and cache results. When performing lookups
 * parent directories is searched as well and the result is merged together.
 */
export class ConfigLoader {
	protected cache: Map<string, Config>;
	protected configClass: ConfigClass;

	/**
	 * @param configClass - Override class to construct.
	 */
	constructor(configClass: ConfigClass) {
		this.cache = new Map<string, Config>();
		this.configClass = configClass;
	}

	/**
	 * Flush configuration cache.
	 *
	 * @param filename If given only the cache for that file is flushed.
	 */
	public flush(filename?: string): void {
		if (filename) {
			this.cache.delete(filename);
		} else {
			this.cache.clear();
		}
	}

	/**
	 * Get configuration for file.
	 *
	 * Searches parent directories for configuration and merges the result.
	 *
	 * @param filename Filename to get configuration for.
	 */
	public fromTarget(filename: string): Config {
		if (filename === "inline") {
			return this.configClass.empty();
		}

		if (this.cache.has(filename)) {
			return this.cache.get(filename);
		}

		let current = path.resolve(path.dirname(filename));
		let config = this.configClass.empty();

		for (;;) {
			const search = path.join(current, ".htmlvalidate.json");

			if (fs.existsSync(search)) {
				const local = this.configClass.fromFile(search);
				config = local.merge(config);
			}

			/* get the parent directory */
			const child = current;
			current = path.dirname(current);

			/* stop if this is the root directory */
			if (current === child) {
				break;
			}
		}

		this.cache.set(filename, config);
		return config;
	}
}
