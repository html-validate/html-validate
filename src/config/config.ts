import fs from "fs";
import path from "path";
import Ajv from "ajv";
import ajvSchemaDraft from "ajv/lib/refs/json-schema-draft-06.json";
import deepmerge from "deepmerge";
import { bundledElements } from "../elements";
import { ensureError, SchemaValidationError } from "../error";
import { MetaTable } from "../meta";
import { type MetaDataTable, type MetaElement, MetaCopyableProperty } from "../meta/element";
import { type Plugin } from "../plugin";
import schema from "../schema/config.json";
import { type Transformer, TRANSFORMER_API } from "../transform";
import { requireUncached } from "../utils/require-uncached";
import { legacyRequire } from "../resolve";
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

/**
 * Internal interface for a loaded plugin.
 *
 * @internal
 */
export interface LoadedPlugin extends Plugin {
	name: string;
	originalName: string;
}

let rootDirCache: string | null = null;

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
	const root = base.root || rhs.root;
	if (root) {
		dst.root = root;
	}

	return dst;
}

/**
 * @internal
 */
export function configDataFromFile(filename: string): ConfigData {
	let json;
	try {
		/* load using require as it can process both js and json */
		/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- technical debt, should be refactored into something more typesafe */
		json = requireUncached(legacyRequire, filename) as any;
	} catch (err: unknown) {
		throw new ConfigError(`Failed to read configuration from "${filename}"`, ensureError(err));
	}

	/* expand any relative paths */
	for (const key of ["extends", "elements", "plugins"]) {
		/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- technical debt, should be refactored into something more typesafe */
		const value: undefined | string[] = json[key];
		if (!value) continue;
		json[key] = value.map((ref: string) => {
			return Config.expandRelative(ref, path.dirname(filename));
		});
	}

	return json as ConfigData;
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

	private metaTable: MetaTable | null;
	private plugins: LoadedPlugin[];
	private transformers: TransformerEntry[] = [];
	private rootDir: string;

	/**
	 * Create a new blank configuration. See also `Config.defaultConfig()`.
	 */
	public static empty(): Config {
		return new Config({
			extends: [],
			rules: {},
			plugins: [],
			transform: {},
		});
	}

	/**
	 * Create configuration from object.
	 */
	public static fromObject(options: ConfigData, filename: string | null = null): Config {
		Config.validate(options, filename);
		return new Config(options);
	}

	/**
	 * Read configuration from filename.
	 *
	 * Note: this reads configuration data from a file. If you intent to load
	 * configuration for a file to validate use `ConfigLoader.fromTarget()`.
	 *
	 * @param filename - The file to read from or one of the presets such as
	 * `html-validate:recommended`.
	 */
	public static fromFile(filename: string): Config {
		const configdata = configDataFromFile(filename);
		return Config.fromObject(configdata, filename);
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
				validator.errors ?? []
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
		return new Config(defaultConfig);
	}

	/**
	 * @internal
	 */
	public constructor(options?: ConfigData) {
		const initial: ConfigData = {
			extends: [],
			plugins: [],
			rules: {},
			transform: {},
		};
		this.config = mergeInternal(initial, options || {});
		this.metaTable = null;
		this.rootDir = this.findRootDir();
		this.initialized = false;

		/* load plugins */
		this.plugins = this.loadPlugins(this.config.plugins || []);
		this.configurations = this.loadConfigurations(this.plugins);
		this.extendMeta(this.plugins);

		/* process extended configs */
		this.config = this.extendConfig(this.config.extends ?? []);

		/* reset extends as we already processed them, this prevents the next config
		 * from reapplying config from extended config as well as duplicate entries
		 * when merging arrays */
		this.config.extends = [];

		/* rules explicitly set by passed options should have precedence over any
		 * extended rules, not the other way around. */
		if (options && options.rules) {
			this.config = mergeInternal(this.config, { rules: options.rules });
		}
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
		this.transformers = this.precompileTransformers(this.config.transform || {});

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
	public merge(rhs: Config): Config {
		return new Config(mergeInternal(this.config, rhs.config));
	}

	private extendConfig(entries: string[]): ConfigData {
		if (entries.length === 0) {
			return this.config;
		}

		let base: ConfigData = {};
		for (let i = 0; i < entries.length; i++) {
			const entry = entries[i];
			let extended: ConfigData;
			if (this.configurations.has(entry)) {
				extended = this.configurations.get(entry) as ConfigData;
			} else {
				extended = Config.fromFile(entry).config;
			}
			base = mergeInternal(base, extended);
		}
		return mergeInternal(base, this.config);
	}

	/**
	 * Get element metadata.
	 */
	public getMetaTable(): MetaTable {
		/* use cached table if it exists */
		if (this.metaTable) {
			return this.metaTable;
		}

		const metaTable = new MetaTable();
		const source = this.config.elements || ["html5"];

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
			const bundled = bundledElements[entry];
			if (bundled) {
				metaTable.loadFromObject(bundled);
				continue;
			}

			/* assume it is loadable with require() */
			const id = entry.replace("<rootDir>", this.rootDir);
			try {
				const data = legacyRequire(id) as unknown;
				metaTable.loadFromObject(data, id);
			} catch (err: unknown) {
				/* istanbul ignore next: only used as a fallback */
				const message = err instanceof Error ? err.message : String(err);
				throw new ConfigError(`Failed to load elements from "${id}": ${message}`, ensureError(err));
			}
		}

		metaTable.init();
		return (this.metaTable = metaTable);
	}

	/**
	 * @internal exposed for testing only
	 */
	public static expandRelative(src: string, currentPath: string): string {
		if (src[0] === ".") {
			return path.normalize(`${currentPath}/${src}`);
		}
		return src;
	}

	/**
	 * Get a copy of internal configuration data.
	 *
	 * @internal primary purpose is unittests
	 */
	/* istanbul ignore next: used for testing only */
	public get(): ConfigData {
		const config = { ...this.config };
		if (config.elements) {
			config.elements = config.elements.map((cur) => {
				if (typeof cur === "string") {
					return cur.replace(this.rootDir, "<rootDir>");
				} else {
					return cur;
				}
			});
		}
		delete config.extends;
		return config;
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
		return plugins.map((moduleName: string | Plugin, index) => {
			if (typeof moduleName !== "string") {
				const plugin = moduleName as LoadedPlugin;
				plugin.name = plugin.name || `:anonymous@${index}`;
				plugin.originalName = `:anonymous@${index}`;
				return plugin;
			}

			try {
				const plugin = legacyRequire(moduleName.replace("<rootDir>", this.rootDir)) as LoadedPlugin;
				plugin.name = plugin.name || moduleName;
				plugin.originalName = moduleName;
				return plugin;
			} catch (err: unknown) {
				/* istanbul ignore next: only used as a fallback */
				const message = err instanceof Error ? err.message : String(err);
				throw new ConfigError(
					`Failed to load plugin "${moduleName}": ${message}`,
					ensureError(err)
				);
			}
		});
	}

	private loadConfigurations(plugins: LoadedPlugin[]): Map<string, ConfigData> {
		const configs: Map<string, ConfigData> = new Map();

		/* builtin presets */
		for (const [name, config] of Object.entries(Presets)) {
			Config.validate(config, name);
			configs.set(name, config);
		}

		/* presets from plugins */
		for (const plugin of plugins) {
			for (const [name, config] of Object.entries(plugin.configs || {})) {
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
			try {
				const fn = this.getTransformFunction(name);
				const version = fn.api ?? 0;

				/* check if transformer version is supported */
				if (version !== TRANSFORMER_API.VERSION) {
					throw new ConfigError(
						`Transformer uses API version ${version} but only version ${TRANSFORMER_API.VERSION} is supported`
					);
				}

				return {
					// eslint-disable-next-line security/detect-non-literal-regexp -- expected to be a regexp
					pattern: new RegExp(pattern),

					name,
					fn,
				};
			} catch (err: unknown) {
				if (err instanceof ConfigError) {
					throw new ConfigError(`Failed to load transformer "${name}": ${err.message}`, err);
				} else {
					throw new ConfigError(`Failed to load transformer "${name}"`, ensureError(err));
				}
			}
		});
	}

	/**
	 * Get transformation function requested by configuration.
	 *
	 * Searches:
	 *
	 * - Named transformers from plugins.
	 * - Unnamed transformer from plugin.
	 * - Standalone modules (local or node_modules)
	 *
	 * @param name - Key from configuration
	 */
	private getTransformFunction(name: string): Transformer {
		/* try to match a named transformer from plugin */
		const match = name.match(/(.*):(.*)/);
		if (match) {
			const [, pluginName, key] = match;
			return this.getNamedTransformerFromPlugin(name, pluginName, key);
		}

		/* try to match an unnamed transformer from plugin */
		const plugin = this.plugins.find((cur) => cur.name === name);
		if (plugin) {
			return this.getUnnamedTransformerFromPlugin(name, plugin);
		}

		/* assume transformer refers to a regular module */
		return this.getTransformerFromModule(name);
	}

	/**
	 * @param name - Original name from configuration
	 * @param pluginName - Name of plugin
	 * @param key - Name of transform (from plugin)
	 */
	private getNamedTransformerFromPlugin(
		name: string,
		pluginName: string,
		key: string
	): Transformer {
		const plugin = this.plugins.find((cur) => cur.name === pluginName);
		if (!plugin) {
			throw new ConfigError(`No plugin named "${pluginName}" has been loaded`);
		}

		if (!plugin.transformer) {
			throw new ConfigError(`Plugin does not expose any transformer`);
		}

		if (typeof plugin.transformer === "function") {
			throw new ConfigError(
				`Transformer "${name}" refers to named transformer but plugin exposes only unnamed, use "${pluginName}" instead.`
			);
		}

		const transformer = plugin.transformer[key];
		if (!transformer) {
			throw new ConfigError(`Plugin "${pluginName}" does not expose a transformer named "${key}".`);
		}

		return transformer;
	}

	/**
	 * @param name - Original name from configuration
	 * @param plugin - Plugin instance
	 */
	private getUnnamedTransformerFromPlugin(name: string, plugin: Plugin): Transformer {
		if (!plugin.transformer) {
			throw new ConfigError(`Plugin does not expose any transformer`);
		}

		if (typeof plugin.transformer !== "function") {
			if (plugin.transformer.default) {
				return plugin.transformer.default;
			}
			throw new ConfigError(
				`Transformer "${name}" refers to unnamed transformer but plugin exposes only named.`
			);
		}

		return plugin.transformer;
	}

	private getTransformerFromModule(name: string): Transformer {
		/* expand <rootDir> */
		const moduleName = name.replace("<rootDir>", this.rootDir);

		/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- technical debt, the code kinda does the right thing but it should be reflected in the typing too */
		const fn = legacyRequire(moduleName);

		/* sanity check */
		if (typeof fn !== "function") {
			/* this is not a proper transformer, is it a plugin exposing a transformer? */
			if (fn.transformer) {
				throw new ConfigError(
					`Module is not a valid transformer. This looks like a plugin, did you forget to load the plugin first?`
				);
			}

			throw new ConfigError(`Module is not a valid transformer.`);
		}

		return fn as Transformer;
	}

	/**
	 * @internal
	 */
	protected get rootDirCache(): string | null {
		/* return global instance */
		return rootDirCache;
	}

	protected set rootDirCache(value: string | null) {
		/* set global instance */
		rootDirCache = value;
	}

	/**
	 * @internal
	 */
	protected findRootDir(): string {
		const cache = this.rootDirCache;
		if (cache !== null) {
			return cache;
		}

		/* try to locate package.json */
		let current = process.cwd();
		// eslint-disable-next-line no-constant-condition -- break outs when filesystem is traversed
		while (true) {
			const search = path.join(current, "package.json");
			if (fs.existsSync(search)) {
				return (this.rootDirCache = current);
			}

			/* get the parent directory */
			const child = current;
			current = path.dirname(current);

			/* stop if this is the root directory */
			if (current === child) {
				break;
			}
		}

		/* default to working directory if no package.json is found */
		return (this.rootDirCache = process.cwd());
	}
}
