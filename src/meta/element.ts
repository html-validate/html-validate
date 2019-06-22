export interface PermittedGroup {
	exclude?: string | string[];
}

export type PropertyExpression = string | [string, any];
export type PermittedEntry = string | any[] | PermittedGroup;
export type Permitted = PermittedEntry[];

export type PermittedOrder = string[];
export type RequiredAncestors = string[];

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

	/* attribute */
	deprecatedAttributes?: string[];
	requiredAttributes?: string[];
	attributes?: PermittedAttribute;

	/* permitted data */
	permittedContent?: Permitted;
	permittedDescendants?: Permitted;
	permittedOrder?: PermittedOrder;
	requiredAncestors?: RequiredAncestors;
}

export interface MetaElement extends MetaData {
	/* filled internally for reverse lookup */
	tagName: string;

	[key: string]:
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
