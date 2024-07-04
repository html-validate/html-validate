import { type ResolvedConfig, type RuleOptions, Severity } from "../config";
import { type Location, type Source } from "../context";
import { type HtmlElement } from "../dom";
import { type DOMInternalID } from "../dom/domnode";
import {
	type ConfigReadyEvent,
	type DirectiveEvent,
	type RuleErrorEvent,
	type SourceReadyEvent,
	type TagEndEvent,
	type TagStartEvent,
} from "../event";
import { InvalidTokenError, Lexer, TokenType } from "../lexer";
import { type Message } from "../message";
import { type Parser, ParserError } from "../parser";
import { type Report, Reporter } from "../reporter";
import { type RuleConstructor, type RuleDocumentation, Rule } from "../rule";
import type NoUnusedDisable from "../rules/no-unused-disable";
import bundledRules from "../rules";
import { createBlocker } from "./rule-blocker";

/**
 * @internal
 */
export interface EventDump {
	event: string;
	data: any;
}

/**
 * @internal
 */
export interface TokenDump {
	token: string;
	data: string;
	location: string;
}

interface DirectiveContext {
	readonly rules: Record<string, Rule<unknown, unknown> | undefined>;
	reportUnused(rules: Set<string>, unused: Set<string>, options: string, location: Location): void;
}

/**
 * @internal
 */
export class Engine<T extends Parser = Parser> {
	private report: Reporter;
	private config: ResolvedConfig;
	private ParserClass: new (config: ResolvedConfig) => T;
	private availableRules: Record<string, RuleConstructor<unknown, unknown> | undefined>;

