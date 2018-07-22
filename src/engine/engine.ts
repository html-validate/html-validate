import { Config } from "../config";
import { Location, Source } from "../context";
import { InvalidTokenError } from "../lexer";
import { Parser } from "../parser";
import { Reporter } from "../reporter";
import { Rule } from "../rule";

export class Engine {
	report: Reporter;
	config: Config;

	constructor(config: Config){
		this.report = new Reporter();
		this.config = config;
	}

	/**
	 * Generate report for given sources.
	 */
	public process(sources: Source[]){
		const rules = this.config.getRules();

		for (const source of sources){
			/* create parser for source */
			const parser = new Parser(this.config);

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

	/**
	 * Load a rule using current config.
	 */
	private static loadRule(name: string, data: any, parser: Parser, report: Reporter){
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
