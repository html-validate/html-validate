import { Rule, RuleReport, RuleParserProxy } from '../rule';
import { DOMNode } from '../dom';
import { DOMReadyEvent } from '../event';
import { Validator } from '../meta';

export = {
	name: 'element-permitted-order',
	init,
} as Rule;

function init(parser: RuleParserProxy){
	parser.on('dom:ready', validate);
}

function validate(event: DOMReadyEvent, report: RuleReport){
	const doc = event.document;
	doc.visitDepthFirst((node: DOMNode) => {
		if (!node.meta){
			return;
		}

		const rules = node.meta.permittedOrder;
		Validator.validateOrder(node.children, rules, (child: DOMNode, prev: DOMNode) => {
			report(node, `Element <${child.tagName}> must be used before <${prev.tagName}> in this context`);
		});
	});
}
