import { Rule, RuleReport, RuleParserProxy } from '../rule';
import { TagCloseEvent } from '../event';
import { NodeClosed } from '../dom';

export = {
	name: 'void',
	init,
} as Rule;

function init(parser: RuleParserProxy){
	parser.on('tag:close', (event: TagCloseEvent, report: RuleReport) => {
		const node = event.previous;

		/* cannot validate if meta isn't known */
		if (node.meta === null){
			return;
		}

		const selfOrOmitted = node.closed === NodeClosed.Omitted || node.closed === NodeClosed.Self;

		if (node.voidElement && selfOrOmitted === false){
			report(node, `End tag for <${node.tagName}> must be omitted`);
		}

		if (selfOrOmitted && node.voidElement === false){
			report(node, `End tag for <${node.tagName}> must not be omitted`);
		}
	});
}
