export interface MetaElement {
	tagName: string;
	metadata: boolean;
	flow: boolean;
	sectioning: boolean;
	heading: boolean;
	phrasing: boolean;
	embedded: boolean;
	interactive: boolean;
	deprecated: boolean;
	void: boolean;
}

export type ElementTable = { [tagName: string]: MetaElement };
