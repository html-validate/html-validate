import { Rule, RuleReport, RuleParserProxy } from '../rule';
import { DOMReadyEvent } from '../event';

export = {
	name: 'no-dup-id',
	init,
} as Rule;

function init(parser: RuleParserProxy){
	parser.on('dom:ready', (event: DOMReadyEvent, report: RuleReport) => {
		const existing: { [key: string]: boolean } = {};
		const elements = event.document.querySelectorAll('[id]');
		elements.forEach(el => {
			if (el.id in existing){
				report(el, `Duplicate ID "${el.id}"`);
			}
			existing[el.id] = true;
		});
	});
}
