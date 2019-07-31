import deepmerge from "deepmerge";
import fs from "fs";
import path from "path";
import { Source } from "../context";
import { NestedError } from "../error/nested-error";
import { UserError } from "../error/user-error";
import { MetaTable } from "../meta";
import { MetaDataTable } from "../meta/element";
import { Plugin } from "../plugin";
import { ConfigData, TransformMap } from "./config-data";
import defaultConfig from "./default";
import { parseSeverity, Severity } from "./severity";

interface Transformer {
	pattern: RegExp;
	fn: (filename: string) => Source[];
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

	return dst;
}

function loadFromFile(filename: string): ConfigData {
	let json;
	try {
		json = require(filename);
	} catch (err) {
		throw new UserError(`Failed to read configuration from "${filename}"`, err);
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
	protected transformers: Transformer[];
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

	constructor(options?: ConfigData) {
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
	public init() {
		/* precompile transform patterns */
		this.transformers = this.precompileTransformers(
			this.config.transform || {}
		);
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

			/* try searching builtin metadata */
			const filename = `${root}/elements/${entry}.json`;
			if (fs.existsSync(filename)) {
				metaTable.loadFromFile(filename);
				continue;
			}

			/* try as regular file */
			if (fs.existsSync(entry)) {
				metaTable.loadFromFile(entry);
				continue;
			}

			/* assume it is loadable with require() */
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
			config.elements = config.elements.map((cur: string) =>
				cur.replace(this.rootDir, "<rootDir>")
			);
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
	 * Transform a source file.
	 *
	 * @param filename - Filename to transform (according to configured
	 * transformations)
	 * @return A list of extracted sources ready for validation.
	 */
	public transform(filename: string): Source[] {
		const transformer = this.findTransformer(filename);
		if (transformer) {
			try {
				return transformer.fn(filename);
			} catch (err) {
				throw new NestedError(
					`When transforming "${filename}": ${err.message}`,
					err
				);
			}
		} else {
			const data = fs.readFileSync(filename, { encoding: "utf8" });
			return [
				{
					data,
					filename,
					line: 1,
					column: 1,
					originalData: data,
				},
			];
		}
	}

	private findTransformer(filename: string): Transformer | null {
		return this.transformers.find((entry: Transformer) =>
			entry.pattern.test(filename)
		);
	}

	private precompileTransformers(transform: TransformMap): Transformer[] {
		return Object.entries(transform).map(([pattern, module]) => {
			return {
				pattern: new RegExp(pattern),
				fn: require(module.replace("<rootDir>", this.rootDir)),
			};
		});
	}

	protected findRootDir() {
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
