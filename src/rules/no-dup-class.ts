import { Rule, RuleReport, RuleParserProxy } from '../rule';
import { DOMTokenList } from '../dom';
import { AttributeEvent } from '../event';

export = {
	name: 'no-dup-class',
	init,
} as Rule;

function init(parser: RuleParserProxy){
	parser.on('attr', (event: AttributeEvent, report: RuleReport) => {
		if (event.key.toLowerCase() !== 'class'){
			return;
		}

		const classes = new DOMTokenList(event.value);
		const unique: Set<string> = new Set();
		classes.forEach(cur => {
			if (unique.has(cur)) {
				report(event.target, `Class "${cur}" duplicated`, event.location);
			}
			unique.add(cur);
		});
	});
}
