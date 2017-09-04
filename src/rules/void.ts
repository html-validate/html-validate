import { Rule, RuleReport, RuleParserProxy } from '../rule';
import { TagOpenEvent } from '../event';

export = {
	name: 'void',
	init,
} as Rule;

function init(parser: RuleParserProxy){
	parser.on('tag:open', (event: TagOpenEvent, report: RuleReport) => {
		const node = event.target;

		/* cannot validate if meta isn't known */
		if (node.meta === null){
			return;
		}

		if (node.voidElement && node.selfClosed === false){
			report(node, `End tag for <${node.tagName}> must be omitted`);
		}

		if (node.selfClosed && node.voidElement === false){
			report(node, `End tag for <${node.tagName}> must not be omitted`);
		}
	});
}
