import fs from "fs";
import path from "path";
import { Config } from "./config";

/**
 * @internal
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
	protected cache: Map<string, Config | null>;
	protected configClass: ConfigClass;

	/**
	 * @param configClass - Override class to construct.
	 */
	public constructor(configClass: ConfigClass) {
		this.cache = new Map<string, Config | null>();
		this.configClass = configClass;
	}

	/**
	 * Flush configuration cache.
	 *
	 * @param filename - If given only the cache for that file is flushed.
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
	 * @param filename - Filename to get configuration for.
	 */
	public fromTarget(filename: string): Config | null {
		if (filename === "inline") {
			return null;
		}

		if (this.cache.has(filename)) {
			return this.cache.get(filename) ?? null;
		}

		let found = false;
		let current = path.resolve(path.dirname(filename));
		let config = this.configClass.empty();

		// eslint-disable-next-line no-constant-condition
		while (true) {
			const jsonFile = path.join(current, ".htmlvalidate.json");
			if (fs.existsSync(jsonFile)) {
				const local = this.configClass.fromFile(jsonFile);
				found = true;
				config = local.merge(config);
			}

			const jsFile = path.join(current, ".htmlvalidate.js");
			if (fs.existsSync(jsFile)) {
				const local = this.configClass.fromFile(jsFile);
				found = true;
				config = local.merge(config);
			}

			/* stop if a configuration with "root" is set to true */
			if (config.isRootFound()) {
				break;
			}

			/* get the parent directory */
			const child = current;
			current = path.dirname(current);

			/* stop if this is the root directory */
			if (current === child) {
				break;
			}
		}

		/* no config was found by loader, return null and let caller decide what to do */
		if (!found) {
			this.cache.set(filename, null);
			return null;
		}

		this.cache.set(filename, config);
		return config;
	}
}
