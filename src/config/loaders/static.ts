import { type Config } from "../config";
import { type ConfigData } from "../config-data";
import { type ConfigFactory, ConfigLoader } from "../config-loader";
import { type ResolvedConfig } from "../resolved-config";
import { type Resolver } from "../resolver";

const defaultResolvers: Resolver[] = [];

type ConstructorParametersDefault = [ConfigData?, ConfigFactory?];
type ConstructorParametersResolver = [Resolver[], ConfigData?, ConfigFactory?];
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
	public constructor(config?: ConfigData, configFactory?: ConfigFactory);

	/**
	 * Create a static configuration loader with custom resolvers.
	 *
	 * @param resolvers - Resolvers to use
	 * @param config - Global configuration
	 * @param configFactory - Optional configuration factory
	 */
	public constructor(resolvers: Resolver[], config?: ConfigData, configFactory?: ConfigFactory);

	public constructor(...args: ConstructorParameters) {
		if (hasResolver(args)) {
			const [resolvers, config, configFactory] = args;
			super(resolvers, config, configFactory);
		} else {
			const [config, configFactory] = args;
			super(defaultResolvers, config, configFactory);
		}
	}

	public override getConfigFor(_handle: string, configOverride?: ConfigData): ResolvedConfig {
		const override = this.loadFromObject(configOverride || {});
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
