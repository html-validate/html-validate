import { Config } from "./config";
import { ConfigData } from "./config-data";

/**
 * Configuration loader interface.
 *
 * A configuration loader takes a handle (typically a filename) and returns a
 * configuration for it.
 *
 * @public
 */
export abstract class ConfigLoader {
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
	abstract getConfigFor(handle: string, configOverride?: ConfigData): Config;

	/**
	 * Flush configuration cache.
	 *
	 * Flushes all cached entries unless a specific handle is given.
	 *
	 * @param handle - If given only the cache for given handle will be flushed.
	 */
	abstract flushCache(handle?: string): void;
}
