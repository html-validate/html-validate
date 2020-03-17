export interface PermittedGroup {
	exclude?: string | string[];
}

export type PropertyExpression = string | [string, any];
export type PermittedEntry = string | any[] | PermittedGroup;
export type Permitted = PermittedEntry[];

export type PermittedOrder = string[];
export type RequiredAncestors = string[];
export type RequiredContent = string[];

export interface DeprecatedElement {
	message?: string;
	documentation?: string;
	source?: string;
}

export interface MetaAttribute {
	/* if true this attribute can only take boolean values: my-attr, my-attr="" or my-attr="my-attr" */
	boolean?: boolean;

	/* if set this attribute is considered deprecated, set to true or a message */
	deprecated?: boolean | string;

	/* if set it is an exhaustive list of all possible values (as string or regex)
	 * this attribute can have (each token if list is set) */
	enum?: Array<string | RegExp>;

	/* if true this attribute can omit the value */
	omit?: boolean;

	/* if set this attribute is required to be set */
	required?: boolean;
}

export interface PermittedAttribute {
	[key: string]: MetaAttribute;
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
	transparent?: boolean;
	implicitClosed?: string[];
	scriptSupporting?: boolean;
	form?: boolean;

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
	| "form";

/**
 * Properties listed here can be copied (loaded) onto another element using
 * [[HtmlElement.loadMeta]].
 */
export const MetaCopyableProperty = [
	"metadata",
	"flow",
	"sectioning",
	"heading",
	"phrasing",
	"embedded",
	"interactive",
	"transparent",
	"form",
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

	[key: string]:
		| undefined
		| boolean
		| DeprecatedElement
		| PropertyExpression
		| Permitted
		| PermittedOrder
		| PermittedAttribute
		| RequiredAncestors;
}

export interface MetaDataTable {
	[tagName: string]: MetaData;
}

export interface ElementTable {
	[tagName: string]: MetaElement;
}
