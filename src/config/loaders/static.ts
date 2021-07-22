import { Config } from "../config";
import { ConfigData } from "../config-data";
import { ConfigLoader } from "../config-loader";

/**
 * The static configuration loader does not do any per-handle lookup. Only the
 * global or per-call configuration is used.
 *
 * In practice this means no configuration is fetch by traversing the
 * filesystem.
 */
export class StaticConfigLoader extends ConfigLoader {
	public override getConfigFor(handle: string, configOverride?: ConfigData): Config {
		const override = this.loadFromObject(configOverride || {});
		if (override.isRootFound()) {
			override.init();
			return override;
		}

		const merged = this.globalConfig.merge(override);
		merged.init();
		return merged;
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
