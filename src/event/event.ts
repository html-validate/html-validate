import { type ResolvedConfig } from "../config";
import { type Location, type Source } from "../context";
import { type DOMTree, type DynamicValue, type HtmlElement } from "../dom";
import { type RuleBlocker } from "../engine/rule-blocker";
import { type Token, type TokenType } from "../lexer";
import { type MetaAttribute } from "../meta";
import { type Rule } from "../rule";

/**
 * @public
 */
export interface Event {
	/** Event location. */
	location: Location | null;
}

/**
 * Configuration ready event.
 *
 * @public
 */
export interface ConfigReadyEvent extends Event {
	config: ResolvedConfig;
	rules: Record<string, Rule<unknown, unknown>>;
}

/**
 * Source ready event. Emitted after source has been transformed but before any
 * markup is processed.
 *
 * The source object must not be modified (use a transformer if modifications
 * are required)
 *
 * @public
 */
export interface SourceReadyEvent extends Event {
	source: Source;
}

/**
 * Token event.
 *
 * @internal
 */
export interface TokenEvent extends Event {
	/** @deprecated use token property which is typesafe */
	type: TokenType;

	/** @deprecated use token property which is typesafe */
	data?: any;

	token: Token;
}

/**
 * Event emitted when starting tags are encountered.
 *
 * @public
 */
export interface TagStartEvent extends Event {
	/** Event location. */
	location: Location;

	/** The node being started. */
	target: HtmlElement;
}

/**
 * Deprecated alias for TagStartEvent
 *
 * @public
 * @deprecated Use TagStartEvent instead
 */
export type TagOpenEvent = TagStartEvent;

/**
 * Event emitted when end tags `</..>` are encountered.
 *
 * @public
 */
export interface TagEndEvent extends Event {
	/** Event location. */
	location: Location;

	/** Temporary node for the end tag. Can be null for elements left unclosed
	 * when document ends */
	target: HtmlElement | null;

	/** The node being closed. */
	previous: HtmlElement;
}

/**
 * Deprecated alias for TagEndEvent
 *
 * @public
 * @deprecated Use TagEndEvent instead
 */
export type TagCloseEvent = TagEndEvent;

/**
 * Event emitted when a tag is ready (i.e. all the attributes has been
 * parsed). The children of the element will not yet be finished.
 *
 * @public
 */
export interface TagReadyEvent extends Event {
	/** Event location. */
	location: Location;

	/** The node that is finished parsing. */
	target: HtmlElement;
}

/**
 * Event emitted when an element is fully constructed (including its children).
 *
 * @public
 */
export interface ElementReadyEvent extends Event {
	/** Event location. */
	location: Location;

	/** HTML element */
	target: HtmlElement;
}

/**
 * Event emitted when attributes are encountered.
 *
 * @public
 */
export interface AttributeEvent extends Event {
	/** Location of the full attribute (key, quotes and value) */
	location: Location;

	/** Attribute name. */
	key: string;

	/** Attribute value. */
	value: string | DynamicValue | null;

	/** Quotemark used. */
	quote: '"' | "'" | null;

	/** Set to original attribute when a transformer dynamically added this
	 * attribute. */
	originalAttribute?: string;

	/** HTML element this attribute belongs to. */
	target: HtmlElement;

	/** Location of the attribute key */
	keyLocation: Location;

	/** Location of the attribute value */
	valueLocation: Location | null;

	/** Attribute metadata if present */
	meta: MetaAttribute | null;
}

/**
 * Event emitted when whitespace content is parsed.
 *
 * @public
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
 *
 * @public
 */
export interface ConditionalEvent extends Event {
	/** Event location. */
	location: Location;

	/** Condition including markers. */
	condition: string;

	/** The element containing the conditional, if any. */
	parent: HtmlElement | null;
}

/**
 * Event emitted when html-validate directives `<!-- [html-validate-...] -->`
 * are encountered.
 *
 * @public
 */
export interface DirectiveEvent extends Event {
	/** Event location. */
	location: Location;

	/** Action location */
	actionLocation: Location;

	/** Options location */
	optionsLocation?: Location;

	/** Comment location */
	commentLocation?: Location;

	/** Directive action. */
	action: "enable" | "disable" | "disable-block" | "disable-next";

	/** Directive options. */
	data: string;

	/** Directive comment. */
	comment: string;
}

/**
 * Event emitted when doctypes `<!DOCTYPE ..>` are encountered.
 *
 * @public
 */
export interface DoctypeEvent extends Event {
	/** Event location. */
	location: Location;

	/** Tag */
	tag: string;

	/** Selected doctype */
	value: string;

	/** Location of doctype value */
	valueLocation: Location;
}

/**
 * Event emitted after initialization but before tokenization and parsing occurs.
 * Can be used to initialize state in rules.
 *
 * @public
 */
export interface DOMLoadEvent extends Event {
	source: Source;
}

/**
 * Event emitted when DOM tree is fully constructed.
 *
 * @public
 */
export interface DOMReadyEvent extends Event {
	/** DOM Tree */
	document: DOMTree;
	source: Source;
}

/**
 * Event emitted when a rule triggers an error.
 *
 * @internal
 */
export interface RuleErrorEvent extends Event {
	ruleId: string;

	/** whenever the rule was enabled or not (i.e. if a user will see the error or not) */
	enabled: boolean;

	/** list of rule blockers active when this rule triggered an event */
	blockers: RuleBlocker[];
}

/**
 * Event emitted right before the parser begins parsing markup.
 *
 * @internal
 */
export interface ParseBeginEvent extends Event {
	location: null;
}

/**
 * Event emitted right after the parser finishes parsing markup.
 *
 * @internal
 */
export interface ParseEndEvent extends Event {
	location: null;
}

/**
 * @public
 */
export interface TriggerEventMap {
	"config:ready": ConfigReadyEvent;
	"source:ready": SourceReadyEvent;

	/** @internal */
	token: TokenEvent;

	"tag:start": TagStartEvent;
	"tag:end": TagEndEvent;
	"tag:ready": TagReadyEvent;
	"element:ready": ElementReadyEvent;
	"dom:load": DOMLoadEvent;
	"dom:ready": DOMReadyEvent;
	doctype: DoctypeEvent;
	attr: AttributeEvent;
	whitespace: WhitespaceEvent;
	conditional: ConditionalEvent;
	directive: DirectiveEvent;

	/** @internal */
	"rule:error": RuleErrorEvent;

	/** @internal */
	"parse:begin": ParseBeginEvent;

	/** @internal */
	"parse:end": ParseEndEvent;
}

/**
 * @public
 */
export interface ListenEventMap {
	"config:ready": ConfigReadyEvent;
	"source:ready": SourceReadyEvent;

	/** @internal */
	token: TokenEvent;

	"tag:open": TagOpenEvent;
	"tag:start": TagStartEvent;
	"tag:close": TagCloseEvent;
	"tag:end": TagEndEvent;
	"tag:ready": TagReadyEvent;
	"element:ready": ElementReadyEvent;
	"dom:load": DOMLoadEvent;
	"dom:ready": DOMReadyEvent;
	doctype: DoctypeEvent;
	attr: AttributeEvent;
	whitespace: WhitespaceEvent;
	conditional: ConditionalEvent;
	directive: DirectiveEvent;

	/** @internal */
	"rule:error": RuleErrorEvent;

	/** @internal */
	"parse:begin": ParseBeginEvent;

	/** @internal */
	"parse:end": ParseEndEvent;

	"*": Event;
}
