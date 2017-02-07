import DOMNode from './domnode';
import DOMTree from './domtree';

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

export interface DOMReadyEvent {
	event: string;
	document: DOMTree;
}
