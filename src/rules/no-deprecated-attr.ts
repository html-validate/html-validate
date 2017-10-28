import { Rule, RuleReport, RuleParserProxy } from '../rule';
import { AttributeEvent } from '../event';

export = {
	name: 'no-deprecated-attr',
	init,
} as Rule;

function init(parser: RuleParserProxy){
	parser.on('attr', (event: AttributeEvent, report: RuleReport) => {
		const node = event.target;
		const meta = node.meta;
		const attr = event.key.toLowerCase();

		/* cannot validate if meta isn't known */
		if (meta === null){
			return;
		}

		if (meta.deprecatedAttributes.indexOf(attr) >= 0){
			report(node, `Attribute "${event.key}" is deprecated on <${node.tagName}> element`);
		}
	});
}
