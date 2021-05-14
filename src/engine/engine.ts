import { ConfigData, ResolvedConfig, RuleOptions, Severity } from "../config";
import { Location, Source } from "../context";
import { HtmlElement } from "../dom";
import { DOMInternalID } from "../dom/domnode";
import {
	ConfigReadyEvent,
	DirectiveEvent,
	SourceReadyEvent,
	TagEndEvent,
	TagStartEvent,
} from "../event";
import { InvalidTokenError, Lexer, TokenType } from "../lexer";
import { Parser, ParserError } from "../parser";
import { Report, Reporter } from "../reporter";
import { Rule, RuleConstructor, RuleDocumentation } from "../rule";
import bundledRules from "../rules";

export interface EventDump {
	event: string;
	data: any;
}

export interface TokenDump {
	token: string;
	data: string;
	location: string;
}

export class Engine<T extends Parser = Parser> {
	protected report: Reporter;
	protected configData: ConfigData;
	protected config: ResolvedConfig;
	protected ParserClass: new (config: ResolvedConfig) => T;
	protected availableRules: Record<string, RuleConstructor<any, any>>;

	public constructor(
		config: ResolvedConfig,
		configData: ConfigData,
		ParserClass: new (config: ResolvedConfig) => T
	) {
		this.report = new Reporter();
		this.configData = configData;
		this.config = config;
		this.ParserClass = ParserClass;

		/* initialize plugins and rules */
		const result = this.initPlugins(this.config);
		this.availableRules = {
			...bundledRules,
			...result.availableRules,
		};
	}

	/**
	 * Lint sources and return report
	 *
	 * @param src - Parsed source.
	 * @returns Report output.
	 */
	public lint(sources: Source[]): Report {
		for (const source of sources) {
			/* create parser for source */
			const parser = this.instantiateParser();

			/* setup plugins and rules */
			const { rules } = this.setupPlugins(source, this.config, parser);

			/* create a faux location at the start of the stream for the next events */
			const location: Location = {
				filename: source.filename,
				line: 1,
				column: 1,
				offset: 0,
				size: 1,
			};

			/* trigger configuration ready event */
			const configEvent: ConfigReadyEvent = {
				location,
				config: this.configData,
				rules,
			};
			parser.trigger("config:ready", configEvent);

			/* trigger source ready event */
			/* eslint-disable-next-line @typescript-eslint/no-unused-vars -- object destructured on purpose to remove property */
			const { hooks: _, ...sourceData } = source;
			const sourceEvent: SourceReadyEvent = {
				location,
				source: sourceData,
			};
			parser.trigger("source:ready", sourceEvent);

			/* setup directive handling */
			parser.on("directive", (_: string, event: DirectiveEvent) => {
				this.processDirective(event, parser, rules);
			});

			/* parse token stream */
			try {
				parser.parseHtml(source);
			} catch (e) {
				if (e instanceof InvalidTokenError || e instanceof ParserError) {
					this.reportError("parser-error", e.message, e.location);
				} else {
					throw e;
				}
			}
		}

		/* generate results from report */
		return this.report.save(sources);
	}

	/**
	 * Returns a list of all events generated while parsing the source.
	 *
	 * For verbosity, token events are ignored (use [[dumpTokens]] to inspect
	 * token stream).
	 */
	public dumpEvents(source: Source[]): EventDump[] {
		const parser = this.instantiateParser();
		const lines: EventDump[] = [];
		parser.on("*", (event, data) => {
			/* ignore token events as it becomes to verbose */
			if (event === "token") {
				return;
			}
			lines.push({ event, data });
		});
		source.forEach((src) => parser.parseHtml(src));
		return lines;
	}

	public dumpTokens(source: Source[]): TokenDump[] {
		const lexer = new Lexer();
		const lines: TokenDump[] = [];
		for (const src of source) {
			for (const token of lexer.tokenize(src)) {
				const data = token.data ? token.data[0] : null;
				lines.push({
					token: TokenType[token.type],
					data,
					location: `${token.location.filename}:${token.location.line}:${token.location.column}`,
				});
			}
		}
		return lines;
	}

