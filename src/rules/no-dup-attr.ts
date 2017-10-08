import { Rule, RuleReport, RuleParserProxy } from '../rule';
import { AttributeEvent } from '../event';

export = {
	name: 'no-dup-attr',
	init,
} as Rule;

function init(parser: RuleParserProxy){
	let attr: { [key: string]: boolean } = {};

	parser.on('tag:open', () => {
		/* reset any time a new tag is opened */
		attr = {};
	});

	parser.on('attr', (event: AttributeEvent, report: RuleReport) => {
		const name = event.key.toLowerCase();
		if (name in attr){
			report(event.target, `Attribute "${name}" duplicated`);
		}
		attr[event.key] = true;
	});
}
