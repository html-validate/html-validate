import { Rule, RuleReport, RuleParserProxy } from '../rule';
import { TagOpenEvent } from '../event';

export = {
	name: 'deprecated',
	init,
} as Rule;

function init(parser: RuleParserProxy){
	parser.on('tag:open', (event: TagOpenEvent, report: RuleReport) => {
		const node = event.target;

		/* cannot validate if meta isn't known */
		if (node.meta === null){
			return;
		}

		if (node.meta.deprecated){
			report(node, `<${node.tagName}> is deprecated`);
		}
	});
}
