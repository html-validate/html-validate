import Ajv from "ajv";
import ajvSchemaDraft from "ajv/lib/refs/json-schema-draft-06.json";
import deepmerge from "deepmerge";
import { bundledElements } from "../elements";
import { ensureError, SchemaValidationError } from "../error";
import { MetaTable } from "../meta";
import { type MetaDataTable, type MetaElement, MetaCopyableProperty } from "../meta/element";
import { type Plugin } from "../plugin";
import schema from "../schema/config.json";
import { getTransformerFunction } from "../transform";
import bundledRules from "../rules";
import { Rule } from "../rule";
import {
	type ConfigData,
	type RuleConfig,
	type RuleOptions,
	type TransformMap,
} from "./config-data";
import defaultConfig from "./default";
import { ConfigError } from "./error";
import { type Severity, parseSeverity } from "./severity";
import Presets from "./presets";
import { type ResolvedConfigData, type TransformerEntry, ResolvedConfig } from "./resolved-config";
import { type Resolver, resolvePlugin, resolveConfig, resolveElements } from "./resolver";

/**
 * Internal interface for a loaded plugin.
 *
 * @internal
 */
export interface LoadedPlugin extends Plugin {
	name: string;
	originalName: string;
}

const ajv = new Ajv({ strict: true, strictTuples: true, strictTypes: true });
ajv.addMetaSchema(ajvSchemaDraft);

const validator = ajv.compile(schema);

function overwriteMerge<T>(a: T[], b: T[]): T[] {
	return b;
}

function mergeInternal(base: ConfigData, rhs: ConfigData): ConfigData {
	const dst = deepmerge(base, { ...rhs, rules: {} });

	/* rules need some special care, should overwrite arrays instead of
	 * concaternation, i.e. ["error", {...options}] should not be merged by
	 * appending to old value */
	if (rhs.rules) {
		dst.rules = deepmerge(dst.rules, rhs.rules, { arrayMerge: overwriteMerge });
	}

	/* root property is merged with boolean "or" since it should always be truthy
	 * if any config has it set. */
	const root = Boolean(base.root) || Boolean(rhs.root);
	if (root) {
		dst.root = root;
	}

	return dst;
}

function toArray<T>(value: T | T[]): T[] {
	if (Array.isArray(value)) {
		return value;
	} else {
		return [value];
	}
}

/**
 * Configuration holder.
 *
 * Each file being validated will have a unique instance of this class.
 *
 * @public
 */
export class Config {
	private config: ConfigData;
	private configurations: Map<string, ConfigData>;
	private initialized: boolean;

	private resolvers: Resolver[];
	private metaTable: MetaTable | null;
	private plugins: LoadedPlugin[];
	private transformers: TransformerEntry[] = [];

	/**
	 * Create a new blank configuration. See also `Config.defaultConfig()`.
	 */
	public static empty(): Config {
		return Config.create([], {
			extends: [],
			rules: {},
			plugins: [],
			transform: {},
		});
	}

	/**
	 * Create configuration from object.
	 */
	public static fromObject(
		resolvers: Resolver | Resolver[],
		options: ConfigData,
		filename: string | null = null,
	): Config {
		Config.validate(options, filename);
		return Config.create(resolvers, options);
	}

	/**
	 * Read configuration from filename.
	 *
	 * Note: this reads configuration data from a file. If you intent to load
	 * configuration for a file to validate use `ConfigLoader.fromTarget()`.
	 *
	 * @internal
	 * @param filename - The file to read from
	 */
	public static fromFile(resolvers: Resolver | Resolver[], filename: string): Config {
		const configData = resolveConfig(toArray(resolvers), filename, { cache: false });
		return Config.fromObject(resolvers, configData, filename);
	}

	/**
	 * Validate configuration data.
	 *
	 * Throws SchemaValidationError if invalid.
	 *
	 * @internal
	 */
	public static validate(configData: ConfigData, filename: string | null = null): void {
		const valid = validator(configData);
		if (!valid) {
			throw new SchemaValidationError(
				filename,
				`Invalid configuration`,
				configData,
				schema,
				/* istanbul ignore next: will be set when a validation error has occurred */
				validator.errors ?? [],
			);
		}

		if (configData.rules) {
			const normalizedRules = Config.getRulesObject(configData.rules);
			for (const [ruleId, [, ruleOptions]] of normalizedRules.entries()) {
				const cls = bundledRules[ruleId];
				const path = `/rules/${ruleId}/1`;
				Rule.validateOptions(cls, ruleId, path, ruleOptions, filename, configData);
			}
		}
	}

