import { Rule, RuleReport, RuleParserProxy } from '../rule';
import { TagCloseEvent } from '../event';
import { NodeClosed } from '../dom';

export = {
	name: 'no-implicit-close',
	init,
} as Rule;

function init(parser: RuleParserProxy){
	parser.on('tag:close', (event: TagCloseEvent, report: RuleReport) => {
		const closed = event.previous;
		const by = event.target;

		if (closed.closed !== NodeClosed.ImplicitClosed){
			return;
		}

		if (!by){
			return;
		}

		/* determine if it was closed by parent or sibling */
		const closedByParent = closed.parent.tagName === by.tagName;

		if (closedByParent){
			report(closed, `Element <${closed.tagName}> is implicitly closed by parent </${by.tagName}>`, closed.location);
		} else {
			report(closed, `Element <${closed.tagName}> is implicitly closed by sibling`, closed.location);
		}
	});
}
