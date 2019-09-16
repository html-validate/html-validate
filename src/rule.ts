import path from "path";
import { Severity } from "./config";
import { Location } from "./context";
import { DOMNode } from "./dom";
import {
	AttributeEvent,
	ConditionalEvent,
	DoctypeEvent,
	DOMReadyEvent,
	ElementReadyEvent,
	Event,
	TagCloseEvent,
	TagOpenEvent,
	WhitespaceEvent,
	ConfigReadyEvent,
} from "./event";
import { Parser } from "./parser";
import { Reporter } from "./reporter";

const homepage = require("../package.json").homepage;

export interface RuleOptions {
	[key: string]: any;
}

export interface RuleDocumentation {
	description: string;
	url?: string;
}

export type RuleConstructor = new (options: RuleOptions) => Rule;

export abstract class Rule<T = any> {
	private reporter: Reporter;
	private parser: Parser;
	private enabled: boolean; // rule enabled/disabled, irregardless of severity
	private severity: number; // rule severity, 0: off, 1: warning 2: error
	private event: any;

	/**
	 * Rule name. Defaults to filename without extension but can be overwritten by
	 * subclasses.
	 */
	public name: string;

	/**
	 * Rule options.
	 */
	public readonly options: RuleOptions;

	public constructor(options: RuleOptions) {
		this.options = options;
		this.enabled = true;
	}

	public getSeverity(): number {
		return this.severity;
	}

	public setServerity(severity: number): void {
		this.severity = severity;
	}

	public setEnabled(enabled: boolean): void {
		this.enabled = enabled;
	}

	/**
	 * Test if rule is enabled.
	 *
	 * To be considered enabled the enabled flag must be true and the severity at
	 * least warning.
	 */
	public isEnabled(): boolean {
		return this.enabled && this.severity >= Severity.WARN;
	}

	/**
	 * Report a new error.
	 *
	 * Rule must be enabled both globally and on the specific node for this to
	 * have any effect.
	 */
	public report(
		node: DOMNode,
		message: string,
		location?: Location,
		context?: T
	): void {
		if (this.isEnabled() && (!node || node.ruleEnabled(this.name))) {
			const where = this.findLocation({ node, location, event: this.event });
			this.reporter.add(this, message, this.severity, where, context);
		}
	}

	private findLocation(src: {
		node: DOMNode;
		location: Location;
		event: Event;
	}): Location {
		if (src.location) {
			return src.location;
		}
		if (src.event && src.event.location) {
			return src.event.location;
		}
		if (src.node && src.node.location) {
			return src.node.location;
		}
		return {} as Location;
	}

	/**
	 * Listen for events.
	 *
	 * Adding listeners can be done even if the rule is disabled but for the
	 * events to be delivered the rule must be enabled.
	 *
	 * @param event - Event name
	 */
	public on(
		event: "config:ready",
		callback: (event: ConfigReadyEvent) => void
	): void;
	public on(event: "tag:open", callback: (event: TagOpenEvent) => void): void;
	public on(event: "tag:close", callback: (event: TagCloseEvent) => void): void;
	public on(
		event: "element:ready",
		callback: (event: ElementReadyEvent) => void
	): void;
	public on(event: "dom:load", callback: (event: Event) => void): void;
	public on(event: "dom:ready", callback: (event: DOMReadyEvent) => void): void;
	public on(event: "doctype", callback: (event: DoctypeEvent) => void): void;
	public on(event: "attr", callback: (event: AttributeEvent) => void): void;
	public on(
		event: "whitespace",
		callback: (event: WhitespaceEvent) => void
	): void;
	public on(
		event: "conditional",
		callback: (event: ConditionalEvent) => void
	): void;
	public on(event: "*", callback: (event: Event) => void): void;
	public on(event: string, callback: any): void {
		this.parser.on(event, (event: string, data: any) => {
			if (this.isEnabled()) {
				this.event = data;
				callback(data);
			}
		});
	}

	/**
	 * Called by [[Engine]] when initializing the rule.
	 *
	 * Do not override this, use the `setup` callback instead.
	 *
	 * @hidden
	 */
	public init(parser: Parser, reporter: Reporter, severity: number): void {
		this.parser = parser;
		this.reporter = reporter;
		this.severity = severity;
	}

	/**
	 * Rule setup callback.
	 *
	 * Override this to provide rule setup code.
	 */
	public abstract setup(): void;

	/**
	 * Rule documentation callback.
	 *
	 * Called when requesting additional documentation for a rule. Some rules
	 * provide additional context to provide context-aware suggestions.
	 *
	 * @param context - Error context given by a reported error.
	 * @returns Rule documentation and url with additional details or `null` if no
	 * additional documentation is available.
	 */
	/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
	public documentation(context?: T): RuleDocumentation {
		return null;
	}
}

export function ruleDocumentationUrl(filename: string): string {
	const p = path.parse(filename);
	return `${homepage}/rules/${p.name}.html`;
}
