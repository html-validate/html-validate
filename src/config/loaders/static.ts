import { Config } from "../config";
import { type ConfigData } from "../config-data";
import { ConfigLoader } from "../config-loader";
import { type ResolvedConfig } from "../resolved-config";
import { type Resolver } from "../resolver";

const defaultResolvers: Resolver[] = [];

type ConstructorParametersDefault = [ConfigData?];
type ConstructorParametersResolver = [Resolver[], ConfigData?];
type ConstructorParameters = ConstructorParametersDefault | ConstructorParametersResolver;

function hasResolver(value: ConstructorParameters): value is ConstructorParametersResolver {
	return Array.isArray(value[0]);
}

/**
 * The static configuration loader does not do any per-handle lookup. Only the
 * global or per-call configuration is used.
 *
 * In practice this means no configuration is fetched by traversing the
 * filesystem.
 *
 * @public
 */
export class StaticConfigLoader extends ConfigLoader {
	/**
	 * Create a static configuration loader with default resolvers.
	 *
	 * @param config - Global configuration
	 * @param configFactory - Optional configuration factory
	 */
	public constructor(config?: ConfigData);

	/**
	 * Create a static configuration loader with custom resolvers.
	 *
	 * @param resolvers - Resolvers to use
	 * @param config - Global configuration
	 * @param configFactory - Optional configuration factory
	 */
	public constructor(resolvers: Resolver[], config?: ConfigData);

	public constructor(...args: ConstructorParameters) {
		if (hasResolver(args)) {
			const [resolvers, config] = args;
			super(resolvers, config);
		} else {
			const [config] = args;
			super(defaultResolvers, config);
		}
	}

	/**
	 * Set a new configuration for this loader.
	 *
	 * @public
	 * @since 8.20.0
	 * @param config - New configuration to use.
	 */
	/* istanbul ignore next -- not testing setters/getters */
	public setConfig(config: ConfigData): void {
		const defaults = Config.empty();
		this.globalConfig = defaults.merge(this.resolvers, this.loadFromObject(config));
	}

	public override getConfigFor(_handle: string, configOverride?: ConfigData): ResolvedConfig {
		const override = this.loadFromObject(configOverride ?? {});
		if (override.isRootFound()) {
			override.init();
			return override.resolve();
		}

		const merged = this.globalConfig.merge(this.resolvers, override);
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
