export interface PermittedGroup {
	exclude?: string | string[];
}

export type PropertyExpression = string | [string, any];
export type PermittedEntry = string | any[] | PermittedGroup;
export type Permitted = PermittedEntry[];

export type PermittedOrder = string[];
export type RequiredAncestors = string[];
export type RequiredContent = string[];

export enum TextContent {
	/* forbid node to have text content, inter-element whitespace is ignored */
	NONE = "none",

	/* node can have text but not required too */
	DEFAULT = "default",

	/* node requires text-nodes to be present (direct or by descendant) */
	REQUIRED = "required",

	/* node requires accessible text (hidden text is ignored, tries to get text from accessibility tree) */
	ACCESSIBLE = "accessible",
}

export interface PermittedAttribute {
	[key: string]: Array<string | RegExp>;
}

export interface DeprecatedElement {
	message?: string;
	documentation?: string;
	source?: string;
}

export interface MetaData {
	/* special keyword to extend metadata from another entry */
	inherit?: string;

	/* content categories */
	metadata?: boolean | PropertyExpression;
	flow?: boolean | PropertyExpression;
	sectioning?: boolean | PropertyExpression;
	heading?: boolean | PropertyExpression;
	phrasing?: boolean | PropertyExpression;
	embedded?: boolean | PropertyExpression;
	interactive?: boolean | PropertyExpression;

	/* element properties */
	deprecated?: boolean | string | DeprecatedElement;
	foreign?: boolean;
	void?: boolean;
	transparent?: boolean | string[];
	implicitClosed?: string[];
	scriptSupporting?: boolean;
	form?: boolean;
	labelable?: boolean | PropertyExpression;

	/* attribute */
	deprecatedAttributes?: string[];
	requiredAttributes?: string[];
	attributes?: PermittedAttribute;

	/* permitted data */
	permittedContent?: Permitted;
	permittedDescendants?: Permitted;
	permittedOrder?: PermittedOrder;
	requiredAncestors?: RequiredAncestors;
	requiredContent?: RequiredContent;
	textContent?: TextContent;
}

/**
 * Properties listed here can be used to reverse search elements with the given
 * property enabled. See [[MetaTable.getTagsWithProperty]].
 */
export type MetaLookupableProperty =
	| "metadata"
	| "flow"
	| "sectioning"
	| "heading"
	| "phrasing"
	| "embedded"
	| "interactive"
	| "deprecated"
	| "foreign"
	| "void"
	| "transparent"
	| "scriptSupporting"
	| "form"
	| "labelable";

/**
 * Properties listed here can be copied (loaded) onto another element using
 * [[HtmlElement.loadMeta]].
 */
export const MetaCopyableProperty: Array<keyof MetaElement> = [
	"metadata",
	"flow",
	"sectioning",
	"heading",
	"phrasing",
	"embedded",
	"interactive",
	"transparent",
	"form",
	"labelable",
	"requiredAttributes",
	"attributes",
	"permittedContent",
	"permittedDescendants",
	"permittedOrder",
	"requiredAncestors",
	"requiredContent",
];

export interface MetaElement extends MetaData {
	/* filled internally for reverse lookup */
	tagName: string;
}

export interface MetaDataTable {
	[tagName: string]: MetaData;
}

export interface ElementTable {
	[tagName: string]: MetaElement;
}

/**
 * @internal
 */
export function setMetaProperty<T extends keyof MetaElement>(
	dst: MetaElement,
	key: T,
	value: MetaElement[T]
): void {
	dst[key] = value;
}
