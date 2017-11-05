import { Rule, RuleReport, RuleParserProxy } from '../rule';
import { ConditionalEvent } from '../event';

export = {
	name: 'no-conditional-comment',
	init,
} as Rule;

function init(parser: RuleParserProxy){
	parser.on('conditional', (event: ConditionalEvent, report: RuleReport) => {
		report(null, `Use of conditional comments are deprecated`, event.location);
	});
}
