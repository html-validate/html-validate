import { Rule, RuleParserProxy } from '../rule'; // eslint-disable-line no-unused-vars
import { TagCloseEvent } from '../event'; // eslint-disable-line no-unused-vars

export = <Rule> {
	name: 'close-order',
	init,
};

function init(parser: RuleParserProxy){
	parser.on('tag:close', validate);
}

function validate(event: TagCloseEvent, report){
	/* handle unclosed tags */
	if ( typeof(event.target) === 'undefined' ){
		report(event.previous, "Missing close-tag, expected '</" + event.previous.tagName + ">' but document ended before it was found.");
		return;
	}

	/* handle unopened tags */
	if ( typeof(event.previous) === 'undefined' ){
		report(event.previous, "Unexpected close-tag, expected opening tag.");
		return;
	}

	/* self-closing elements are always closed in correct order */
	if ( event.target.selfClosed || event.target.voidElement ){
		return;
	}

	/* check for matching tagnames */
	if ( event.target.tagName !== event.previous.tagName ){
		report(event.target, "Mismatched close-tag, expected '</" + event.previous.tagName + ">' but found '</" + event.target.tagName + ">'.", event.target.location);
	}
}