	public constructor(config: ResolvedConfig, ParserClass: new (config: ResolvedConfig) => T) {
		this.report = new Reporter();
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
	 * @param sources - Sources to lint.
	 * @returns Report output.
	 */
	public lint(sources: Source[]): Report {
		for (const source of sources) {
			/* create parser for source */
			const parser = this.instantiateParser();

			/* setup plugins and rules */
			const { rules } = this.setupPlugins(source, this.config, parser);
			const noUnusedDisable = rules["no-unused-disable"] as NoUnusedDisable;
			const directiveContext: DirectiveContext = {
				rules,
				reportUnused(
					rules: Set<string>,
					unused: Set<string>,
					options: string,
					location: Location,
				): void {
					if (!rules.has(noUnusedDisable.name)) {
						noUnusedDisable.reportUnused(unused, options, location);
					}
				},
			};

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
				config: this.config,
				rules,
			};
			parser.trigger("config:ready", configEvent);

			/* trigger source ready event */
			const { hooks: _, ...sourceData } = source;
			const sourceEvent: SourceReadyEvent = {
				location,
				source: sourceData,
			};
			parser.trigger("source:ready", sourceEvent);

			/* setup directive handling */
			parser.on("directive", (_: string, event: DirectiveEvent) => {
				this.processDirective(event, parser, directiveContext);
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
				const data = token.data[0] ?? "";
				const filename = token.location.filename;
				const line = String(token.location.line);
				const column = String(token.location.column);
				lines.push({
					token: TokenType[token.type],
					data,
					location: `${filename}:${line}:${column}`,
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
			if (node.id) {
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

			node.childElements.forEach((child, index) => {
				writeNode(child, level + 1, index);
			});
		}

		writeNode(document, 0, 0);
		return lines;
	}

	/**
	 * Get rule documentation.
	 */
	public getRuleDocumentation({
		ruleId,
		context,
	}: Pick<Message, "ruleId" | "context">): RuleDocumentation | null {
		const rules = this.config.getRules();
		const ruleData = rules.get(ruleId);
		if (ruleData) {
			const [, options] = ruleData;
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

	private processDirective(event: DirectiveEvent, parser: Parser, context: DirectiveContext): void {
		const rules = event.data
			.split(",")
			.map((name) => name.trim())
			.map((name) => context.rules[name])
			.filter((rule): rule is Rule<unknown, unknown> => {
				/* filter out missing rules */
				return Boolean(rule);
			});
		/* istanbul ignore next: option must be present or there would be no rules to disable */
		const location = event.optionsLocation ?? event.location;
		switch (event.action) {
			case "enable":
				this.processEnableDirective(rules, parser);
				break;
			case "disable":
				this.processDisableDirective(rules, parser);
				break;
			case "disable-block":
				this.processDisableBlockDirective(context, rules, parser, event.data, location);
				break;
			case "disable-next":
				this.processDisableNextDirective(context, rules, parser, event.data, location);
				break;
		}
	}

	private processEnableDirective(rules: Array<Rule<unknown, unknown>>, parser: Parser): void {
		for (const rule of rules) {
			rule.setEnabled(true);
			if (rule.getSeverity() === Severity.DISABLED) {
				rule.setServerity(Severity.ERROR);
			}
		}

		/* enable rules on node */
		parser.on("tag:start", (_event: string, data: TagStartEvent) => {
			data.target.enableRules(rules.map((rule) => rule.name));
		});
	}

	private processDisableDirective(rules: Array<Rule<unknown, unknown>>, parser: Parser): void {
		for (const rule of rules) {
			rule.setEnabled(false);
		}

		/* disable rules on node */
		parser.on("tag:start", (_event: string, data: TagStartEvent) => {
			data.target.disableRules(rules.map((rule) => rule.name));
		});
	}

	private processDisableBlockDirective(
		context: DirectiveContext,
		rules: Array<Rule<unknown, unknown>>,
		parser: Parser,
		options: string,
		location: Location,
	): void {
		const ruleIds = new Set(rules.map((it) => it.name));
		const unused = new Set(ruleIds);
		const blocker = createBlocker();
		let directiveBlock: DOMInternalID | null = null;

		for (const rule of rules) {
			rule.block(blocker);
		}

		const unregisterOpen = parser.on("tag:start", (_event: string, data: TagStartEvent) => {
			/* wait for a tag to open and find the current block by using its parent */
			if (directiveBlock === null) {
				/* istanbul ignore next: there will always be a parent (root element if
				 * nothing else) but typescript doesn't know that */
				directiveBlock = data.target.parent?.unique ?? null;
			}

			/* disable rules directly on the node so it will be recorded for later,
			 * more specifically when using the domtree to trigger errors */
			data.target.blockRules(ruleIds, blocker);
		});

		const unregisterClose = parser.on("tag:end", (_event: string, data: TagEndEvent) => {
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
					rule.unblock(blocker);
				}
			}
		});

		parser.on("rule:error", (_event: string, data: RuleErrorEvent) => {
			if (data.blockers.includes(blocker)) {
				unused.delete(data.ruleId);
			}
		});

		parser.on("parse:end", () => {
			context.reportUnused(ruleIds, unused, options, location);
		});
	}

	private processDisableNextDirective(
		context: DirectiveContext,
		rules: Array<Rule<unknown, unknown>>,
		parser: Parser,
		options: string,
		location: Location,
	): void {
		const ruleIds = new Set(rules.map((it) => it.name));
		const unused = new Set(ruleIds);
		const blocker = createBlocker();

		for (const rule of rules) {
			rule.block(blocker);
		}

		/* block rules directly on the node so it will be recorded for later,
		 * more specifically when using the domtree to trigger errors */
		const unregister = parser.on("tag:start", (_event: string, data: TagStartEvent) => {
			data.target.blockRules(ruleIds, blocker);
		});

		parser.on("rule:error", (_event: string, data: RuleErrorEvent) => {
			if (data.blockers.includes(blocker)) {
				unused.delete(data.ruleId);
			}
		});

		parser.on("parse:end", () => {
			context.reportUnused(ruleIds, unused, options, location);
		});

		/* disable directive after next event occurs */
		parser.once("tag:ready, tag:end, attr", () => {
			unregister();
			parser.defer(() => {
				for (const rule of rules) {
					rule.unblock(blocker);
				}
			});
		});
	}

	/*
	 * Initialize all plugins. This should only be done once for all sessions.
	 */
	private initPlugins(config: ResolvedConfig): {
		availableRules: Record<string, RuleConstructor<any, any>>;
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
	private initRules(config: ResolvedConfig): Record<string, RuleConstructor<any, any>> {
		const availableRules: Record<string, RuleConstructor<any, any>> = {};
		for (const plugin of config.getPlugins()) {
			for (const [name, rule] of Object.entries(plugin.rules ?? {})) {
				if (!rule) continue;
				availableRules[name] = rule;
			}
		}
		return availableRules;
	}

	/**
	 * Setup all plugins for this session.
	 */
	private setupPlugins(
		source: Source,
		config: ResolvedConfig,
		parser: Parser,
	): {
		rules: Record<string, Rule<unknown, unknown>>;
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
	private setupRules(
		config: ResolvedConfig,
		parser: Parser,
	): Record<string, Rule<unknown, unknown>> {
		const rules: Record<string, Rule<unknown, unknown>> = {};
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
		report: Reporter,
	): Rule<unknown, unknown> {
		const meta = config.getMetaTable();
		const rule = this.instantiateRule(ruleId, options);
		rule.name = ruleId;
		rule.init(parser, report, severity, meta);

		/* call setup callback if present */
		/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition --
		 * unnecessary from a typescript perspective but if the plugin is not
		 * implemented in TS the user might not have implemented the callback even
		 * if the declaration requires it */
		if (rule.setup) {
			rule.setup();
		}

		return rule;
	}

	protected instantiateRule(name: string, options: RuleOptions): Rule<unknown, unknown> {
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
			size: location.size,
			selector: () => null,
		});
	}
}
