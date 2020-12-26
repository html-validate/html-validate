import path from "path";
import { SchemaObject } from "ajv";
import { Config, ConfigData, ConfigLoader } from "./config";
import { Source } from "./context";
import { SourceHooks } from "./context/source";
import { Engine, EventDump, TokenDump } from "./engine";
import { Parser } from "./parser";
import { Report, Reporter } from "./reporter";
import { RuleDocumentation } from "./rule";
import configurationSchema from "./schema/config.json";

function isSourceHooks(value: any): value is SourceHooks {
	if (!value || typeof value === "string") {
		return false;
	}
	return Boolean(value.processAttribute || value.processElement);
}

function isConfigData(value: any): value is ConfigData {
	if (!value || typeof value === "string") {
		return false;
	}
	return !(value.processAttribute || value.processElement);
}

/**
 * Primary API for using HTML-validate.
 *
 * Provides high-level abstractions for common operations.
 */
class HtmlValidate {
	private globalConfig: Config;
	protected configLoader: ConfigLoader;

	/**
	 * Create a new validator.
	 *
	 * @param config - If set it provides the global default configuration. By
	 * default `Config.defaultConfig()` is used.
	 */
	public constructor(config?: ConfigData) {
		const defaults = Config.empty();
		this.globalConfig = defaults.merge(config ? Config.fromObject(config) : Config.defaultConfig());
		this.configLoader = new ConfigLoader(Config);
	}

	/**
	 * Parse and validate HTML from string.
	 *
	 * @param str - Text to parse.
	 * @param filename - If set configuration is loaded for given filename.
	 * @param hooks - Optional hooks (see [[Source]]) for definition.
	 * @returns Report output.
	 */
	public validateString(str: string): Report;
	public validateString(str: string, filename: string): Report;
	public validateString(str: string, hooks: SourceHooks): Report;
	public validateString(str: string, options: ConfigData): Report;
	public validateString(str: string, filename: string, hooks: SourceHooks): Report;
	public validateString(str: string, filename: string, options: ConfigData): Report;
	public validateString(
		str: string,
		filename: string,
		options: ConfigData,
		hooks: SourceHooks
	): Report;
	public validateString(
		str: string,
		arg1?: string | SourceHooks | ConfigData,
		arg2?: SourceHooks | ConfigData,
		arg3?: SourceHooks
	): Report {
		const filename = typeof arg1 === "string" ? arg1 : "inline";
		const options = isConfigData(arg1) ? arg1 : isConfigData(arg2) ? arg2 : undefined;
		const hooks = isSourceHooks(arg1) ? arg1 : isSourceHooks(arg2) ? arg2 : arg3;
		const source = {
			data: str,
			filename,
			line: 1,
			column: 1,
			offset: 0,
			hooks,
		};
		return this.validateSource(source, options);
	}

	/**
	 * Parse and validate HTML from [[Source]].
	 *
	 * @param input - Source to parse.
	 * @returns Report output.
	 */
	public validateSource(input: Source, configOverride?: ConfigData): Report {
		const config = this.getConfigFor(input.filename, configOverride);
		const source = config.transformSource(input);
		const engine = new Engine(config.resolve(), config.get(), Parser);
		return engine.lint(source);
	}

	/**
	 * Parse and validate HTML from file.
	 *
	 * @param filename - Filename to read and parse.
	 * @returns Report output.
	 */
	public validateFile(filename: string): Report {
		const config = this.getConfigFor(filename);
		const source = config.transformFilename(filename);
		const engine = new Engine(config.resolve(), config.get(), Parser);
		return engine.lint(source);
	}

	/**
	 * Parse and validate HTML from multiple files. Result is merged together to a
	 * single report.
	 *
	 * @param filenames - Filenames to read and parse.
	 * @returns Report output.
	 */
	public validateMultipleFiles(filenames: string[]): Report {
		return Reporter.merge(filenames.map((filename) => this.validateFile(filename)));
	}

	/**
	 * Returns true if the given filename can be validated.
	 *
	 * A file is considered to be validatable if the extension is `.html` or if a
	 * transformer matches the filename.
	 *
	 * This is mostly useful for tooling to determine whenever to validate the
	 * file or not. CLI tools will run on all the given files anyway.
	 */
	public canValidate(filename: string): boolean {
		/* .html is always supported */
		const extension = path.extname(filename).toLowerCase();
		if (extension === ".html") {
			return true;
		}

		/* test if there is a matching transformer */
		const config = this.getConfigFor(filename);
		return config.canTransform(filename);
	}

	/**
	 * Tokenize filename and output all tokens.
	 *
	 * Using CLI this is enabled with `--dump-tokens`. Mostly useful for
	 * debugging.
	 *
	 * @param filename - Filename to tokenize.
	 */
	public dumpTokens(filename: string): TokenDump[] {
		const config = this.getConfigFor(filename);
		const source = config.transformFilename(filename);
		const engine = new Engine(config.resolve(), config.get(), Parser);
		return engine.dumpTokens(source);
	}

