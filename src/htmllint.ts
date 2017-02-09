import Config from './config';
import Parser from './parser';
import Reporter from './reporter';
import { Source } from './context'; // eslint-disable-line no-unused-vars
import Lexer from './lexer';
import Token from './token';

const fs = require('fs');

class HtmlLint {
	config: Config;

	constructor(options){
		this.config = Config.fromObject(options || {});
	}

	/**
	 * Parse HTML from string.
	 *
	 * @param str {string} - Text to parse.
	 * @return {object} - Report output.
	 */
	string(str: string){
		return this.parse({data: str, filename: 'inline'});
	}

	/**
	 * Parse HTML from file.
	 *
	 * @param filename {string} - Filename to read and parse.
	 * @return {object} - Report output.
	 */
	file(filename: string, mode?: string){
		const text = fs.readFileSync(filename, {encoding: 'utf8'});
		const source = {data: text, filename};
		switch ( mode ){
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
	private parse(src: Source){
		const report = new Reporter();
		const rules = this.config.getRules();
		const parser = new Parser(this.config.get());
		for ( let name in rules ){
			let data = rules[name];
			this.loadRule(name, data, parser, report);
		}

		/* parse token stream */
		parser.parseHtml(src);

		/* generate results from report */
		return report.save();
	}

	private dumpTokens(source: Source){
		let lexer = new Lexer();
		for ( let token of lexer.tokenize(source) ){
			process.stdout.write(`TOKEN: ${Token[token.type]}
  Data: ${JSON.stringify(token.data[0])}
  Location: ${token.location.filename}:${token.location.line}:${token.location.column}
`);
		}
		return {
			valid: true,
			results: [],
		};
	}

	loadRule(name: string, data: any, parser: Parser, report: Reporter){
		let severity = data[0];
		let options = data[1];
		if ( severity >= Config.SEVERITY_WARN ){
			let rule = require('./rules/' + name);
			rule.init(this.createProxy(parser, rule, report), options);
		}
	}

	/**
	 * Create a proxy event binding: parser <-- rule --> report
	 *
	 * Rule can bind events on parser while maintaining "this" bound to the rule.
	 * Callbacks receives an additional argument "report" to write messages to.
	 */
	createProxy(parser, rule, report){
		return {
			on: function(event, callback){
				parser.on(event, function(event, data){
					callback.call(rule, data, function(node, message, location){
						report.add(node, rule, message, location || data.location || node.location);
					});
				});
			},
		};
	}
}

export default HtmlLint;
