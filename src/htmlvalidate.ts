import path from "path";
import { type SchemaObject } from "ajv";
import { type ConfigData, type ResolvedConfig, Config, ConfigLoader } from "./config";
import { type Source } from "./context";
import { type SourceHooks } from "./context/source";
import { type EventDump, type TokenDump, Engine } from "./engine";
import { Parser } from "./parser";
import { type Report, Reporter } from "./reporter";
import { type RuleDocumentation } from "./rule";
import configurationSchema from "./schema/config.json";
import { StaticConfigLoader } from "./config/loaders/static";

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
 *
 * @public
 */
export class HtmlValidate {
	protected configLoader: ConfigLoader;

	/**
	 * Create a new validator.
	 *
	 * @public
	 * @param configLoader - Use a custom configuration loader.
	 * @param config - If set it provides the global default configuration. By
	 * default `Config.defaultConfig()` is used.
	 */
	public constructor(config?: ConfigData);
	public constructor(configLoader: ConfigLoader);
	public constructor(arg?: ConfigLoader | ConfigData) {
		const [loader, config] = arg instanceof ConfigLoader ? [arg, undefined] : [undefined, arg];
		this.configLoader = loader ?? new StaticConfigLoader(config);
	}

	/**
	 * Parse and validate HTML from string.
	 *
	 * @public
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
	 * @public
	 * @param input - Source to parse.
	 * @returns Report output.
	 */
	public validateSource(input: Source, configOverride?: ConfigData): Report {
		const config = this.getConfigFor(input.filename, configOverride);
		const source = config.transformSource(input);
		const engine = new Engine(config, Parser);
		return engine.lint(source);
	}

	/**
	 * Parse and validate HTML from file.
	 *
	 * @public
	 * @param filename - Filename to read and parse.
	 * @returns Report output.
	 */
	public validateFile(filename: string): Report {
		const config = this.getConfigFor(filename);
		const source = config.transformFilename(filename);
		const engine = new Engine(config, Parser);
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
		const engine = new Engine(config, Parser);
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
		const engine = new Engine(config, Parser);
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
		const engine = new Engine(config, Parser);
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

	/**
	 * Get effective configuration schema.
	 */
	public getConfigurationSchema(): SchemaObject {
		return configurationSchema;
	}

	/**
	 * Get effective metadata element schema.
	 *
	 * If a filename is given the configured plugins can extend the
	 * schema. Filename must not be an existing file or a filetype normally
	 * handled by html-validate but the path will be used when resolving
	 * configuration. As a rule-of-thumb, set it to the elements json file.
	 */
	public getElementsSchema(filename?: string): SchemaObject {
		const config = this.getConfigFor(filename ?? "inline");
		const metaTable = config.getMetaTable();
		return metaTable.getJSONSchema();
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
		config: ResolvedConfig | null = null,
		context: any | null = null
	): RuleDocumentation | null {
		const c = config || this.getConfigFor("inline");
		const engine = new Engine(c, Parser);
		return engine.getRuleDocumentation(ruleId, context);
	}

	/**
	 * Create a parser configured for given filename.
	 *
	 * @internal
	 * @param source - Source to use.
	 */
	public getParserFor(source: Source): Parser {
		const config = this.getConfigFor(source.filename);
		return new Parser(config);
	}

	/**
	 * Get configuration for given filename.
	 *
	 * See [[FileSystemConfigLoader]] for details.
	 *
	 * @public
	 * @param filename - Filename to get configuration for.
	 * @param configOverride - Configuration to apply last.
	 */
	public getConfigFor(filename: string, configOverride?: ConfigData): ResolvedConfig {
		const config = this.configLoader.getConfigFor(filename, configOverride);

		/* for backwards compatibility only */
		if (config instanceof Config) {
			return config.resolve();
		}

		return config;
	}

	/**
	 * Flush configuration cache. Clears full cache unless a filename is given.
	 *
	 * See [[FileSystemConfigLoader]] for details.
	 *
	 * @public
	 * @param filename - If set, only flush cache for given filename.
	 */
	public flushConfigCache(filename?: string): void {
		this.configLoader.flushCache(filename);
	}
}
