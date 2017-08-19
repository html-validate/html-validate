/* eslint-disable no-unused-vars */
import { Rule, RuleReport, RuleParserProxy } from '../rule';
import { TagCloseEvent } from '../event';
/* eslint-enable no-unused-vars */

export = <Rule> {
	name: 'close-attr',
	init,
};

function init(parser: RuleParserProxy){
	parser.on('tag:close', validate);
}

function validate(event: TagCloseEvent, report: RuleReport){
	/* handle unclosed tags */
	if (typeof event.target === 'undefined'){
		return;
	}

	/* ignore self-closed and void */
	if (event.target.selfClosed || event.target.voidElement){
		return;
	}

	if (Object.keys(event.target.attr).length > 0){
		report(event.target, "Close tags cannot have attributes");
	}
}
