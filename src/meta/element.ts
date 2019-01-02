export interface PermittedGroup {
	exclude?: string[];
}

export type PropertyExpression = string | [string, any];
export type PermittedEntry = string | any[] | PermittedGroup;
export type Permitted = PermittedEntry[];

export type PermittedOrder = string[];

export interface PermittedAttribute {
	[key: string]: Array<string | RegExp>;
}

export interface MetaElement {
	/* filled internally for reverse lookup */
	tagName: string;

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
	void: boolean;
	transparent: boolean;
	implicitClosed: string[];

	/* permitted data */
	attributes: PermittedAttribute;
	deprecatedAttributes: string[];
	permittedContent: Permitted;
	permittedDescendants: Permitted;
	permittedOrder: PermittedOrder;

	[key: string]:
		| boolean
		| PropertyExpression
		| Permitted
		| PermittedOrder
		| PermittedAttribute;
}

export interface ElementTable {
	[tagName: string]: MetaElement;
}
