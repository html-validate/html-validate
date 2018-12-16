import { Config } from "../config";
import { Location, Source } from "../context";
import { InvalidTokenError, Lexer, TokenType } from "../lexer";
import { Parser } from "../parser";
import { Reporter, Report } from "../reporter";
import { Rule, RuleConstructor, RuleOptions } from "../rule";
import { HtmlElement } from "../dom";
import { DirectiveEvent, TagOpenEvent, TagCloseEvent } from "../event";

export interface EventDump {
	event: string;
	data: string;
}

export interface TokenDump {
	token: string;
	data: string;
	location: string;
}

export class Engine<T extends Parser = Parser> {
	protected report: Reporter;
	protected config: Config;
	protected ParserClass: new (config: Config) => T;
	protected availableRules: { [key: string]: RuleConstructor };

	constructor(config: Config, ParserClass: new (config: Config) => T){
		this.report = new Reporter();
		this.config = config;
		this.ParserClass = ParserClass;
		this.availableRules = {};

		/* setup plugins */
		for (const plugin of (this.config.getPlugins())) {
			for (const [name, rule] of Object.entries(plugin.rules)) {
				this.availableRules[name] = rule;
			}
		}
	}

	/**
	 * Lint sources and return report
	 *
	 * @param src {object} - Parse source.
	 * @param src.data {string} - Text HTML data.
	 * @param src.filename {string} - Filename of source for presentation in report.
	 * @return {object} - Report output.
	 */
	public lint(sources: Source[]): Report {
		for (const source of sources){
			/* create parser for source */
			const parser = new this.ParserClass(this.config);

			/* load rules */
			const rules: { [key: string]: Rule } = {};
			Object.entries(this.config.getRules()).map(([name, data]) => {
				rules[name] = this.loadRule(name, data, parser, this.report);
			});

			/* setup directive handling */
			parser.on('directive', (_: string, event: DirectiveEvent) => {
				this.processDirective(event, parser, rules);
			});

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

	public dumpEvents(source: Source[]): EventDump[] {
		const parser = new Parser(this.config);
		const lines: EventDump[] = [];
		parser.on('*', (event, data) => {
			lines.push({event, data});
		});
		source.forEach(src => parser.parseHtml(src));
		return lines;
	}

	public dumpTokens(source: Source[]): TokenDump[] {
		const lexer = new Lexer();
		const lines: TokenDump[] = [];
		for (const src of source){
			for (const token of lexer.tokenize(src)){
				const data = token.data ? token.data[0] : null;
				lines.push({
					token: TokenType[token.type],
					data: data,
					location: `${token.location.filename}:${token.location.line}:${token.location.column}`,
				});
			}
		}
		return lines;
	}

	public dumpTree(source: Source[]): string[] {
		const parser = new Parser(this.config);
		const dom = parser.parseHtml(source[0]); /* @todo handle dumping each tree */
		const lines: string[] = [];

		function decoration(node: HtmlElement){
			let output = '';
			if (node.hasAttribute('id')){
				output += `#${node.id}`;
			}
			if (node.hasAttribute('class')){
				output += `.${node.classList.join('.')}`;
			}
			return output;
		}

		function writeNode(node: HtmlElement, level: number, sibling: number){
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

	private processDirective(event: DirectiveEvent, parser: Parser, allRules: { [key: string]: Rule }): void {
		const rules = event.data
			.split(',')
			.map(name => name.trim())
			.map(name => allRules[name])
			.filter(rule => rule); /* filter out missing rules */
		switch (event.action){
		case 'enable':
			this.processEnableDirective(rules);
			break;
		case 'disable':
			this.processDisableDirective(rules);
			break;
		case 'disable-block':
			this.processDisableBlockDirective(rules, parser);
			break;
		case 'disable-next':
			this.processDisableNextDirective(rules, parser);
			break;
		default:
			this.reportError(`Unknown directive "${event.action}"`, event.location);
			break;
		}
	}

	private processEnableDirective(rules: Rule[]): void {
		for (const rule of rules){
			rule.setEnabled(true);
			if (rule.getSeverity() === Config.SEVERITY_DISABLED){
				rule.setServerity(Config.SEVERITY_ERROR);
			}
		}
	}

	private processDisableDirective(rules: Rule[]): void {
		for (const rule of rules){
			rule.setEnabled(false);
		}
	}

	private processDisableBlockDirective(rules: Rule[], parser: Parser): void {
		let directiveBlock: number = null;
		for (const rule of rules){
			rule.setEnabled(false);
		}

		/* wait for a tag to open and find the current block by using its parent */
		const unregisterOpen = parser.once('tag:open', (event: string, data: TagOpenEvent) => {
			directiveBlock = data.target.parent.unique;
		});

		const unregisterClose = parser.on('tag:close', (event: string, data: TagCloseEvent) => {
			/* if the directive is the last thing in a block no would be set: remove
			 * listeners and restore state */
			if (directiveBlock === null){
				unregisterClose();
				unregisterOpen();
				for (const rule of rules){
					rule.setEnabled(true);
				}
				return;
			}

			/* determine the current block again using the parent of the target,
			 * restore state if the directive block is being closed */
			const currentBlock = data.previous.unique;
			if (currentBlock === directiveBlock){
				unregisterClose();
				for (const rule of rules){
					rule.setEnabled(true);
				}
			}
		});
	}

	private processDisableNextDirective(rules: Rule[], parser: Parser): void {
		for (const rule of rules){
			rule.setEnabled(false);
			parser.once('tag:open, tag:close, attr', () => {
				parser.defer(() => {
					rule.setEnabled(true);
				});
			});
		}
	}

	/**
	 * Load a rule using current config.
	 */
	protected loadRule(name: string, data: any, parser: Parser, report: Reporter): Rule {
		const [severity, options] = data;
		const rule = this.instantiateRule(name, options);
		rule.name = rule.name || name;
		rule.init(parser, report, severity);
		if (rule.setup) {
			rule.setup();
		}
		return rule;
	}

	protected instantiateRule(name: string, options: RuleOptions): Rule {
		if (this.availableRules[name]) {
			return new this.availableRules[name](options);
		} else {
			return this.requireRule(name, options) || this.missingRule(name);
		}
	}

	/* istanbul ignore next: tests mock this function */
	protected requireRule(name: string, options: RuleOptions): any {
		let Class: RuleConstructor;
		try {
			Class = require(`../rules/${name}`);
		} catch (e) {
			return null;
		}
		return new Class(options);
	}

	private missingRule(name: string): any {
		return new class extends Rule {
			setup(){
				this.on('dom:load', () => {
					this.report(null, `Definition for rule '${name}' was not found`);
				});
			}
		}({});
	}

	private reportError(message: string, location: Location): void {
		this.report.addManual(location.filename, {
			ruleId: undefined,
			severity: Config.SEVERITY_ERROR,
			message: message,
			offset: location.offset,
			line: location.line,
			column: location.column,
			size: location.size || 0,
		});
	}
}
