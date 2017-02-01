import DOMNode from './domnode';

export interface TagOpenEvent {
	event: string;
	target: DOMNode;
}

export interface TagCloseEvent {
	event: string;
	target: DOMNode;
	previous: DOMNode;
}

export interface AttributeEvent {
	event: string;
	key: string;
	value: any;
	quote: '"' | "'" | undefined;
	target: DOMNode;
}
