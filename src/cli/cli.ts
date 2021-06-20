import { readFileSync } from "fs";
import { ConfigData, UserError, HtmlValidate, Report } from "../main";
import { expandFiles, ExpandOptions } from "./expand-files";
import { getFormatter } from "./formatter";
import { IsIgnored } from "./is-ignored";
import { init, InitResult } from "./init";

const defaultConfig: ConfigData = {
	extends: ["html-validate:recommended"],
};

export interface CLIOptions {
	configFile?: string;
	rules?: string | string[];
}

export class CLI {
	private options: CLIOptions;
	private config: ConfigData;
	private ignored: IsIgnored;

	/**
	 * Create new CLI helper.
	 *
	 * Can be used to create tooling with similar properties to bundled CLI
	 * script.
	 */
	public constructor(options?: CLIOptions) {
		this.options = options || {};
		this.config = this.getConfig();
		this.ignored = new IsIgnored();
	}

	/**
	 * Returns list of files matching patterns and are not ignored.
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
	public clearCache(): void {
		this.ignored.clearCache();
	}

	/**
	 * Get HtmlValidate instance with configuration based on options passed to the
	 * constructor.
	 */
	public getValidator(): HtmlValidate {
		return new HtmlValidate(this.config);
	}

	private getConfig(): ConfigData {
		const { options } = this;
		const config: ConfigData = options.configFile
			? JSON.parse(readFileSync(options.configFile, "utf-8"))
			: defaultConfig;
		let rules = options.rules;
		if (rules) {
			if (Array.isArray(rules)) {
				rules = rules.join(",");
			}
			const raw = rules
				.split(",")
				.map((x: string) => x.replace(/ *(.*):/, '"$1":'))
				.join(",");
			try {
				const rules = JSON.parse(`{${raw}}`);
				config.extends = [];
				config.rules = rules;
			} catch (e) {
				// istanbul ignore next
				throw new UserError(`Error while parsing --rule option "{${raw}}": ${e.message}.\n`);
			}
		}
		return config;
	}
}
