/* eslint-disable no-unused-vars */
import { DOMNode } from 'dom';
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

export interface Rule {
	name: string;

	init: (parser: RuleParserProxy, options: any) => void;
}

export type RuleReport = (node: DOMNode, message: string, location?: Location) => void;

export type RuleEventCallback = (event: any, report: RuleReport) => void;

export interface RuleParserProxy {
	on(event: 'tag:open', callback: (event: TagOpenEvent, report: RuleReport) => void): void;
	on(event: 'tag:close', callback: (event: TagCloseEvent, report: RuleReport) => void): void;
	on(event: 'dom:load', callback: (event: Event, report: RuleReport) => void): void;
	on(event: 'dom:ready', callback: (event: DOMReadyEvent, report: RuleReport) => void): void;
	on(event: 'doctype', callback: (event: DoctypeEvent, report: RuleReport) => void): void;
	on(event: 'attr', callback: (event: AttributeEvent, report: RuleReport) => void): void;
	on(event: 'whitespace', callback: (event: WhitespaceEvent, report: RuleReport) => void): void;
	on(event: 'conditional', callback: (event: ConditionalEvent, report: RuleReport) => void): void;
	on(event: '*', callback: (event: Event, report: RuleReport) => void): void;
}