	/**
	 * Load a default configuration object.
	 */
	public static defaultConfig(): Config {
		return Config.create([], defaultConfig);
	}

	/**
	 * @internal
	 */
	private static create(resolvers: Resolver | Resolver[], options: ConfigData): Config {
		const instance = new Config(resolvers, options);

		/* load plugins */
		instance.plugins = instance.loadPlugins(instance.config.plugins ?? []);
		instance.configurations = instance.loadConfigurations(instance.plugins);
		instance.extendMeta(instance.plugins);

		/* process extended configs */
		instance.config = instance.extendConfig(instance.config.extends ?? []);

		/* reset extends as we already processed them, this prevents the next config
		 * from reapplying config from extended config as well as duplicate entries
		 * when merging arrays */
		instance.config.extends = [];

		/* rules explicitly set by passed options should have precedence over any
		 * extended rules, not the other way around. */
		if (options.rules) {
			instance.config = mergeInternal(instance.config, { rules: options.rules });
		}

		return instance;
	}

	/**
	 * @internal
	 */
	private constructor(resolvers: Resolver | Resolver[], options: ConfigData) {
		const initial: ConfigData = {
			extends: [],
			plugins: [],
			rules: {},
			transform: {},
		};
		this.config = mergeInternal(initial, options);
		this.configurations = new Map();
		this.initialized = false;
		this.resolvers = toArray(resolvers);
		this.metaTable = null;
		this.plugins = [];
	}

	/**
	 * Initialize plugins, transforms etc.
	 *
	 * Must be called before trying to use config. Can safely be called multiple
	 * times.
	 *
	 * @public
	 */
	public init(): void {
		if (this.initialized) {
			return;
		}

		/* precompile transform patterns */
		this.transformers = this.precompileTransformers(this.config.transform ?? {});

		this.initialized = true;
	}

	/**
	 * Returns true if this configuration is marked as "root".
	 */
	public isRootFound(): boolean {
		return Boolean(this.config.root);
	}

	/**
	 * Returns a new configuration as a merge of the two. Entries from the passed
	 * object takes priority over this object.
	 *
	 * @public
	 * @param rhs - Configuration to merge with this one.
	 */
	public merge(resolvers: Resolver[], rhs: Config): Config {
		return Config.create(resolvers, mergeInternal(this.config, rhs.config));
	}

	private extendConfig(entries: string[]): ConfigData {
		if (entries.length === 0) {
			return this.config;
		}

		let base: ConfigData = {};
		for (const entry of entries) {
			let extended: ConfigData;
			if (this.configurations.has(entry)) {
				extended = this.configurations.get(entry)!; // eslint-disable-line @typescript-eslint/no-non-null-assertion -- map has/get combo
			} else {
				extended = Config.fromFile(this.resolvers, entry).config;
			}
			base = mergeInternal(base, extended);
		}
		return mergeInternal(base, this.config);
	}

	/**
	 * Get element metadata.
	 *
	 * @internal
	 */
	public getMetaTable(): MetaTable {
		/* use cached table if it exists */
		if (this.metaTable) {
			return this.metaTable;
		}

		const metaTable = new MetaTable();
		const source = this.config.elements ?? ["html5"];

		/* extend validation schema from plugins */
		for (const plugin of this.getPlugins()) {
			if (plugin.elementSchema) {
				metaTable.extendValidationSchema(plugin.elementSchema);
			}
		}

		/* load from all entries */
		for (const entry of source) {
			/* load meta directly from entry */
			if (typeof entry !== "string") {
				metaTable.loadFromObject(entry as MetaDataTable);
				continue;
			}

			/* try searching builtin metadata */
			const bundled = bundledElements[entry] as MetaDataTable | undefined;
			if (bundled) {
				metaTable.loadFromObject(bundled);
				continue;
			}

			/* load with resolver */
			try {
				const data = resolveElements(this.resolvers, entry, { cache: false });
				metaTable.loadFromObject(data, entry);
			} catch (err: unknown) {
				/* istanbul ignore next: only used as a fallback */
				const message = err instanceof Error ? err.message : String(err);
				throw new ConfigError(
					`Failed to load elements from "${entry}": ${message}`,
					ensureError(err),
				);
			}
		}

		metaTable.init();
		return (this.metaTable = metaTable);
	}

	/**
	 * Get a copy of internal configuration data.
	 *
	 * @internal primary purpose is unittests
	 */
	/* istanbul ignore next: used for testing only */
	public get(): ConfigData {
		return { ...this.config };
	}

