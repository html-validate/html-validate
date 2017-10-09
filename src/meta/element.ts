export interface PermittedGroup {
	exclude?: string[];
}

export type PropertyExpression = string | [string, any];
export type PermittedEntry = string | any[] | PermittedGroup;
export type Permitted = PermittedEntry[];

export interface MetaElement {
	tagName: string;
	metadata: boolean | PropertyExpression;
	flow: boolean | PropertyExpression;
	sectioning: boolean | PropertyExpression;
	heading: boolean | PropertyExpression;
	phrasing: boolean | PropertyExpression;
	embedded: boolean | PropertyExpression;
	interactive: boolean | PropertyExpression;
	deprecated: boolean;
	void: boolean;
	transparent: boolean;
	permittedContent: Permitted;
	permittedDescendants: Permitted;

	[key: string]: boolean | PropertyExpression | Permitted;
}

export type ElementTable = { [tagName: string]: MetaElement };
