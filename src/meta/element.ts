export interface PermittedGroup {
	exclude?: string | string[];
}

export type PropertyExpression = string | [string, any];
export type PermittedEntry = string | any[] | PermittedGroup;
export type Permitted = PermittedEntry[];

export type PermittedOrder = string[];
export type RequiredAncestors = string[];
export type RequiredContent = string[];

export interface PermittedAttribute {
	[key: string]: Array<string | RegExp>;
}

export interface MetaData {
	/* content categories */
	metadata: boolean | PropertyExpression;
	flow: boolean | PropertyExpression;
	sectioning: boolean | PropertyExpression;
	heading: boolean | PropertyExpression;
	phrasing: boolean | PropertyExpression;
	embedded: boolean | PropertyExpression;
	interactive: boolean | PropertyExpression;

	/* element properties */
	deprecated: boolean | string;
	foreign: boolean;
	void: boolean;
	transparent: boolean;
	implicitClosed?: string[];
	scriptSupporting: boolean;
	form: boolean;

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

export interface MetaElement extends MetaData {
	/* filled internally for reverse lookup */
	tagName: string;

	[key: string]:
		| undefined
		| boolean
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
