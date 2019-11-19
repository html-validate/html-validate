import deepmerge from "deepmerge";
import fs from "fs";
import path from "path";
import { Source } from "../context";
import { NestedError } from "../error";
import { MetaTable } from "../meta";
import { MetaDataTable } from "../meta/element";
import { Plugin } from "../plugin";
import { TransformContext, Transformer, TRANSFORMER_API } from "../transform";
import { ConfigData, TransformMap } from "./config-data";
import defaultConfig from "./default";
import { ConfigError } from "./error";
import { parseSeverity, Severity } from "./severity";

interface TransformerEntry {
	pattern: RegExp;
	fn: Transformer;
}

const recommended = require("./recommended");
const document = require("./document");
let rootDirCache: string = null;

function overwriteMerge<T>(a: T[], b: T[]): T[] {
	return b;
}

function mergeInternal(base: ConfigData, rhs: ConfigData): ConfigData {
	const dst = deepmerge(base, Object.assign({}, rhs, { rules: {} }));

	/* rules need some special care, should overwrite arrays instead of
	 * concaternation, i.e. ["error", {...options}] should not be merged by
	 * appending to old value */
	if (rhs.rules) {
		dst.rules = deepmerge(dst.rules, rhs.rules, { arrayMerge: overwriteMerge });
	}

	/* root property is merged with boolean "or" since it should always be truthy
	 * if any config has it set. */
	if (base.root || rhs.root) {
		dst.root = base.root || rhs.root;
	}

	return dst;
}

function loadFromFile(filename: string): ConfigData {
	let json;
	try {
		const data = fs.readFileSync(filename, "utf-8");
		json = JSON.parse(data);
	} catch (err) {
		throw new ConfigError(
			`Failed to read configuration from "${filename}"`,
			err
		);
	}

	/* expand any relative paths */
	for (const key of ["extends", "elements", "plugins"]) {
		if (!json[key]) continue;
		json[key] = json[key].map((ref: string) => {
			return Config.expandRelative(ref, path.dirname(filename));
		});
	}

	return json;
}

/**
 * Configuration holder.
 *
 * Each file being validated will have a unique instance of this class.
 */
export class Config {
	private config: ConfigData;
	private configurations: Map<string, ConfigData>;
	protected metaTable: MetaTable;
	protected plugins: Plugin[];
	protected transformers: TransformerEntry[];
	protected rootDir: string;

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
	public static fromObject(options: ConfigData): Config {
		return new Config(options);
	}

	/**
	 * Read configuration from filename.
	 *
	 * Note: this reads configuration data from a file. If you intent to load
	 * configuration for a file to validate use `ConfigLoader.fromTarget()`.
	 *
	 * @param filename - The file to read from or one of the presets such as
	 * `htmlvalidate:recommended`.
	 */
	public static fromFile(filename: string): Config {
		const configdata = loadFromFile(filename);
		return new Config(configdata);
	}

	/**
	 * Load a default configuration object.
	 */
	public static defaultConfig(): Config {
		return new Config(defaultConfig);
	}

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

		/* load plugins */
		this.plugins = this.loadPlugins(this.config.plugins || []);
		this.configurations = this.loadConfigurations(this.plugins);

		/* process extended configs */
		for (const extend of this.config.extends) {
			this.config = this.extendConfig(extend);
		}

