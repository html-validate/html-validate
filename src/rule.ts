/* eslint-disable no-unused-vars */
import { DOMNode } from 'dom';
import { Config } from './config';
import { Location } from './context';
import {
	Event,
	AttributeEvent,
	ConditionalEvent,
	DOMReadyEvent,
	DoctypeEvent,
	TagCloseEvent,
	TagOpenEvent,
	WhitespaceEvent,
} from 'event';
import { Reporter } from './reporter';
import { Parser } from './parser';

export abstract class Rule {
	private reporter: Reporter;
	private parser: Parser;
	private severity: number;
	private event: any;

	/**
	 * Rule name. Defaults to filename without extension but can be overwritten by
	 * subclasses.
	 */
	public name: string;

	/**
	 * Rule options.
	 */
	public readonly options: {[key: string]: any};

	constructor(options: {[key: string]: any}){
		this.options = options;
	}

	setServerity(severity: number): void {
		this.severity = severity;
	}

	/**
	 * Report a new error.
	 */
	report(node: DOMNode, message: string, location?: Location): void {
		if (this.severity >= Config.SEVERITY_WARN){
			const where = this.findLocation({node, location, event: this.event});
			this.reporter.add(node, this, message, this.severity, where);
		}
	}

	private findLocation(src: any){
		if (src.location){
			return src.location;
		}
		if (src.event && src.event.location){
			return src.event.location;
		}
		if (src.node && src.node.location){
			return src.node.location;
		}
		return {};
	}

	/**
	 * Listen for events.
	 */
	on(event: 'tag:open', callback: (event: TagOpenEvent) => void): void;
	on(event: 'tag:close', callback: (event: TagCloseEvent) => void): void;
	on(event: 'dom:load', callback: (event: Event) => void): void;
	on(event: 'dom:ready', callback: (event: DOMReadyEvent) => void): void;
	on(event: 'doctype', callback: (event: DoctypeEvent) => void): void;
	on(event: 'attr', callback: (event: AttributeEvent) => void): void;
	on(event: 'whitespace', callback: (event: WhitespaceEvent) => void): void;
	on(event: 'conditional', callback: (event: ConditionalEvent) => void): void;
	on(event: '*', callback: (event: Event) => void): void;
	on(event: string, callback: any): void {
		this.parser.on(event, (event: string, data: any) => {
			if (this.severity >= Config.SEVERITY_WARN){
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
}
