import { Config } from "./config";
import { type ConfigData } from "./config-data";
import { type ResolvedConfig } from "./resolved-config";

/**
 * @public
 */
export interface ConfigFactory {
	defaultConfig(): Config;
	empty(): Config;
	fromObject(options: ConfigData, filename?: string | null): Config;
	fromFile(filename: string): Config;
}

/**
 * Configuration loader interface.
 *
 * A configuration loader takes a handle (typically a filename) and returns a
 * configuration for it.
 *
 * @public
 */
export abstract class ConfigLoader {
	protected readonly configFactory: ConfigFactory;
	protected readonly globalConfig: Config;

	public constructor(config?: ConfigData, configFactory: ConfigFactory = Config) {
		const defaults = configFactory.empty();
		this.configFactory = configFactory;
		this.globalConfig = defaults.merge(config ? this.loadFromObject(config) : this.defaultConfig());
	}

	/**
	 * Get configuration for given handle.
	 *
	 * Handle is typically a filename but it is up to the loader to interpret the
	 * handle as something useful.
	 *
	 * If [[configOverride]] is set it is merged with the final result.
	 *
	 * Returning a [[Config]] instance is deprecated and support will be removed
	 * in the next major release.
	 *
	 * @param handle - Unique handle to get configuration for.
	 * @param configOverride - Optional configuration to merge final results with.
	 */
	public abstract getConfigFor(
		handle: string,
		configOverride?: ConfigData
	): Config | ResolvedConfig;

	/**
	 * Flush configuration cache.
	 *
	 * Flushes all cached entries unless a specific handle is given.
	 *
	 * @param handle - If given only the cache for given handle will be flushed.
	 */
	public abstract flushCache(handle?: string): void;

	/**
	 * Default configuration used when no explicit configuration is passed to constructor.
	 */
	protected abstract defaultConfig(): Config;

	protected empty(): Config {
		return this.configFactory.empty();
	}

	protected loadFromObject(options: ConfigData, filename?: string | null): Config {
		return this.configFactory.fromObject(options, filename);
	}

	protected loadFromFile(filename: string): Config {
		return this.configFactory.fromFile(filename);
	}
}
