import { Config, ConfigLoader } from "./config";
import { Source } from "./context";
import { SourceHooks } from "./context/source";
import { Engine, EventDump, TokenDump } from "./engine";
import { Parser } from "./parser";
import { Report } from "./reporter";
import { RuleDocumentation } from "./rule";

class HtmlValidate {
	private globalConfig: Config;
	protected configLoader: ConfigLoader;

	constructor(options?: any) {
		const defaults = Config.empty();
		this.globalConfig = defaults.merge(
			options ? Config.fromObject(options) : Config.defaultConfig()
		);
		this.configLoader = new ConfigLoader(Config);
	}

	/**
	 * Parse HTML from string.
	 *
	 * @param str {string} - Text to parse.
	 * @param [hooks] {object} - Optional hooks (see Source) for definition.
	 * @return {object} - Report output.
	 */
	public validateString(str: string, hooks?: SourceHooks): Report {
		const source = {
			column: 1,
			data: str,
			filename: "inline",
			line: 1,
			hooks,
		};
		return this.validateSource(source);
	}

	/**
	 * Parse HTML from source.
	 *
	 * @param str {string} - Text to parse.
	 * @return {object} - Report output.
	 */
	public validateSource(source: Source): Report {
		const config = this.getConfigFor("inline");
		const engine = new Engine(config, Parser);
		return engine.lint([source]);
	}

	/**
	 * Parse HTML from file.
	 *
	 * @param filename {string} - Filename to read and parse.
	 * @return {object} - Report output.
	 */
	public validateFile(filename: string): Report {
		const config = this.getConfigFor(filename);
		const source = config.transform(filename);
		const engine = new Engine(config, Parser);
		return engine.lint(source);
	}

	public dumpTokens(filename: string): TokenDump[] {
		const config = this.getConfigFor(filename);
		const source = config.transform(filename);
		const engine = new Engine(config, Parser);
		return engine.dumpTokens(source);
	}

	public dumpEvents(filename: string): EventDump[] {
		const config = this.getConfigFor(filename);
		const source = config.transform(filename);
		const engine = new Engine(config, Parser);
		return engine.dumpEvents(source);
	}

	public dumpTree(filename: string): string[] {
		const config = this.getConfigFor(filename);
		const source = config.transform(filename);
		const engine = new Engine(config, Parser);
		return engine.dumpTree(source);
	}

	/**
	 * Get contextual documentation for the given rule.
	 *
	 * Typical usage:
	 *
	 * ```js
	 * const report = htmlvalidate.validateFile("my-file.html");
	 * for (const result of report.results){
	 *   const config = htmlvalidate.getConfigFor(result.filePath);
	 *   for (const message of result.messages){
	 *     const documentation = htmlvalidate.getRuleDocumentation(message.ruleId, config, message.context);
	 *     // do something with documentation
	 *   }
	 * }
	 * ```
	 *
	 * @param {string} ruleId - Rule to get documentation for.
	 * @param {Config} [config] - If set it provides more accurate description by
	 * using the correct configuration for the file.
	 * @param {any} [context] - If set to `Message.context` some rules can provide
	 * contextual details and suggestions.
	 */
	public getRuleDocumentation(
		ruleId: string,
		config?: Config,
		context?: any
	): RuleDocumentation {
		const engine = new Engine(config || this.getConfigFor("inline"), Parser);
		return engine.getRuleDocumentation(ruleId, context);
	}

	/**
	 * Get parser for given filename.
	 */
	public getParserFor(source: Source): Parser {
		const config = this.getConfigFor(source.filename);
		return new Parser(config);
	}

	/**
	 * Get configuration for given filename.
	 */
	public getConfigFor(filename: string): Config {
		const config = this.configLoader.fromTarget(filename);
		const merged = this.globalConfig.merge(config);
		merged.init();
		return merged;
	}

	/**
	 * Flush configuration cache. Clears full cache unless a filename is given.
	 *
	 * @param {string} [filename] - If set, only flush cache for given filename.
	 */
	public flushConfigCache(filename?: string): void {
		this.configLoader.flush(filename);
	}
}

export default HtmlValidate;