	public dumpTree(source: Source[]): string[] {
		/* @todo handle dumping each tree */
		const parser = this.instantiateParser();
		const document = parser.parseHtml(source[0]);
		const lines: string[] = [];

		function decoration(node: HtmlElement): string {
			let output = "";
			if (node.hasAttribute("id")) {
				output += `#${node.id}`;
			}
			if (node.hasAttribute("class")) {
				output += `.${node.classList.join(".")}`;
			}
			return output;
		}

		function writeNode(node: HtmlElement, level: number, sibling: number): void {
			if (node.parent) {
				const indent = "  ".repeat(level - 1);
				const l = node.childElements.length > 0 ? "┬" : "─";
				const b = sibling < node.parent.childElements.length - 1 ? "├" : "└";
				lines.push(`${indent}${b}─${l} ${node.tagName}${decoration(node)}`);
			} else {
				lines.push("(root)");
			}

			node.childElements.forEach((child, index) => writeNode(child, level + 1, index));
		}

		writeNode(document, 0, 0);
		return lines;
	}

	/**
	 * Get rule documentation.
	 */
	public getRuleDocumentation(
		ruleId: string,
		context?: any // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
	): RuleDocumentation | null {
		const rules = this.config.getRules();
		if (rules.has(ruleId)) {
			const [, options] = rules.get(ruleId) as any;
			const rule = this.instantiateRule(ruleId, options);
			return rule.documentation(context);
		} else {
			return null;
		}
	}

	/**
	 * Create a new parser instance with the current configuration.
	 *
	 * @internal
	 */
	public instantiateParser(): Parser {
		return new this.ParserClass(this.config);
	}

	private processDirective(
		event: DirectiveEvent,
		parser: Parser,
		allRules: { [key: string]: Rule }
	): void {
		const rules = event.data
			.split(",")
			.map((name) => name.trim())
			.map((name) => allRules[name])
			.filter((rule) => rule); /* filter out missing rules */
		switch (event.action) {
			case "enable":
				this.processEnableDirective(rules, parser);
				break;
			case "disable":
				this.processDisableDirective(rules, parser);
				break;
			case "disable-block":
				this.processDisableBlockDirective(rules, parser);
				break;
			case "disable-next":
				this.processDisableNextDirective(rules, parser);
				break;
			default:
				this.reportError("parser-error", `Unknown directive "${event.action}"`, event.location);
				break;
		}
	}

	private processEnableDirective(rules: Rule[], parser: Parser): void {
		for (const rule of rules) {
			rule.setEnabled(true);
			if (rule.getSeverity() === Severity.DISABLED) {
				rule.setServerity(Severity.ERROR);
			}
		}

		/* enable rules on node */
		parser.on("tag:start", (event: string, data: TagStartEvent) => {
			data.target.enableRules(rules.map((rule) => rule.name));
		});
	}

	private processDisableDirective(rules: Rule[], parser: Parser): void {
		for (const rule of rules) {
			rule.setEnabled(false);
		}

		/* disable rules on node */
		parser.on("tag:start", (event: string, data: TagStartEvent) => {
			data.target.disableRules(rules.map((rule) => rule.name));
		});
	}

	private processDisableBlockDirective(rules: Rule[], parser: Parser): void {
		let directiveBlock: DOMInternalID | null = null;
		for (const rule of rules) {
			rule.setEnabled(false);
		}

		const unregisterOpen = parser.on("tag:start", (event: string, data: TagStartEvent) => {
			/* wait for a tag to open and find the current block by using its parent */
			if (directiveBlock === null) {
				directiveBlock = data.target.parent?.unique ?? null;
			}

			/* disable rules directly on the node so it will be recorded for later,
			 * more specifically when using the domtree to trigger errors */
			data.target.disableRules(rules.map((rule) => rule.name));
		});

		const unregisterClose = parser.on("tag:end", (event: string, data: TagEndEvent) => {
			/* if the directive is the last thing in a block no id would be set */
			const lastNode = directiveBlock === null;

			/* test if the block is being closed by checking the parent of the block
			 * element is being closed */
			const parentClosed = directiveBlock === data.previous.unique;

			/* remove listeners and restore state */
			if (lastNode || parentClosed) {
				unregisterClose();
				unregisterOpen();
				for (const rule of rules) {
					rule.setEnabled(true);
				}
			}
		});
	}

