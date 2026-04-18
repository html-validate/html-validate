import { type DynamicValue } from "../dom";
import { type HtmlElementLike } from "./html-element-like";
import { type MetaAria, type MetaImplicitRoleCallback, type NormalizedMetaAria } from "./meta-aria";

/**
 * @public
 */
export interface PermittedGroup {
	exclude?: string | string[];
}

/**
 * @public
 */

export type CategoryOrTag = string;

/**
 * @public
 */
export type PermittedEntry = CategoryOrTag | PermittedGroup | Array<CategoryOrTag | PermittedGroup>;

/**
 * @public
 */
export type Permitted = PermittedEntry[];

/**
 * @public
 */
export type PermittedOrder = string[];

/**
 * @public
 */
export type RequiredAncestors = string[];

/**
 * @public
 */
export type RequiredContent = string[];

/**
 * @public
 */
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
 * Callback for content category properties of `MetaData`. It takes a node and
 * returns whenever the element belongs to the content group or not.
 *
 * @public
 * @since 8.13.0
 * @param node - The node to determine if it belongs in the content category.
 * @returns `true` if the node belongs to the category.
 */
export type MetaCategoryCallback = (node: HtmlElementLike) => boolean;

/**
 * Callback for the `focusable` property of `MetaData`. It takes a node and
 * returns whenever the element is focusable or not.
 *
 * @public
 * @since 8.9.0
 * @param node - The node to determine if it is focusable.
 * @returns `true` if the node is focusable.
 */
export type MetaFocusableCallback = (node: HtmlElementLike) => boolean;

/**
 * Callback for the `labelable` properties of `MetaData`. It takes a node and
 * returns whenever the element is labelable or not.
 *
 * @public
 * @since 8.29.0
 * @param node - The node to determine if it is labelable.
 * @returns `true` if the node is labelable.
 */
export type MetaLabelableCallback = (node: HtmlElementLike) => boolean;

/**
 * Callback for the `submitButton` property of `MetaData`. It takes a node and
 * returns whenever the element is a submit button or not.
 *
 * @public
 * @since 10.10.0
 * @param node - The node to determine if it is a submit button.
 * @returns `true` if the node is a submit button.
 */
export type MetaSubmitButtonCallback = (node: HtmlElementLike) => boolean;

/**
 * Callback for the `allowed` property of `MetaAttribute`. It takes a node and
 * should return `null` if there is no errors and a string with an error
 * description if there is an error.
 *
 * @public
 * @param node - The node the attribute belongs to.
 * @param attr - The current attribute value being validated.
 */
export type MetaAttributeAllowedCallback = (
	node: HtmlElementLike,
	attr: string | DynamicValue | null | undefined,
) => string | null | undefined;

/**
 * Callback for the `required` property of `MetaAttribute`.
 *
 * The return value should be truthy if the attribute is required or falsey if
 * not. If the return value is a non-empty string it replaces the default
 * "missing required attribute" error message.
 *
 * @public
 * @since 10.4.0
 * @param node - The node the attribute belongs to.
 */
export type MetaAttributeRequiredCallback = (
	node: HtmlElementLike,
) => string | boolean | null | undefined;

/**
 * @public
 */
export interface MetaAttribute {
	/**
	 * If set it should be a function evaluating to an error message or `null` if
	 * the attribute is allowed.
	 */
	allowed?: MetaAttributeAllowedCallback;

	/**
	 * If true this attribute can only take boolean values: `my-attr`, `my-attr="`
	 * or `my-attr="my-attr"`.
	 */
	boolean?: boolean;

	/**
	 * If set this attribute is considered deprecated, set to `true` or a string
	 * with more descriptive message.
	 */
	deprecated?: boolean | string;

	/**
	 * If set it is an exhaustive list of all possible values (as `string` or
	 * `RegExp`) this attribute can have (each token if list is set)
	 */
	enum?: Array<string | RegExp>;

	/**
	 * If `true` this attribute contains space-separated tokens and each token must
	 * be valid by itself.
	 */
	list?: boolean;

	/**
	 * If `true` this attribute can omit the value.
	 */
	omit?: boolean;

	/**
	 * If set this attribute is required to be present on the element.
	 */
	required?: boolean | MetaAttributeRequiredCallback;
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

/**
 * @public
 */
export type PermittedAttribute = Record<string, MetaAttribute | Array<string | RegExp> | null>;

/**
 * @public
 */
export interface DeprecatedElement {
	message?: string;
	documentation?: string;
	source?: string;
}

/**
 * @public
 */
export interface FormAssociated {
	/** This element can be disabled using the `disabled` attribute */
	disablable: boolean;

