import Config from './config';
import Parser from './parser';
import { DOMNode } from 'dom';
import { Reporter, Report } from './reporter';
import { Source, LocationData } from './context';
import { Lexer } from './lexer';
import { TokenType } from './token';
import { Rule, RuleEventCallback, RuleParserProxy, RuleReport } from './rule';

const fs = require('fs');

class HtmlLint {
	private config: Config;

	constructor(options?: any){
		this.config = Config.fromObject(options || {});
	}

	/**
	 * Parse HTML from string.
	 *
	 * @param str {string} - Text to parse.
	 * @return {object} - Report output.
	 */
	string(str: string): Report {
		return this.parse({data: str, filename: 'inline'});
	}

	/**
	 * Parse HTML from file.
	 *
	 * @param filename {string} - Filename to read and parse.
	 * @return {object} - Report output.
	 */
	file(filename: string, mode?: string): Report {
		const text = fs.readFileSync(filename, {encoding: 'utf8'});
		const source = {data: text, filename};
		switch (mode){
		case 'lint':
		case undefined:
			return this.parse(source);
		case 'dump-tokens':
			return this.dumpTokens(source);
		default:
			throw new Error(`Unknown mode "${mode}"`);
		}
	}

	/**
	 * Internal parse method.
	 *
	 * @param src {object} - Parse source.
	 * @param src.data {string} - Text HTML data.
	 * @param src.filename {string} - Filename of source for presentation in report.
	 * @return {object} - Report output.
	 */
	private parse(src: Source): Report {
		const report = new Reporter();
		const rules = this.config.getRules();
		const parser = this.getParser();
		for (const name in rules){
			const data = rules[name];
			this.loadRule(name, data, parser, report);
		}

		/* parse token stream */
		parser.parseHtml(src);

		/* generate results from report */
		return report.save();
	}

	public getParser(): Parser {
		return new Parser(this.config);
	}

	private dumpTokens(source: Source): Report {
		const lexer = new Lexer();
		for (const token of lexer.tokenize(source)){
			const data = token.data ? token.data[0] : null;
			process.stdout.write(`TOKEN: ${TokenType[token.type]}
  Data: ${JSON.stringify(data)}
  Location: ${token.location.filename}:${token.location.line}:${token.location.column}
`);
		}
		return {
			valid: true,
			results: [],
		};
	}

	loadRule(name: string, data: any, parser: Parser, report: Reporter){
		const [severity, options] = data;
		if (severity >= Config.SEVERITY_WARN){
			let rule;
			try {
				rule = require(`./rules/${name}`);
			} catch (e) {
				rule = {
					name: name,
					init: (parser: RuleParserProxy) => {
						parser.on('dom:load', (event: any, report: RuleReport) => {
							report(null, `Definition for rule '${name}' was not found`);
						});
					},
				} as Rule;
			}
			rule.init(this.createProxy(parser, rule, report), options);
		}
	}

	/**
	 * Create a proxy event binding: parser <-- rule --> report
	 *
	 * Rule can bind events on parser while maintaining "this" bound to the rule.
	 * Callbacks receives an additional argument "report" to write messages to.
	 */
	createProxy(parser: Parser, rule: Rule, report: Reporter){
		return {
			on: function(event: string, callback: RuleEventCallback){
				parser.on(event, function(event, data){
					callback.call(rule, data, reportFunc);

					function reportFunc(node: DOMNode, message: string, location: LocationData){
						report.add(node, rule, message, location || data.location || node.location);
					}
				});
			},
		};
	}
}

export default HtmlLint;
