import { type Config } from "../config";
import { type ConfigData } from "../config-data";
import { ConfigLoader } from "../config-loader";
import { type ResolvedConfig } from "../resolved-config";

/**
 * The static configuration loader does not do any per-handle lookup. Only the
 * global or per-call configuration is used.
 *
 * In practice this means no configuration is fetch by traversing the
 * filesystem.
 *
 * @public
 */
export class StaticConfigLoader extends ConfigLoader {
	public override getConfigFor(handle: string, configOverride?: ConfigData): ResolvedConfig {
		const override = this.loadFromObject(configOverride || {});
		if (override.isRootFound()) {
			override.init();
			return override.resolve();
		}

		const merged = this.globalConfig.merge(override);
		merged.init();
		return merged.resolve();
	}

	public override flushCache(): void {
		/* do nothing */
	}

	protected defaultConfig(): Config {
		return this.loadFromObject({
			extends: ["html-validate:recommended"],
			elements: ["html5"],
		});
	}
}
