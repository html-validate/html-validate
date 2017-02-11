import DOMNode from './domnode';
import DOMTree from './domtree';
import { LocationData } from './context';

export interface Event {
	event: string;
	location: LocationData;
}

export interface TagOpenEvent extends Event {
	target: DOMNode;
}

export interface TagCloseEvent extends Event {
	target: DOMNode;
	previous: DOMNode;
}

export interface AttributeEvent extends Event {
	key: string;
	value: any;
	quote: '"' | "'" | undefined;
	target: DOMNode;
}

export interface DOMReadyEvent extends Event {
	document: DOMTree;
}
