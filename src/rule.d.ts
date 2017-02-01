import DOMNode from './domnode'; // eslint-disable-line no-unused-vars

export interface Rule {
	name: string;

	init: (parser: RuleParserProxy, options: any) => void;
}

export interface RuleParserProxy {
	on: (event: string, callback) => void;
}
