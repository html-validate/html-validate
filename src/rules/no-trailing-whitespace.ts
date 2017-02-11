/* eslint-disable no-unused-vars */
import { Rule, RuleReport, RuleParserProxy } from '../rule';
import { WhitespaceEvent } from '../event';
/* eslint-enable no-unused-vars */

export = <Rule> {
	name: 'no-trailing-whitespace',
	init,
};

function init(parser: RuleParserProxy){
	parser.on('whitespace', validate);
}

function validate(event: WhitespaceEvent, report: RuleReport){
	if ( event.text.match(/^[ \t]+\n$/) ){
		report(undefined, "Trailing whitespace", event.location);
	}
}
