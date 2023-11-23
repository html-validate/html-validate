import { Config } from "./config";
import { type ConfigData } from "./config-data";
import { type ResolvedConfig } from "./resolved-config";
import { type Resolver } from "./resolver";

/**
 * Configuration loader interface.
 *
 * A configuration loader takes a handle (typically a filename) and returns a
 * configuration for it.
 *
 * @public
 */
export abstract class ConfigLoader {
	protected readonly resolvers: Resolver[];
	protected readonly globalConfig: Config;

	public constructor(resolvers: Resolver[], config?: ConfigData) {
		const defaults = Config.empty();
		this.resolvers = resolvers;
		this.globalConfig = defaults.merge(
			this.resolvers,
			config ? this.loadFromObject(config) : this.defaultConfig(),
		);
	}

	/**
	 * Get configuration for given handle.
	 *
	 * Handle is typically a filename but it is up to the loader to interpret the
	 * handle as something useful.
	 *
	 * If [[configOverride]] is set it is merged with the final result.
	 *
	 * @param handle - Unique handle to get configuration for.
	 * @param configOverride - Optional configuration to merge final results with.
	 */
	public abstract getConfigFor(handle: string, configOverride?: ConfigData): ResolvedConfig;

	/**
	 * Flush configuration cache.
	 *
	 * Flushes all cached entries unless a specific handle is given.
	 *
	 * @param handle - If given only the cache for given handle will be flushed.
	 */
	public abstract flushCache(handle?: string): void;

	/**
	 * @internal For testing only
	 */
	public _getGlobalConfig(): ConfigData {
		return this.globalConfig.get();
	}

	/**
	 * Default configuration used when no explicit configuration is passed to constructor.
	 */
	protected abstract defaultConfig(): Config;

	protected empty(): Config {
		return Config.empty();
	}

	protected loadFromObject(options: ConfigData, filename?: string | null): Config {
		return Config.fromObject(this.resolvers, options, filename);
	}

	protected loadFromFile(filename: string): Config {
		return Config.fromFile(this.resolvers, filename);
	}
}
