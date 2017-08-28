import { Rule, RuleReport, RuleParserProxy } from '../rule';
import { WhitespaceEvent } from '../event';

export = {
	name: 'no-trailing-whitespace',
	init,
} as Rule;

function init(parser: RuleParserProxy){
	parser.on('whitespace', validate);
}

function validate(event: WhitespaceEvent, report: RuleReport){
	if (event.text.match(/^[ \t]+\n$/)){
		report(undefined, "Trailing whitespace", event.location);
	}
}
