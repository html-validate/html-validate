import path from "node:path";
import {
	type ConfigData,
	type ConfigLoader,
	type Report,
	FileSystemConfigLoader,
	UserError,
	HtmlValidate,
	cjsResolver,
} from "..";
import { type ExpandOptions, expandFiles } from "./expand-files";
import { getFormatter } from "./formatter";
import { IsIgnored } from "./is-ignored";
import { type InitResult, init } from "./init";
import { getRuleConfig } from "./get-rule-config";

function defaultConfig(preset: string): ConfigData {
	const presets = preset.split(",").map((it) => `html-validate:${it}`);
	return {
		extends: presets,
	};
}

/**
 * @public
 */
export interface CLIOptions {
	configFile?: string;
	/** Comma-separated list of presets to use */
	preset?: string;
	rules?: string | string[];
}

function getBaseConfig(preset?: string, filename?: string): ConfigData {
	if (filename) {
		const resolver = cjsResolver();
		const configData = resolver.resolveConfig(path.resolve(filename), { cache: false });
		if (!configData) {
			throw new UserError(`Failed to read configuration from "${filename}"`);
		}
		return configData;
	} else {
		return defaultConfig(preset ?? "recommended");
	}
}

/**
 * @public
 */
export class CLI {
	private options: CLIOptions;
	private config: ConfigData | null;
	private loader: ConfigLoader | null;
	private ignored: IsIgnored;

	/**
	 * Create new CLI helper.
	 *
	 * Can be used to create tooling with similar properties to bundled CLI
	 * script.
	 */
	public constructor(options?: CLIOptions) {
		this.options = options ?? {};
		this.config = null;
		this.loader = null;
		this.ignored = new IsIgnored();
	}

	/**
	 * Returns list of files matching patterns and are not ignored. Filenames will
	 * have absolute paths.
	 *
	 * @public
	 */
	public async expandFiles(patterns: string[], options: ExpandOptions = {}): Promise<string[]> {
		/* technical debt: expandFiles(..) should actually be async as well */
		const files = expandFiles(patterns, options).filter((filename) => !this.isIgnored(filename));
		return Promise.resolve(files);
	}

	public getFormatter(formatters: string): Promise<(report: Report) => string> {
		/* while not actually async the API boundary returns a Promise in case it needs to in the future, i.e a ESM-based formatter */
		return Promise.resolve(getFormatter(formatters));
	}

	/**
	 * Initialize project with a new configuration.
	 *
	 * A new `.htmlvalidate.json` file will be placed in the path provided by
	 * `cwd`.
	 */
	public init(cwd: string): Promise<InitResult> {
		return init(cwd);
	}

	/**
	 * Searches ".htmlvalidateignore" files from filesystem and returns `true` if
	 * one of them contains a pattern matching given filename.
	 */
	public isIgnored(filename: string): boolean {
		return this.ignored.isIgnored(filename);
	}

	/**
	 * Clear cache.
	 *
	 * Previously fetched [[HtmlValidate]] instances must either be fetched again
	 * or call [[HtmlValidate.flushConfigCache]].
	 */
	/* istanbul ignore next: each method is tested separately */
	public clearCache(): Promise<void> {
		if (this.loader) {
			this.loader.flushCache();
		}
		this.ignored.clearCache();
		return Promise.resolve();
	}

	/**
	 * Get HtmlValidate instance with configuration based on options passed to the
	 * constructor.
	 *
	 * @internal
	 */
	public async getLoader(): Promise<ConfigLoader> {
		if (!this.loader) {
			const config = await this.getConfig();
			this.loader = new FileSystemConfigLoader(config);
		}
		return this.loader;
	}

	/**
	 * Get HtmlValidate instance with configuration based on options passed to the
	 * constructor.
	 *
	 * @public
	 */
	public async getValidator(): Promise<HtmlValidate> {
		const loader = await this.getLoader();
		return new HtmlValidate(loader);
	}

	/**
	 * @internal
	 */
	public getConfig(): Promise<ConfigData> {
		if (!this.config) {
			this.config = this.resolveConfig();
		}
		return Promise.resolve(this.config);
	}

	private resolveConfig(): ConfigData {
		const { options } = this;
		const config = getBaseConfig(options.preset, options.configFile);
		if (options.rules) {
			if (!options.preset) {
				config.extends = [];
			}
			config.rules = getRuleConfig(options.rules);
		}
		return config;
	}
}