	private processDisableNextDirective(rules: Rule[], parser: Parser): void {
		for (const rule of rules) {
			rule.setEnabled(false);
		}

		/* disable rules directly on the node so it will be recorded for later,
		 * more specifically when using the domtree to trigger errors */
		const unregister = parser.on("tag:start", (event: string, data: TagStartEvent) => {
			data.target.disableRules(rules.map((rule) => rule.name));
		});

		/* disable directive after next event occurs */
		parser.once("tag:ready, tag:end, attr", () => {
			unregister();
			parser.defer(() => {
				for (const rule of rules) {
					rule.setEnabled(true);
				}
			});
		});
	}

	/*
	 * Initialize all plugins. This should only be done once for all sessions.
	 */
	protected initPlugins(config: ResolvedConfig): {
		availableRules: { [key: string]: RuleConstructor<any, any> };
	} {
		for (const plugin of config.getPlugins()) {
			if (plugin.init) {
				plugin.init();
			}
		}

		return {
			availableRules: this.initRules(config),
		};
	}

	/**
	 * Initializes all rules from plugins and returns an object with a mapping
	 * between rule name and its constructor.
	 */
	protected initRules(config: ResolvedConfig): { [key: string]: RuleConstructor<any, any> } {
		const availableRules: { [key: string]: RuleConstructor<any, any> } = {};
		for (const plugin of config.getPlugins()) {
			for (const [name, rule] of Object.entries(plugin.rules || {})) {
				if (!rule) continue;
				availableRules[name] = rule;
			}
		}
		return availableRules;
	}

	/**
	 * Setup all plugins for this session.
	 */
	protected setupPlugins(
		source: Source,
		config: ResolvedConfig,
		parser: Parser
	): {
		rules: { [key: string]: Rule };
	} {
		const eventHandler = parser.getEventHandler();
		for (const plugin of config.getPlugins()) {
			if (plugin.setup) {
				plugin.setup(source, eventHandler);
			}
		}

		return {
			rules: this.setupRules(config, parser),
		};
	}

	/**
	 * Load and setup all rules for current configuration.
	 */
	protected setupRules(config: ResolvedConfig, parser: Parser): { [key: string]: Rule } {
		const rules: { [key: string]: Rule } = {};
		for (const [ruleId, [severity, options]] of config.getRules().entries()) {
			rules[ruleId] = this.loadRule(ruleId, config, severity, options, parser, this.report);
		}
		return rules;
	}

	/**
	 * Load and setup a rule using current config.
	 */
	protected loadRule(
		ruleId: string,
		config: ResolvedConfig,
		severity: Severity,
		options: RuleOptions,
		parser: Parser,
		report: Reporter
	): Rule {
		const meta = config.getMetaTable();
		const rule = this.instantiateRule(ruleId, options);
		rule.name = ruleId;
		rule.init(parser, report, severity, meta);

		/* call setup callback if present */
		if (rule.setup) {
			rule.setup();
		}

		return rule;
	}

	protected instantiateRule(name: string, options: RuleOptions): Rule {
		if (this.availableRules[name]) {
			const RuleConstructor = this.availableRules[name];
			return new RuleConstructor(options);
		} else {
			return this.missingRule(name);
		}
	}

	protected missingRule(name: string): Rule {
		return new (class MissingRule extends Rule {
			public setup(): void {
				this.on("dom:load", () => {
					this.report(null, `Definition for rule '${name}' was not found`);
				});
			}
		})();
	}

	private reportError(ruleId: string, message: string, location: Location): void {
		this.report.addManual(location.filename, {
			ruleId,
			severity: Severity.ERROR,
			message,
			offset: location.offset,
			line: location.line,
			column: location.column,
			size: location.size || 0,
			selector: null,
		});
	}
}
