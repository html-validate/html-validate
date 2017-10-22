import { DOMNode, DOMTree } from 'dom';
import { LocationData } from './lexer';

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

export interface WhitespaceEvent extends Event {
	text: string;
}

export interface DOMReadyEvent extends Event {
	document: DOMTree;
}
