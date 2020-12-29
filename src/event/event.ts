import { ConfigData } from "../config";
import { Location } from "../context";
import { DOMTree, DynamicValue, HtmlElement } from "../dom";
import { Rule } from "../rule";

/**
 * @hidden
 */
export interface Event {
	/** Event location. */
	location: Location | null;
}

/**
 * Configuration ready event.
 */
export interface ConfigReadyEvent extends Event {
	config: ConfigData;
	rules: { [ruleId: string]: Rule };
}

/**
 * Event emitted when opening tags are encountered.
 */
export interface TagOpenEvent extends Event {
	/** Event location. */
	location: Location;

	/** The node being opened. */
	target: HtmlElement;
}

/**
 * Event emitted when close tags `</..>` are encountered.
 */
export interface TagCloseEvent extends Event {
	/** Event location. */
	location: Location;

	/** Temporary node for the close tag. */
	target: HtmlElement;

	/** The node being closed. */
	previous: HtmlElement;
}

/**
 * Event emitted when an element is fully constructed (including its children).
 */
export interface ElementReadyEvent extends Event {
	/** Event location. */
	location: Location;

	/** HTML element */
	target: HtmlElement;
}

/**
 * Event emitted when attributes are encountered.
 */
export interface AttributeEvent extends Event {
	/** Event location. */
	location: Location;

	/** Attribute name. */
	key: string;

	/** Attribute value. */
	value: string | DynamicValue;

	/** Quotemark used. */
	quote: '"' | "'" | undefined;

	/** Set to original attribute when a transformer dynamically added this
	 * attribute. */
	originalAttribute?: string;

	/** HTML element this attribute belongs to. */
	target: HtmlElement;

	/** Location of the attribute value */
	valueLocation: Location | null;
}

/**
 * Event emitted when whitespace content is parsed.
 */
export interface WhitespaceEvent extends Event {
	/** Event location. */
	location: Location;

	/** Text content. */
	text: string;
}

/**
 * Event emitted when Internet Explorer conditionals `<![if ...]>` are
 * encountered.
 */
export interface ConditionalEvent extends Event {
	/** Event location. */
	location: Location;

	/** Condition including markers. */
	condition: string;
}

/**
 * Event emitted when html-validate directives `<!-- [html-validate-...] -->`
 * are encountered.
 */
export interface DirectiveEvent extends Event {
	/** Event location. */
	location: Location;

	/** Directive action. */
	action: string;

	/** Directive options. */
	data: string;

	/** Directive comment. */
	comment: string;
}

/**
 * Event emitted when doctypes `<!DOCTYPE ..>` are encountered.
 */
export interface DoctypeEvent extends Event {
	/** Event location. */
	location: Location;

	/** Selected doctype */
	value: string;

	/** Location of doctype value */
	valueLocation: Location;
}

/**
 * Event emitted when DOM tree is fully constructed.
 */
export interface DOMReadyEvent extends Event {
	/** DOM Tree */
	document: DOMTree;
}
