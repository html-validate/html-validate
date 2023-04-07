import { type Attribute, type HtmlElement } from "../dom";

export interface PermittedGroup {
	exclude?: string | string[];
}

export type CategoryOrTag = string;
export type PropertyExpression = string | [string, any];
export type PermittedEntry = CategoryOrTag | PermittedGroup | Array<CategoryOrTag | PermittedGroup>;
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

/**
 * Callback for the `allowed` property of `MetaAttribute`. It takes a node and
 * should return `null` if there is no errors and a string with an error
 * description if there is an error.
 *
 * @public
 * @param node - The node the attribute belongs to.
 * @param attr - The current attribute being validated.
 */
export type MetaAttributeAllowedCallback = (
	node: HtmlElement,
	attr: Attribute
) => string | null | undefined;

/**
 * @public
 */
export interface MetaAttribute {
	/* If set it should be a function evaluating to an error message or null if
	 * the attribute is allowed */
	allowed?: MetaAttributeAllowedCallback;

	/* if true this attribute can only take boolean values: my-attr, my-attr="" or my-attr="my-attr" */
	boolean?: boolean;

	/* if set this attribute is considered deprecated, set to true or a message */
	deprecated?: boolean | string;

	/* if set it is an exhaustive list of all possible values (as string or regex)
	 * this attribute can have (each token if list is set) */
	enum?: Array<string | RegExp>;

	/* if true this attribute contains space-separated tokens and each token must
	 * be valid by itself */
	list?: boolean;

	/* if true this attribute can omit the value */
	omit?: boolean;

	/* if set this attribute is required to be set */
	required?: boolean;
}

/**
 * Internal flags used during configuration loading.
 *
 * @internal
 */
export interface InternalAttributeFlags {
	/* set to true if attribute is marked for deletion */
	delete?: true;
}

export type PermittedAttribute = Record<string, MetaAttribute | Array<string | RegExp> | null>;

export interface DeprecatedElement {
	message?: string;
	documentation?: string;
	source?: string;
}

export interface FormAssociated {
	/** Listed elements have a name attribute and is listed in the form and fieldset elements property. */
	listed: boolean;
}

/**
 * @public
 */
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
	/** Mark element as a form-associated element */
	formAssociated?: Partial<FormAssociated>;
	labelable?: boolean | PropertyExpression;

	/* attribute */
	deprecatedAttributes?: string[];
	requiredAttributes?: string[];
	attributes?: PermittedAttribute;

	/* permitted data */
	permittedContent?: Permitted;
	permittedDescendants?: Permitted;
	permittedOrder?: PermittedOrder;
	permittedParent?: Permitted;
	requiredAncestors?: RequiredAncestors;
	requiredContent?: RequiredContent;
	textContent?: TextContent | `${TextContent}`;
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
	| "formAssociated"
	| "labelable";

/**
 * Properties listed here can be copied (loaded) onto another element using
 * [[HtmlElement.loadMeta]].
 *
 * @public
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
	"formAssociated",
	"labelable",
	"attributes",
	"permittedContent",
	"permittedDescendants",
	"permittedOrder",
	"permittedParent",
	"requiredAncestors",
	"requiredContent",
];

/**
 * @public
 */
export interface MetaElement extends Omit<MetaData, "deprecatedAttributes" | "requiredAttributes"> {
	/* filled internally for reverse lookup */
	tagName: string;

	formAssociated?: FormAssociated;

	attributes: Record<string, MetaAttribute>;
	textContent?: TextContent;
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
