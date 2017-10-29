import { DOMNode } from 'dom';
import { Location } from './context';

export interface Rule {
	name: string;

	init: (parser: RuleParserProxy, options: any) => void;
}

export type RuleReport = (node: DOMNode, message: string, location?: Location) => void;

export type RuleEventCallback = (event: any, report: RuleReport) => void;

export interface RuleParserProxy {
	on: (event: string, callback: RuleEventCallback) => void;
}
