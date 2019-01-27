import { Location } from "../context";
import { DOMTree, DynamicValue, HtmlElement } from "../dom";

export interface Event {
	location: Location;
}

export interface TagOpenEvent extends Event {
	target: HtmlElement;
}

export interface TagCloseEvent extends Event {
	target: HtmlElement;
	previous: HtmlElement;
}

export interface AttributeEvent extends Event {
	key: string;
	value: string | DynamicValue;
	quote: '"' | "'" | undefined;
	target: HtmlElement;
	valueLocation: Location;
}

export interface WhitespaceEvent extends Event {
	text: string;
}

export interface ConditionalEvent extends Event {
	condition: string;
}

export interface DirectiveEvent extends Event {
	action: string;
	data: string;
	comment: string;
}

export interface DoctypeEvent extends Event {
	value: string;
}

export interface DOMReadyEvent extends Event {
	document: DOMTree;
}
