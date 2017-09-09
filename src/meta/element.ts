export type PropertyExpression = string | [string, any];

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

	[key: string]: boolean | PropertyExpression;
}

export type ElementTable = { [tagName: string]: MetaElement };
