/* eslint-disable no-unused-vars */
import { Config } from "./config";
import { Location } from "./context";
import { HtmlElement } from "./dom";
import {
	AttributeEvent,
	ConditionalEvent,
	DoctypeEvent,
	DOMReadyEvent,
	Event,
	TagCloseEvent,
	TagOpenEvent,
	WhitespaceEvent,
} from "./event";
import { Parser } from "./parser";
import { Reporter } from "./reporter";

export interface RuleOptions {
	[key: string]: any;
}

export interface RuleDocumentation {
	description: string;
	url?: string;
}

export type RuleConstructor = new (options: RuleOptions) => Rule;

export abstract class Rule {
	private reporter: Reporter;
	private parser: Parser;
	private enabled: boolean;           // rule enabled/disabled, irregardless of severity
	private severity: number;           // rule severity, 0: off, 1: warning 2: error
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

	constructor(options: RuleOptions){
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
		return this.enabled && this.severity >= Config.SEVERITY_WARN;
	}

	/**
	 * Report a new error.
	 *
	 * Rule must be enabled for this to have any effect.
	 */
	report(node: HtmlElement, message: string, location?: Location): void {
		if (this.isEnabled()){
			const where = this.findLocation({node, location, event: this.event});
			this.reporter.add(node, this, message, this.severity, where);
		}
	}

	// eslint-disable-next-line typescript/member-delimiter-style
	private findLocation(src: {node: HtmlElement, location: Location, event: Event}): Location {
		if (src.location){
			return src.location;
		}
		if (src.event && src.event.location){
			return src.event.location;
		}
		if (src.node && src.node.location){
			return src.node.location;
		}
		return {} as Location;
	}

	/**
	 * Listen for events.
	 *
	 * Adding listeners can be done even if the rule is disabled but for the
	 * events to be delivered the rule must be enabled.
	 */
	on(event: "tag:open", callback: (event: TagOpenEvent) => void): void;
	on(event: "tag:close", callback: (event: TagCloseEvent) => void): void;
	on(event: "dom:load", callback: (event: Event) => void): void;
	on(event: "dom:ready", callback: (event: DOMReadyEvent) => void): void;
	on(event: "doctype", callback: (event: DoctypeEvent) => void): void;
	on(event: "attr", callback: (event: AttributeEvent) => void): void;
	on(event: "whitespace", callback: (event: WhitespaceEvent) => void): void;
	on(event: "conditional", callback: (event: ConditionalEvent) => void): void;
	on(event: "*", callback: (event: Event) => void): void;
	on(event: string, callback: any): void {
		this.parser.on(event, (event: string, data: any) => {
			if (this.isEnabled()){
				this.event = data;
				callback(data);
			}
		});
	}

	init(parser: Parser, reporter: Reporter, severity: number): void {
		this.parser = parser;
		this.reporter = reporter;
		this.severity = severity;
	}

	abstract setup(): void;

	documentation(): RuleDocumentation {
		return null;
	}
}
