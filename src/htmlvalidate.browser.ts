import { type SchemaObject } from "ajv";
import { type ConfigData, type ResolvedConfig, ConfigLoader } from "./config";
import { normalizeSource, type Source } from "./context";
import { type SourceHooks } from "./context/source";
import { type EventDump, type TokenDump, Engine } from "./engine";
import { type Message } from "./message";
import { Parser } from "./parser";
import { type Report, Reporter } from "./reporter";
import { type RuleDocumentation } from "./rule";
import configurationSchema from "./schema/config.json";
import { StaticConfigLoader } from "./config/loaders/static";
import { isThenable } from "./utils";
import { UserError } from "./error";
import {
	type TransformFS,
	transformFilename,
	transformFilenameSync,
	transformSource,
	transformSourceSync,
} from "./transform";

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
	/* eslint-disable @typescript-eslint/unified-signatures -- for easier readability */
	public validateString(str: string): Promise<Report>;
	public validateString(str: string, filename: string): Promise<Report>;
	public validateString(str: string, hooks: SourceHooks): Promise<Report>;
	public validateString(str: string, options: ConfigData): Promise<Report>;
	public validateString(str: string, filename: string, hooks: SourceHooks): Promise<Report>;
	public validateString(str: string, filename: string, options: ConfigData): Promise<Report>;
	public validateString(
		str: string,
		filename: string,
		options: ConfigData,
		hooks: SourceHooks,
	): Promise<Report>;
	/* eslint-enable @typescript-eslint/unified-signatures */
	public validateString(
		str: string,
		arg1?: string | SourceHooks | ConfigData,
		arg2?: SourceHooks | ConfigData,
		arg3?: SourceHooks,
	): Promise<Report> {
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
	 * Parse and validate HTML from string.
	 *
	 * @public
	 * @param str - Text to parse.
	 * @param filename - If set configuration is loaded for given filename.
	 * @param hooks - Optional hooks (see [[Source]]) for definition.
	 * @returns Report output.
	 */
	/* eslint-disable @typescript-eslint/unified-signatures -- for easier readability */
	public validateStringSync(str: string): Report;
	public validateStringSync(str: string, filename: string): Report;
	public validateStringSync(str: string, hooks: SourceHooks): Report;
	public validateStringSync(str: string, options: ConfigData): Report;
	public validateStringSync(str: string, filename: string, hooks: SourceHooks): Report;
	public validateStringSync(str: string, filename: string, options: ConfigData): Report;
	public validateStringSync(
		str: string,
		filename: string,
		options: ConfigData,
		hooks: SourceHooks,
	): Report;
	/* eslint-enable @typescript-eslint/unified-signatures */
	public validateStringSync(
		str: string,
		arg1?: string | SourceHooks | ConfigData,
		arg2?: SourceHooks | ConfigData,
		arg3?: SourceHooks,
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
		return this.validateSourceSync(source, options);
	}

	/**
	 * Parse and validate HTML from [[Source]].
	 *
	 * @public
	 * @param input - Source to parse.
	 * @returns Report output.
	 */
	public async validateSource(input: Source, configOverride?: ConfigData): Promise<Report> {
		const source = normalizeSource(input);
		const config = await this.getConfigFor(source.filename, configOverride);
		const resolvers = this.configLoader.getResolvers();
		const transformedSource = await transformSource(resolvers, config, source);
		const engine = new Engine(config, Parser);
		return engine.lint(transformedSource);
	}

	/**
	 * Parse and validate HTML from [[Source]].
	 *
	 * @public
	 * @param input - Source to parse.
	 * @returns Report output.
	 */
	public validateSourceSync(input: Source, configOverride?: ConfigData): Report {
		const source = normalizeSource(input);
		const config = this.getConfigForSync(source.filename, configOverride);
		const resolvers = this.configLoader.getResolvers();
		const transformedSource = transformSourceSync(resolvers, config, source);
		const engine = new Engine(config, Parser);
		return engine.lint(transformedSource);
	}

	/**
	 * Parse and validate HTML from file.
	 *
	 * @public
	 * @param filename - Filename to read and parse.
	 * @returns Report output.
	 */
	public async validateFile(filename: string, fs: TransformFS): Promise<Report> {
		const config = await this.getConfigFor(filename);
		const resolvers = this.configLoader.getResolvers();
		const source = await transformFilename(resolvers, config, filename, fs);
		const engine = new Engine(config, Parser);
		return Promise.resolve(engine.lint(source));
	}

	/**
	 * Parse and validate HTML from file.
	 *
	 * @public
	 * @param filename - Filename to read and parse.
	 * @returns Report output.
	 */
	public validateFileSync(filename: string, fs: TransformFS): Report {
		const config = this.getConfigForSync(filename);
		const resolvers = this.configLoader.getResolvers();
		const source = transformFilenameSync(resolvers, config, filename, fs);
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
	public async validateMultipleFiles(filenames: string[], fs: TransformFS): Promise<Report> {
		return Reporter.merge(filenames.map((filename) => this.validateFile(filename, fs)));
	}

	/**
	 * Parse and validate HTML from multiple files. Result is merged together to a
	 * single report.
	 *
	 * @param filenames - Filenames to read and parse.
	 * @returns Report output.
	 */
	public validateMultipleFilesSync(filenames: string[], fs: TransformFS): Report {
		return Reporter.merge(filenames.map((filename) => this.validateFileSync(filename, fs)));
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
	public async canValidate(filename: string): Promise<boolean> {
		/* .html is always supported */
		if (filename.toLowerCase().endsWith(".html")) {
			return true;
		}

		/* test if there is a matching transformer */
		const config = await this.getConfigFor(filename);
		return config.canTransform(filename);
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
	public canValidateSync(filename: string): boolean {
		/* .html is always supported */
		if (filename.toLowerCase().endsWith(".html")) {
			return true;
		}

		/* test if there is a matching transformer */
		const config = this.getConfigForSync(filename);
		return config.canTransform(filename);
	}

	/**
	 * Tokenize filename and output all tokens.
	 *
	 * Using CLI this is enabled with `--dump-tokens`. Mostly useful for
	 * debugging.
	 *
	 * @internal
	 * @param filename - Filename to tokenize.
	 */
	public async dumpTokens(filename: string, fs: TransformFS): Promise<TokenDump[]> {
		const config = await this.getConfigFor(filename);
		const resolvers = this.configLoader.getResolvers();
		const source = await transformFilename(resolvers, config, filename, fs);
		const engine = new Engine(config, Parser);
		return engine.dumpTokens(source);
	}

	/**
	 * Parse filename and output all events.
	 *
	 * Using CLI this is enabled with `--dump-events`. Mostly useful for
	 * debugging.
	 *
	 * @internal
	 * @param filename - Filename to dump events from.
	 */
	public async dumpEvents(filename: string, fs: TransformFS): Promise<EventDump[]> {
		const config = await this.getConfigFor(filename);
		const resolvers = this.configLoader.getResolvers();
		const source = await transformFilename(resolvers, config, filename, fs);
		const engine = new Engine(config, Parser);
		return engine.dumpEvents(source);
	}

	/**
	 * Parse filename and output DOM tree.
	 *
	 * Using CLI this is enabled with `--dump-tree`. Mostly useful for
	 * debugging.
	 *
	 * @internal
	 * @param filename - Filename to dump DOM tree from.
	 */
	public async dumpTree(filename: string, fs: TransformFS): Promise<string[]> {
		const config = await this.getConfigFor(filename);
		const resolvers = this.configLoader.getResolvers();
		const source = await transformFilename(resolvers, config, filename, fs);
		const engine = new Engine(config, Parser);
		return engine.dumpTree(source);
	}

	/**
	 * Transform filename and output source data.
	 *
	 * Using CLI this is enabled with `--dump-source`. Mostly useful for
	 * debugging.
	 *
	 * @internal
	 * @param filename - Filename to dump source from.
	 */
	public async dumpSource(filename: string, fs: TransformFS): Promise<string[]> {
		const config = await this.getConfigFor(filename);
		const resolvers = this.configLoader.getResolvers();
		const sources = await transformFilename(resolvers, config, filename, fs);
		return sources.reduce<string[]>((result: string[], source: Source) => {
			const line = String(source.line);
			const column = String(source.column);
			const offset = String(source.offset);
			result.push(`Source ${source.filename}@${line}:${column} (offset: ${offset})`);
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
		}, []);
	}

	/**
	 * Get effective configuration schema.
	 */
	public getConfigurationSchema(): Promise<SchemaObject> {
		return Promise.resolve(configurationSchema);
	}

	/**
	 * Get effective metadata element schema.
	 *
	 * If a filename is given the configured plugins can extend the
	 * schema. Filename must not be an existing file or a filetype normally
	 * handled by html-validate but the path will be used when resolving
	 * configuration. As a rule-of-thumb, set it to the elements json file.
	 */
	public async getElementsSchema(filename?: string): Promise<SchemaObject> {
		const config = await this.getConfigFor(filename ?? "inline");
		const metaTable = config.getMetaTable();
		return metaTable.getJSONSchema();
	}

	/**
	 * Get effective metadata element schema.
	 *
	 * If a filename is given the configured plugins can extend the
	 * schema. Filename must not be an existing file or a filetype normally
	 * handled by html-validate but the path will be used when resolving
	 * configuration. As a rule-of-thumb, set it to the elements json file.
	 */
	public getElementsSchemaSync(filename?: string): SchemaObject {
		const config = this.getConfigForSync(filename ?? "inline");
		const metaTable = config.getMetaTable();
		return metaTable.getJSONSchema();
	}

	/**
	 * Get contextual documentation for the given rule. Configuration will be
	 * resolved for given filename.
	 *
	 * @example
	 *
	 * ```js
	 * const report = await htmlvalidate.validateFile("my-file.html");
	 * for (const result of report.results){
	 *   for (const message of result.messages){
	 *     const documentation = await htmlvalidate.getContextualDocumentation(message, result.filePath);
	 *     // do something with documentation
	 *   }
	 * }
	 * ```
	 *
	 * @public
	 * @since 8.0.0
	 * @param message - Message reported during validation
	 * @param filename - Filename used to resolve configuration.
	 * @returns Contextual documentation or `null` if the rule does not exist.
	 */
	public getContextualDocumentation(
		message: Pick<Message, "ruleId" | "context">,
		filename?: string,
	): Promise<RuleDocumentation | null>;

	/**
	 * Get contextual documentation for the given rule using provided
	 * configuration.
	 *
	 * @example
	 *
	 * ```js
	 * const report = await htmlvalidate.validateFile("my-file.html");
	 * for (const result of report.results){
	 *   for (const message of result.messages){
	 *     const documentation = await htmlvalidate.getRuleDocumentation(message, result.filePath);
	 *     // do something with documentation
	 *   }
	 * }
	 * ```
	 *
	 * @public
	 * @since 8.0.0
	 * @param message - Message reported during validation
	 * @param config - Configuration to use.
	 * @returns Contextual documentation or `null` if the rule does not exist.
	 */
	public getContextualDocumentation(
		message: Pick<Message, "ruleId" | "context">,
		config: ResolvedConfig | Promise<ResolvedConfig>,
	): Promise<RuleDocumentation | null>;

	public async getContextualDocumentation(
		message: Pick<Message, "ruleId" | "context">,
		filenameOrConfig: ResolvedConfig | Promise<ResolvedConfig> | string = "inline",
	): Promise<RuleDocumentation | null> {
		const config =
			typeof filenameOrConfig === "string"
				? await this.getConfigFor(filenameOrConfig)
				: await filenameOrConfig;
		const engine = new Engine(config, Parser);
		return engine.getRuleDocumentation(message);
	}

	/**
	 * Get contextual documentation for the given rule. Configuration will be
	 * resolved for given filename.
	 *
	 * @example
	 *
	 * ```js
	 * const report = htmlvalidate.validateFileSync("my-file.html");
	 * for (const result of report.results){
	 *   for (const message of result.messages){
	 *     const documentation = htmlvalidate.getRuleDocumentationSync(message, result.filePath);
	 *     // do something with documentation
	 *   }
	 * }
	 * ```
	 *
	 * @public
	 * @since 8.0.0
	 * @param message - Message reported during validation
	 * @param filename - Filename used to resolve configuration.
	 * @returns Contextual documentation or `null` if the rule does not exist.
	 */
	public getContextualDocumentationSync(
		message: Pick<Message, "ruleId" | "context">,
		filename?: string,
	): RuleDocumentation | null;

	/**
	 * Get contextual documentation for the given rule using provided
	 * configuration.
	 *
	 * @example
	 *
	 * ```js
	 * const report = htmlvalidate.validateFileSync("my-file.html");
	 * for (const result of report.results){
	 *   for (const message of result.messages){
	 *     const documentation = htmlvalidate.getRuleDocumentationSync(message, result.filePath);
	 *     // do something with documentation
	 *   }
	 * }
	 * ```
	 *
	 * @public
	 * @since 8.0.0
	 * @param message - Message reported during validation
	 * @param config - Configuration to use.
	 * @returns Contextual documentation or `null` if the rule does not exist.
	 */
	public getContextualDocumentationSync(
		message: Pick<Message, "ruleId" | "context">,
		config: ResolvedConfig,
	): RuleDocumentation | null;

	public getContextualDocumentationSync(
		message: Pick<Message, "ruleId" | "context">,
		filenameOrConfig: ResolvedConfig | string = "inline",
	): RuleDocumentation | null {
		const config =
			typeof filenameOrConfig === "string"
				? this.getConfigForSync(filenameOrConfig)
				: filenameOrConfig;
		const engine = new Engine(config, Parser);
		return engine.getRuleDocumentation(message);
	}

	/**
	 * Get contextual documentation for the given rule.
	 *
	 * Typical usage:
	 *
	 * ```js
	 * const report = await htmlvalidate.validateFile("my-file.html");
	 * for (const result of report.results){
	 *   const config = await htmlvalidate.getConfigFor(result.filePath);
	 *   for (const message of result.messages){
	 *     const documentation = await htmlvalidate.getRuleDocumentation(message.ruleId, config, message.context);
	 *     // do something with documentation
	 *   }
	 * }
	 * ```
	 *
	 * @public
	 * @deprecated Deprecated since 8.0.0, use [[getContextualDocumentation]] instead.
	 * @param ruleId - Rule to get documentation for.
	 * @param config - If set it provides more accurate description by using the
	 * correct configuration for the file.
	 * @param context - If set to `Message.context` some rules can provide
	 * contextual details and suggestions.
	 */
	public async getRuleDocumentation(
		ruleId: string,
		config: ResolvedConfig | Promise<ResolvedConfig> | null = null,
		context: unknown | null = null,
	): Promise<RuleDocumentation | null> {
		const c = config ?? this.getConfigFor("inline");
		const engine = new Engine(await c, Parser);
		return engine.getRuleDocumentation({ ruleId, context });
	}

	/**
	 * Get contextual documentation for the given rule.
	 *
	 * Typical usage:
	 *
	 * ```js
	 * const report = htmlvalidate.validateFileSync("my-file.html");
	 * for (const result of report.results){
	 *   const config = htmlvalidate.getConfigForSync(result.filePath);
	 *   for (const message of result.messages){
	 *     const documentation = htmlvalidate.getRuleDocumentationSync(message.ruleId, config, message.context);
	 *     // do something with documentation
	 *   }
	 * }
	 * ```
	 *
	 * @public
	 * @deprecated Deprecated since 8.0.0, use [[getContextualDocumentationSync]] instead.
	 * @param ruleId - Rule to get documentation for.
	 * @param config - If set it provides more accurate description by using the
	 * correct configuration for the file.
	 * @param context - If set to `Message.context` some rules can provide
	 * contextual details and suggestions.
	 */
	public getRuleDocumentationSync(
		ruleId: string,
		config: ResolvedConfig | null = null,
		context: unknown | null = null,
	): RuleDocumentation | null {
		const c = config ?? this.getConfigForSync("inline");
		const engine = new Engine(c, Parser);
		return engine.getRuleDocumentation({ ruleId, context });
	}

	/**
	 * Create a parser configured for given filename.
	 *
	 * @internal
	 * @param source - Source to use.
	 */
	public async getParserFor(source: Source): Promise<Parser> {
		const config = await this.getConfigFor(source.filename);
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
	public getConfigFor(filename: string, configOverride?: ConfigData): Promise<ResolvedConfig> {
		const config = this.configLoader.getConfigFor(filename, configOverride);
		return Promise.resolve(config);
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
	public getConfigForSync(filename: string, configOverride?: ConfigData): ResolvedConfig {
		const config = this.configLoader.getConfigFor(filename, configOverride);
		if (isThenable(config)) {
			throw new UserError("Cannot use asynchronous config loader with synchronous api");
		}
		return config;
	}

	/**
	 * Get current configuration loader.
	 *
	 * @public
	 * @since %version%
	 * @returns Current configuration loader.
	 */
	/* istanbul ignore next -- not testing setters/getters */
	public getConfigLoader(): ConfigLoader {
		return this.configLoader;
	}

	/**
	 * Set configuration loader.
	 *
	 * @public
	 * @since %version%
	 * @param loader - New configuration loader to use.
	 */
	/* istanbul ignore next -- not testing setters/getters */
	public setConfigLoader(loader: ConfigLoader): void {
		this.configLoader = loader;
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
