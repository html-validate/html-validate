import { isThenable } from "../../utils";
import { type Config } from "../config";
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
	public setConfig(config: ConfigData): void {
		this.setConfigData(config);
	}

	public override getConfigFor(
		_handle: string,
		configOverride?: ConfigData,
	): ResolvedConfig | Promise<ResolvedConfig> {
		const override = this.loadFromObject(configOverride ?? {});

		if (isThenable(override)) {
			return override.then((override) => this._resolveConfig(override));
		} else {
			return this._resolveConfig(override);
		}
	}

	public override flushCache(): void {
		/* do nothing */
	}

	protected defaultConfig(): Config | Promise<Config> {
		return this.loadFromObject({
			extends: ["html-validate:recommended"],
			elements: ["html5"],
		});
	}

	private _resolveConfig(override: Config): ResolvedConfig | Promise<ResolvedConfig> {
		if (override.isRootFound()) {
			return override.resolve();
		}

		const globalConfig = this.getGlobalConfig();
		if (isThenable(globalConfig)) {
			return globalConfig.then((globalConfig) => {
				const merged = globalConfig.merge(this.resolvers, override);
				/* istanbul ignore if -- covered by tsc, hard to recreate even with very specific testcases */
				if (isThenable(merged)) {
					return merged.then((merged) => {
						return merged.resolve();
					});
				} else {
					return merged.resolve();
				}
			});
		} else {
			const merged = globalConfig.merge(this.resolvers, override);
			/* istanbul ignore if -- covered by tsc, hard to recreate even with very specific testcases */
			if (isThenable(merged)) {
				return merged.then((merged) => {
					return merged.resolve();
				});
			} else {
				return merged.resolve();
			}
		}
	}
}
