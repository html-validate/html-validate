import { UserError } from "../error";
import { isThenable } from "../utils";
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
	private _globalConfig: Config | null;
	private _configData: ConfigData | undefined;

	protected readonly resolvers: Resolver[];

	/**
	 * Create a new ConfigLoader.
	 *
	 * @param resolvers - Sorted list of resolvers to use (in order).
	 * @param configData - Default configuration (which all configurations will inherit from).
	 */
	public constructor(resolvers: Resolver[], configData?: ConfigData) {
		this.resolvers = resolvers;
		this._configData = configData;
		this._globalConfig = null;
	}

	/**
	 * Set a new default configuration on this loader. Resets cached global
	 * configuration.
	 *
	 * @internal
	 */
	protected setConfigData(configData: ConfigData): void {
		this._configData = configData;
		this._globalConfig = null;
	}

	/**
	 * Get the global configuration.
	 *
	 * @returns A promise resolving to the global configuration.
	 */
	protected getGlobalConfig(): Config | Promise<Config> {
		if (this._globalConfig) {
			return this._globalConfig;
		}
		const config = this._configData ? this.loadFromObject(this._configData) : this.defaultConfig();
		if (isThenable(config)) {
			return config.then((config) => {
				this._globalConfig = config;
				return this._globalConfig;
			});
		} else {
			this._globalConfig = config;
			return this._globalConfig;
		}
	}

	/**
	 * Get the global configuration.
	 *
	 * The synchronous version does not support async resolvers.
	 *
	 * @returns The global configuration.
	 */
	protected getGlobalConfigSync(): Config {
		if (this._globalConfig) {
			return this._globalConfig;
		}
		const config = this._configData ? this.loadFromObject(this._configData) : this.defaultConfig();
		if (isThenable(config)) {
			throw new UserError("Cannot load async config from sync function");
		}
		this._globalConfig = config;
		return this._globalConfig;
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
	public abstract getConfigFor(
		handle: string,
		configOverride?: ConfigData,
	): ResolvedConfig | Promise<ResolvedConfig>;

	/**
	 * @internal
	 */
	public getResolvers(): Resolver[] {
		return this.resolvers;
	}

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
	public async _getGlobalConfig(): Promise<ConfigData> {
		const config = await this.getGlobalConfig();
		return config.get();
	}

	/**
	 * Default configuration used when no explicit configuration is passed to constructor.
	 */
	protected abstract defaultConfig(): Config | Promise<Config>;

	protected empty(): Config {
		return Config.empty();
	}

	/**
	 * Load configuration from object.
	 */
	protected loadFromObject(
		options: ConfigData,
		filename?: string | null,
	): Config | Promise<Config> {
		return Config.fromObject(this.resolvers, options, filename);
	}

	/**
	 * Load configuration from filename.
	 */
	protected loadFromFile(filename: string): Config | Promise<Config> {
		return Config.fromFile(this.resolvers, filename);
	}
}
