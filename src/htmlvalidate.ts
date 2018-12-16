import { Config, ConfigLoader } from './config';
import { Engine, TokenDump, EventDump } from './engine';
import { Parser } from './parser';
import { Report } from './reporter';
import { Source } from './context';

class HtmlValidate {
	private globalConfig: Config;

	constructor(options?: any){
		const defaults = Config.empty();
		this.globalConfig = defaults.merge(options ? Config.fromObject(options) : Config.defaultConfig());
	}

	/**
	 * Parse HTML from string.
	 *
	 * @param str {string} - Text to parse.
	 * @return {object} - Report output.
	 */
	public validateString(str: string): Report {
		const source = {
			data: str,
			filename: 'inline',
			line: 1,
			column: 1,
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
		const config = this.getConfigFor('inline');
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
		const loader = new ConfigLoader();
		const config = loader.fromTarget(filename);
		const merged = this.globalConfig.merge(config);
		merged.init();
		return merged;
	}
}

export default HtmlValidate;