	/** Listed elements have a name attribute and is listed in the form and fieldset elements property. */
	listed: boolean;
}

/**
 * Describes a single implicit-open rule for a parent element.
 *
 * When a child element matching one of the `for` selectors would be inserted
 * directly under the parent but is not permitted there, the element named by
 * `open` is implicitly opened first, making it the new insertion point.
 *
 * Selectors may be explicit tag names (e.g., `title`) or content-category
 * shorthand strings prefixed with `@` (e.g., `@meta`, `@flow`).
 *
 * @public
 */
export interface ImplicitOpenEntry {
	/** Tags or `@category` selectors that trigger the implicit open. */
	for: string[];
	/** Tag name of the element to implicitly open. */
	open: string;
}

/**
 * @public
 */
export interface MetaData {
	/* special keyword to extend metadata from another entry */
	inherit?: string;

	/* content categories */
	metadata?: boolean | MetaCategoryCallback;
	flow?: boolean | MetaCategoryCallback;
	sectioning?: boolean | MetaCategoryCallback;
	heading?: boolean | MetaCategoryCallback;
	phrasing?: boolean | MetaCategoryCallback;
	embedded?: boolean | MetaCategoryCallback;
	interactive?: boolean | MetaCategoryCallback;

	/* element properties */
	deprecated?: boolean | string | DeprecatedElement;
	foreign?: boolean;
	void?: boolean;
	transparent?: boolean | string[];
	implicitClosed?: string[];
	/**
	 * Set to `true` if this element’s end tag is optional per the HTML spec.
	 * Such an element is treated as implicitly closed in two situations:
	 * - When the document ends with this element still open (EOF).
	 * - When a parent’s explicit end tag is encountered while this element is
	 *   still open (e.g. `</html>` implicitly closing an open `<body>`).
	 */
	optionalEnd?: boolean;
	/**
	 * Describes elements that should be implicitly opened when a child element
	 * that would otherwise be inserted directly under this element matches one of
	 * the given selectors but is not permitted here.
	 *
	 * This handles the HTML5 optional start-tag algorithm for `<head>` and
	 * `<body>`: when a metadata element arrives directly under `<html>`, the
	 * parser implicitly opens `<head>`; when a flow element arrives, it implicitly
	 * opens `<body>` (first closing any open `<head>`).
	 */
	implicitOpen?: ImplicitOpenEntry[];
	scriptSupporting?: boolean;
	/** Mark element as able to receive focus (without explicit `tabindex`) */
	focusable?: boolean | MetaFocusableCallback;
	form?: boolean;
	/** Mark element as a form-associated element */
	formAssociated?: Partial<FormAssociated>;
	labelable?: boolean | MetaLabelableCallback;

	/** Mark element as a submit button (i.e. it will submit the form it belongs to) */
	submitButton?: boolean | MetaSubmitButtonCallback;

	/**
	 * Set to `true` if this element should have no impact on DOM
	 * ancestry. Default `false`.
	 *
	 * I.e., the `<template>` element (where allowed) can contain anything, as it
	 * does not directly affect the DOM tree.
	 */
	templateRoot?: boolean;

	/** @deprecated use {@link MetaAria.implicitRole} instead */
	implicitRole?: MetaImplicitRoleCallback;

	/** WAI-ARIA attributes */
	aria?: MetaAria;

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
 *
 * @public
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
	| "focusable"
	| "form"
	| "formAssociated"
	| "labelable"
	| "submitButton";

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
	"focusable",
	"form",
	"formAssociated",
	"labelable",
	"submitButton",
	"attributes",
	"aria",
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

	focusable: boolean | MetaFocusableCallback;
	formAssociated?: FormAssociated;

	/**
	 * Set to `true` if this element should have no impact on DOM
	 * ancestry. Default `false`.
	 *
	 * I.e., the `<template>` element (where allowed) can contain anything. as it
	 * does not directly affect the DOM tree.
	 */
	templateRoot: boolean;

	/** @deprecated Use {@link MetaAria.implicitRole} instead */
	implicitRole: MetaImplicitRoleCallback;

	/** WAI-ARIA attributes */
	aria: NormalizedMetaAria;

	attributes: Record<string, MetaAttribute>;
	textContent?: TextContent;
}

/**
 * @public
 */
export type MetaDataTable = Record<string, MetaData>;

/**
 * @internal
 */
export type ElementTable = Record<string, MetaElement>;

/**
 * @internal
 */
export function setMetaProperty<T extends keyof MetaElement>(
	dst: MetaElement,
	key: T,
	value: MetaElement[T],
): void {
	dst[key] = value;
}
