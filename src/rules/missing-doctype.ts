import { Rule, RuleReport, RuleParserProxy } from '../rule';
import { DOMReadyEvent } from '../event';

export = {
	name: 'missing-doctype',
	init,
} as Rule;

function init(parser: RuleParserProxy){
	parser.on('dom:ready', validate);
}

function validate(event: DOMReadyEvent, report: RuleReport){
	const dom = event.document;

	if (!dom.doctype){
		report(dom.root, `Document is missing doctype`);
	}
}
