import path from "node:path";
import {
	type ConfigData,
	type ConfigLoader,
	type Report,
	FileSystemConfigLoader,
	UserError,
	HtmlValidate,
	nodejsResolver,
} from "..";
import { type RuleConfig } from "../config";
import { type ExpandOptions, expandFiles } from "./expand-files";
import { getFormatter } from "./formatter";
import { IsIgnored } from "./is-ignored";
import { type InitResult, init } from "./init";

const defaultConfig: ConfigData = {
	extends: ["html-validate:recommended"],
};

/**
 * @public
 */
export interface CLIOptions {
	configFile?: string;
	rules?: string | string[];
}

function getBaseConfig(filename?: string): ConfigData {
	if (filename) {
		const resolver = nodejsResolver();
		const configData = resolver.resolveConfig(path.resolve(filename), { cache: false });
		if (!configData) {
			throw new UserError(`Failed to read configuration from "${filename}"`);
		}
		return configData;
	} else {
		return defaultConfig;
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
	public expandFiles(patterns: string[], options: ExpandOptions = {}): string[] {
		return expandFiles(patterns, options).filter((filename) => !this.isIgnored(filename));
	}

	public getFormatter(formatters: string): (report: Report) => string {
		return getFormatter(formatters);
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
	public clearCache(): void {
		if (this.loader) {
			this.loader.flushCache();
		}
		this.ignored.clearCache();
	}

	/**
	 * Get HtmlValidate instance with configuration based on options passed to the
	 * constructor.
	 *
	 * @internal
	 */
	public getLoader(): ConfigLoader {
		if (!this.loader) {
			this.loader = new FileSystemConfigLoader(this.getConfig());
		}
		return this.loader;
	}

	/**
	 * Get HtmlValidate instance with configuration based on options passed to the
	 * constructor.
	 *
	 * @public
	 */
	public getValidator(): HtmlValidate {
		const loader = this.getLoader();
		return new HtmlValidate(loader);
	}

	/**
	 * @internal
	 */
	public getConfig(): ConfigData {
		if (!this.config) {
			this.config = this.resolveConfig();
		}
		return this.config;
	}

	private resolveConfig(): ConfigData {
		const { options } = this;
		const config = getBaseConfig(options.configFile);
		if (options.rules) {
			const rules: string[] = Array.isArray(options.rules) ? options.rules : [options.rules];
			try {
				const severityMap: Record<string, number> = { off: 0, warn: 1, error: 2 };
				const ruleConfig = rules.reduce((parsedRules: Record<string, number>, rule) => {
					const [ruleName, ruleSeverity] = rule.trim().split(":");
					const severityValue = severityMap[ruleSeverity] ?? parseInt(ruleSeverity, 10);
					if (!Object.values(severityMap).includes(severityValue)) {
						throw new Error(`Invalid severity value for rule "${ruleName}": ${ruleSeverity}`);
					}
					parsedRules[ruleName] = severityValue;
					return parsedRules;
				}, {});
				config.extends = [];
				config.rules = ruleConfig as RuleConfig;
			} catch (err: any) /* istanbul ignore next */ {
				const message = err instanceof Error ? err.message : String(err);
				throw new UserError(
					`Error while parsing --rule option "{${rules.join(",")}": ${message}.\n`,
				);
			}
		}
		return config;
	}
}
