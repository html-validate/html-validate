import { Config } from "../config";
import { Location, Source } from "../context";
import { InvalidTokenError, Lexer, TokenType } from "../lexer";
import { Parser } from "../parser";
import { Reporter, Report } from "../reporter";
import { Rule } from "../rule";
import { DOMNode } from "../dom";

export class Engine<T extends Parser = Parser> {
	protected report: Reporter;
	protected config: Config;
	protected ParserClass: new (config: Config) => T;

	constructor(config: Config, ParserClass: new (config: Config) => T){
		this.report = new Reporter();
		this.config = config;
		this.ParserClass = ParserClass;
	}

	/**
	 * Lint sources and return report
	 *
	 * @param src {object} - Parse source.
	 * @param src.data {string} - Text HTML data.
	 * @param src.filename {string} - Filename of source for presentation in report.
	 * @return {object} - Report output.
	 */
	public lint(sources: Source[]): Report{
		const rules = this.config.getRules();

		for (const source of sources){
			/* create parser for source */
			const parser = new this.ParserClass(this.config);

			/* load rules */
			for (const name in rules){
				const data = rules[name];
				Engine.loadRule(name, data, parser, this.report);
			}

			/* parse token stream */
			try {
				parser.parseHtml(source);
			} catch (e){
				if (e instanceof InvalidTokenError){
					this.reportError(e.message, e.location);
				} else {
					throw e;
				}
			}
		}

		/* generate results from report */
		return this.report.save();
	}

	public dumpEvents(source: Source[]): string[] {
		const parser = new Parser(this.config);
		const filtered = ['parent', 'children'];
		const lines: string[] = [];

		parser.on('*', (event, data) => {
			const strdata = JSON.stringify(data, (key, value) => {
				return filtered.indexOf(key) >= 0 ? '[truncated]' : value;
			}, 2);
			lines.push(`${event}: ${strdata}`);
		});
		source.forEach(src => parser.parseHtml(src));

		return lines;
	}

	public dumpTokens(source: Source[]): string[] {
		const lexer = new Lexer();
		const lines: string[] = [];
		for (const src of source){
			for (const token of lexer.tokenize(src)){
				const data = token.data ? token.data[0] : null;
				lines.push(`TOKEN: ${TokenType[token.type]}
  Data: ${JSON.stringify(data)}
  Location: ${token.location.filename}:${token.location.line}:${token.location.column}`);
			}
		}
		return lines;
	}

	public dumpTree(source: Source[]): string[] {
		const parser = new Parser(this.config);
		const dom = parser.parseHtml(source[0]); /* @todo handle dumping each tree */
		const lines: string[] = [];

		function decoration(node: DOMNode){
			let output = '';
			if (node.hasAttribute('id')){
				output += `#${node.getAttribute('id')}`;
			}
			if (node.hasAttribute('class')){
				output += `.${node.classList.join('.')}`;
			}
			return output;
		}

		function writeNode(node: DOMNode, level: number, sibling: number){
			if (level > 0){
				const indent = '  '.repeat(level - 1);
				const l = node.children.length > 0 ? '┬' : '─';
				const b = sibling < (node.parent.children.length - 1) ? '├' : '└';
				lines.push(`${indent}${b}─${l} ${node.tagName}${decoration(node)}`);
			} else {
				lines.push(`(root)`);
			}

			node.children.forEach((child, index) => writeNode(child, level + 1, index));
		}

		writeNode(dom.root, 0, 0);
		return lines;
	}

	/**
	 * Load a rule using current config.
	 */
	private static loadRule(name: string, data: any, parser: Parser, report: Reporter): void {
		const [severity, options] = data;
		if (severity >= Config.SEVERITY_WARN){
			let rule: Rule;
			try {
				const Class = require(`../rules/${name}`);
				rule = new Class(options);
				rule.name = rule.name || name;
			} catch (e) {
				rule = new class extends Rule {
					setup(){
						this.name = name;
						this.on('dom:load', () => {
							this.report(null, `Definition for rule '${name}' was not found`);
						});
					}
				}(options);
			}
			rule.init(parser, report, severity);
			rule.setup();
		}
	}

	private reportError(message: string, location: Location): void {
		this.report.addManual(location.filename, {
			ruleId: undefined,
			severity: Config.SEVERITY_ERROR,
			message: message,
			line: location.line,
			column: location.column,
		});
	}
}
