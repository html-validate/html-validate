import { Rule, RuleReport, RuleParserProxy } from '../rule';
import { AttributeEvent } from '../event';

export = {
	name: 'no-inline-style',
	init,
} as Rule;

function init(parser: RuleParserProxy){
	parser.on('attr', (event: AttributeEvent, report: RuleReport) => {
		if (event.key === 'style'){
			report(event.target, "Inline style is not allowed");
		}
	});
}