	/**
	 * Parse filename and output all events.
	 *
	 * Using CLI this is enabled with `--dump-events`. Mostly useful for
	 * debugging.
	 *
	 * @param filename - Filename to dump events from.
	 */
	public dumpEvents(filename: string): EventDump[] {
		const config = this.getConfigFor(filename);
		const source = config.transformFilename(filename);
		const engine = new Engine(config.resolve(), config.get(), Parser);
		return engine.dumpEvents(source);
	}

	/**
	 * Parse filename and output DOM tree.
	 *
	 * Using CLI this is enabled with `--dump-tree`. Mostly useful for
	 * debugging.
	 *
	 * @param filename - Filename to dump DOM tree from.
	 */
	public dumpTree(filename: string): string[] {
		const config = this.getConfigFor(filename);
		const source = config.transformFilename(filename);
		const engine = new Engine(config.resolve(), config.get(), Parser);
		return engine.dumpTree(source);
	}

	/**
	 * Transform filename and output source data.
	 *
	 * Using CLI this is enabled with `--dump-source`. Mostly useful for
	 * debugging.
	 *
	 * @param filename - Filename to dump source from.
	 */
	public dumpSource(filename: string): string[] {
		const config = this.getConfigFor(filename);
		const sources = config.transformFilename(filename);
		return sources.reduce((result: string[], source: Source) => {
			result.push(
				`Source ${source.filename}@${source.line}:${source.column} (offset: ${source.offset})`
			);
			if (source.transformedBy) {
				result.push("Transformed by:");
				result = result.concat(source.transformedBy.reverse().map((name) => ` - ${name}`));
			}
			if (source.hooks && Object.keys(source.hooks).length > 0) {
				result.push("Hooks");
				for (const [key, present] of Object.entries(source.hooks)) {
					if (present) {
						result.push(` - ${key}`);
					}
				}
			}
			result.push("---");
			result = result.concat(source.data.split("\n"));
			result.push("---");
			return result;
		}, [] as string[]);
	}

	public getConfigurationSchema(): SchemaObject {
		return configurationSchema;
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
	 * @param ruleId - Rule to get documentation for.
	 * @param config - If set it provides more accurate description by using the
	 * correct configuration for the file.
	 * @param context - If set to `Message.context` some rules can provide
	 * contextual details and suggestions.
	 */
	public getRuleDocumentation(
		ruleId: string,
		config: Config | null = null,
		context: any | null = null
	): RuleDocumentation {
		const c = config || this.getConfigFor("inline");
		const engine = new Engine(c.resolve(), c.get(), Parser);
		return engine.getRuleDocumentation(ruleId, context);
	}

	/**
	 * Create a parser configured for given filename.
	 *
	 * @param source - Source to use.
	 */
	public getParserFor(source: Source): Parser {
		const config = this.getConfigFor(source.filename);
		return new Parser(config.resolve());
	}

	/**
	 * Get configuration for given filename.
	 *
	 * Configuration is read from three sources and in the following order:
	 *
	 * 1. Global configuration passed to constructor.
	 * 2. `.htmlvalidate.json` files found when traversing the directory structure.
	 * 3. Override passed to this function.
	 *
	 * Global configuration is used when no `.htmlvalidate.json` is found. The
	 * result is always merged with override if present.
	 *
	 * The `root` property set to `true` affects the configuration as following:
	 *
	 * 1. If set in override the override is returned as-is.
	 * 2. If set in the global config the override is merged into global and
	 * returned. No `.htmlvalidate.json` files are searched.
	 * 3. Setting `root` in `.htmlvalidate.json` only stops directory traversal.
	 *
	 * @param filename - Filename to get configuration for.
	 * @param configOverride - Configuration to apply last.
	 */
	public getConfigFor(filename: string, configOverride?: ConfigData): Config {
		/* special case when the overridden configuration is marked as root, should
		 * not try to load any more configuration files */
		const override = Config.fromObject(configOverride || {});
		if (override.isRootFound()) {
			override.init();
			return override;
		}

		/* special case when the global configuration is marked as root, should not
		 * try to load and more configuration files */
		if (this.globalConfig.isRootFound()) {
			const merged = this.globalConfig.merge(override);
			merged.init();
			return merged;
		}

		const config = this.configLoader.fromTarget(filename);
		const merged = config ? config.merge(override) : this.globalConfig.merge(override);
		merged.init();
		return merged;
	}

	/**
	 * Flush configuration cache. Clears full cache unless a filename is given.
	 *
	 * @param filename - If set, only flush cache for given filename.
	 */
	public flushConfigCache(filename?: string): void {
		this.configLoader.flush(filename);
	}
}

export default HtmlValidate;
