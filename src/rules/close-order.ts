import { Rule, RuleReport, RuleParserProxy } from '../rule';
import { TagCloseEvent } from '../event';

export = {
	name: 'close-order',
	init,
} as Rule;

function init(parser: RuleParserProxy){
	parser.on('tag:close', (event: TagCloseEvent, report: RuleReport) => {
		const current = event.target;     // The current element being closed
		const active = event.previous;    // The current active element (that is, the current element on the stack)

		/* handle unclosed tags */
		if (!current){
			report(event.previous, `Missing close-tag, expected '</${active.tagName}>' but document ended before it was found.`);
			return;
		}

		/* void elements are always closed in correct order but if the markup contains
		 * an end-tag for it it should be ignored here since the void element is
		 * implicitly closed in the right order, so the current active element is the
		 * parent. */
		if (current.voidElement){
			return;
		}

		/* handle unopened tags */
		if (!active || active.isRootElement()){
			report(event.previous, "Unexpected close-tag, expected opening tag.");
			return;
		}

		/* check for matching tagnames */
		if (current.tagName !== active.tagName){
			report(event.target, `Mismatched close-tag, expected '</${active.tagName}>' but found '</${current.tagName}>'.`, current.location);
		}
	});
}