	/**
	 * Get all configured rules, their severity and options.
	 *
	 * @internal
	 */
	public getRules(): Map<string, [Severity, RuleOptions]> {
		/* istanbul ignore next: only used as a fallback */
		return Config.getRulesObject(this.config.rules ?? {});
	}

	private static getRulesObject(src: RuleConfig): Map<string, [Severity, RuleOptions]> {
		const rules = new Map<string, [Severity, RuleOptions]>();
		for (const [ruleId, data] of Object.entries(src)) {
			let options = data;
			if (!Array.isArray(options)) {
				options = [options, {}];
			} else if (options.length === 1) {
				options = [options[0], {}];
			}
			const severity = parseSeverity(options[0]);
			rules.set(ruleId, [severity, options[1]]);
		}
		return rules;
	}

	/**
	 * Get all configured plugins.
	 *
	 * @internal
	 */
	public getPlugins(): Plugin[] {
		return this.plugins;
	}

	private loadPlugins(plugins: Array<string | Plugin>): LoadedPlugin[] {
		return plugins.map((moduleName: string | Plugin, index: number) => {
			if (typeof moduleName !== "string") {
				const plugin = moduleName as LoadedPlugin;
				plugin.name = plugin.name || `:unnamedPlugin@${String(index + 1)}`;
				plugin.originalName = `:unnamedPlugin@${String(index + 1)}`;
				return plugin;
			}

			try {
				const plugin = resolvePlugin(this.resolvers, moduleName, { cache: true }) as LoadedPlugin;
				plugin.name = plugin.name || moduleName;
				plugin.originalName = moduleName;
				return plugin;
			} catch (err: unknown) {
				/* istanbul ignore next: only used as a fallback */
				const message = err instanceof Error ? err.message : String(err);
				throw new ConfigError(
					`Failed to load plugin "${moduleName}": ${message}`,
					ensureError(err),
				);
			}
		});
	}

	private loadConfigurations(plugins: LoadedPlugin[]): Map<string, ConfigData> {
		const configs = new Map<string, ConfigData>();

		/* builtin presets */
		for (const [name, config] of Object.entries(Presets)) {
			Config.validate(config, name);
			configs.set(name, config);
		}

		/* presets from plugins */
		for (const plugin of plugins) {
			for (const [name, config] of Object.entries(plugin.configs ?? {})) {
				if (!config) continue;

				Config.validate(config, name);

				/* add configuration with name provided by plugin */
				configs.set(`${plugin.name}:${name}`, config);

				/* add configuration with name provided by user (in config file) */
				if (plugin.name !== plugin.originalName) {
					configs.set(`${plugin.originalName}:${name}`, config);
				}
			}
		}

		return configs;
	}

	private extendMeta(plugins: LoadedPlugin[]): void {
		for (const plugin of plugins) {
			if (!plugin.elementSchema) {
				continue;
			}

			const { properties } = plugin.elementSchema;
			if (!properties) {
				continue;
			}

			for (const [raw, schema] of Object.entries(properties)) {
				/* at compile time this is a fixed list but the point of this method is
				 * to augment the runtime with additional keys so it is a bit of lying
				 * to typescript */
				const key = raw as keyof MetaElement;
				if ((schema as any).copyable && !MetaCopyableProperty.includes(key)) {
					MetaCopyableProperty.push(key);
				}
			}
		}
	}

	/**
	 * Resolve all configuration and return a [[ResolvedConfig]] instance.
	 *
	 * A resolved configuration will merge all extended configs and load all
	 * plugins and transformers, and normalize the rest of the configuration.
	 *
	 * @public
	 */
	public resolve(): ResolvedConfig {
		return new ResolvedConfig(this.resolveData(), this.get());
	}

	/**
	 * Same as [[resolve]] but returns the raw configuration data instead of
	 * [[ResolvedConfig]] instance. Mainly used for testing.
	 *
	 * @internal
	 */
	public resolveData(): ResolvedConfigData {
		return {
			metaTable: this.getMetaTable(),
			plugins: this.getPlugins(),
			rules: this.getRules(),
			transformers: this.transformers,
		};
	}

	private precompileTransformers(transform: TransformMap): TransformerEntry[] {
		return Object.entries(transform).map(([pattern, name]) => {
			// eslint-disable-next-line security/detect-non-literal-regexp -- expected to be a regexp
			const regex = new RegExp(pattern);
			const fn = getTransformerFunction(this.resolvers, name, this.plugins);
			return { pattern: regex, name, fn };
		});
	}
}