		/* rules explicitly set by passed options should have precedence over any
		 * extended rules, not the other way around. */
		if (options && options.rules) {
			this.config = mergeInternal(this.config, { rules: options.rules });
		}
	}

	/**
	 * Initialize plugins, transforms etc.
	 *
	 * Must be called before trying to use config.
	 */
	public init(): void {
		/* precompile transform patterns */
		this.transformers = this.precompileTransformers(
			this.config.transform || {}
		);
	}

	/**
	 * Returns true if this configuration is marked as "root".
	 */
	public isRootFound(): boolean {
		return this.config.root;
	}

	/**
	 * Returns a new configuration as a merge of the two. Entries from the passed
	 * object takes priority over this object.
	 *
	 * @param {Config} rhs - Configuration to merge with this one.
	 */
	public merge(rhs: Config): Config {
		return new Config(mergeInternal(this.config, rhs.config));
	}

	private extendConfig(entry: string): ConfigData {
		let base: ConfigData;
		if (this.configurations.has(entry)) {
			base = this.configurations.get(entry);
		} else {
			base = Config.fromFile(entry).config;
		}
		return mergeInternal(this.config, base);
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
		const root = path.resolve(__dirname, "..", "..");

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

			let filename: string;

			/* try searching builtin metadata */
			filename = `${root}/elements/${entry}.json`;
			if (fs.existsSync(filename)) {
				metaTable.loadFromFile(filename);
				continue;
			}

			/* try as regular file */
			filename = entry.replace("<rootDir>", this.rootDir);
			if (fs.existsSync(filename)) {
				metaTable.loadFromFile(filename);
				continue;
			}

			/* assume it is loadable with require() */
			// eslint-disable-next-line security/detect-non-literal-require
			metaTable.loadFromObject(require(entry));
		}

		metaTable.init();
		return (this.metaTable = metaTable);
	}

	/**
	 * @hidden exposed for testing only
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
	 * @hidden primary purpose is unittests
	 */
	public get(): ConfigData {
		const config = Object.assign({}, this.config);
		if (config.elements) {
			config.elements = config.elements.map((cur: string | object) => {
				if (typeof cur === "string") {
					return cur.replace(this.rootDir, "<rootDir>");
				} else {
					return cur;
				}
			});
		}
		return config;
	}

	/**
	 * Get all configured rules, their severity and options.
	 */
	public getRules(): Map<string, [Severity, any]> {
		const rules = new Map<string, [Severity, any]>();
		for (const [ruleId, data] of Object.entries(this.config.rules)) {
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
	 */
	public getPlugins(): Plugin[] {
		return this.plugins;
	}

	private loadPlugins(plugins: string[]): Plugin[] {
		return plugins.map((moduleName: string) => {
			// eslint-disable-next-line security/detect-non-literal-require
			const plugin = require(moduleName.replace(
				"<rootDir>",
				this.rootDir
			)) as Plugin;
			plugin.name = moduleName;
			return plugin;
		});
	}

	private loadConfigurations(plugins: Plugin[]): Map<string, ConfigData> {
		const configs: Map<string, ConfigData> = new Map();

		/* builtin presets */
		configs.set("htmlvalidate:recommended", recommended);
		configs.set("htmlvalidate:document", document);

		/* presets from plugins */
		for (const plugin of plugins) {
			for (const [name, config] of Object.entries(plugin.configs || {})) {
				configs.set(`${plugin.name}:${name}`, new Config(config).config);
			}
		}
		return configs;
	}

	/**
	 * Transform a source.
	 *
	 * When transforming zero or more new sources will be generated.
	 *
	 * @param source - Current source to transform.
	 * @param filename - If set it is the filename used to match
	 * transformer. Default is to use filename from source.
	 * @return A list of transformed sources ready for validation.
	 */
	public transformSource(source: Source, filename?: string): Source[] {
		const transformer = this.findTransformer(filename || source.filename);
		const context: TransformContext = {
			chain: (source: Source, filename: string) => {
				return this.transformSource(source, filename);
			},
		};
		if (transformer) {
			try {
				return Array.from(transformer.fn.call(context, source));
			} catch (err) {
				throw new NestedError(
					`When transforming "${source.filename}": ${err.message}`,
					err
				);
			}
		} else {
			return [source];
		}
	}

	/**
	 * Wrapper around [[transformSource]] which reads a file before passing it
	 * as-is to transformSource.
	 *
	 * @param source - Filename to transform (according to configured
	 * transformations)
	 * @return A list of transformed sources ready for validation.
	 */
	public transformFilename(filename: string): Source[] {
		const data = fs.readFileSync(filename, { encoding: "utf8" });
		const source: Source = {
			data,
			filename,
			line: 1,
			column: 1,
			originalData: data,
		};
		return this.transformSource(source);
	}

	private findTransformer(filename: string): TransformerEntry | null {
		return this.transformers.find((entry: TransformerEntry) =>
			entry.pattern.test(filename)
		);
	}

	private precompileTransformers(transform: TransformMap): TransformerEntry[] {
		return Object.entries(transform).map(([pattern, name]) => {
			try {
				const fn = this.getTransformFunction(name);
				const version = (fn as any).api || 0;

				/* check if transformer version is supported */
				if (version !== TRANSFORMER_API.VERSION) {
					throw new ConfigError(
						`Transformer uses API version ${version} but only version ${TRANSFORMER_API.VERSION} is supported`
					);
				}

				return {
					// eslint-disable-next-line security/detect-non-literal-regexp
					pattern: new RegExp(pattern),

					fn,
				};
			} catch (err) {
				if (err instanceof ConfigError) {
					throw new ConfigError(
						`Failed to load transformer "${name}": ${err.message}`,
						err
					);
				} else {
					throw new ConfigError(`Failed to load transformer "${name}"`, err);
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
	 */
	private getTransformFunction(name: string): Transformer {
		/* try to match a named transformer from plugin */
		const match = name.match(/(.*):(.*)/);
		if (match) {
			const [, pluginName, key] = match;
			const plugin = this.plugins.find(cur => cur.name === pluginName);
			if (typeof plugin.transformer === "function") {
				throw new ConfigError(
					`Transformer "${name}" refers to named transformer but plugin exposes only unnamed, use "${pluginName}" instead.`
				);
			}
			if (!plugin.transformer[key]) {
				throw new ConfigError(
					`Plugin "${pluginName}" does not expose a transformer named "${key}".`
				);
			}
			return plugin.transformer[key];
		}

		/* try to match an unnamed transformer from plugin */
		const plugin = this.plugins.find(cur => cur.name === name);
		if (plugin) {
			if (typeof plugin.transformer !== "function") {
				throw new ConfigError(
					`Transformer "${name}" refers to unnamed transformer but plugin exposes only named.`
				);
			}
			return plugin.transformer;
		}

		/* assume transformer refers to a regular module */
		// eslint-disable-next-line security/detect-non-literal-require
		return require(name.replace("<rootDir>", this.rootDir));
	}

	protected findRootDir(): string {
		if (rootDirCache !== null) {
			return rootDirCache;
		}

		/* try to locate package.json */
		let current = process.cwd();
		// eslint-disable-next-line no-constant-condition
		while (true) {
			const search = path.join(current, "package.json");
			if (fs.existsSync(search)) {
				return (rootDirCache = current);
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
		return (rootDirCache = process.cwd());
	}
}
