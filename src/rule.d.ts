/* eslint-disable no-unused-vars */
import { DOMNode } from 'dom';
import { LocationData } from './context';
/* eslint-enable no-unused-vars */

export interface Rule {
	name: string;

	init: (parser: RuleParserProxy, options: any) => void;
}

export type RuleReport = (node: DOMNode, message: string, location?: LocationData) => void;

export type RuleEventCallback = (event: any, report: RuleReport) => void;

export interface RuleParserProxy {
	on: (event: string, callback: RuleEventCallback) => void;
}
