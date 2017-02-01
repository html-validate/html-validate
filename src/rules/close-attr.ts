import { Rule, RuleParserProxy } from '../rule'; // eslint-disable-line no-unused-vars
import { TagCloseEvent } from '../event'; // eslint-disable-line no-unused-vars

export = <Rule> {
	name: 'close-attr',
	init,
};

function init(parser: RuleParserProxy){
	parser.on('tag:close', validate);
}

function validate(event: TagCloseEvent, report){
	/* handle unclosed tags */
	if ( typeof(event.target) === 'undefined' ){
		return;
	}

	/* ignore self-closed and void */
	if ( event.target.selfClosed || event.target.voidElement ){
		return;
	}

	if ( Object.keys(event.target.attr).length > 0 ){
		report(event.target, "Close tags cannot have attributes");
	}
}
