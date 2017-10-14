import { Rule, RuleReport, RuleParserProxy } from '../rule';
import { DOMNode } from '../dom';
import { DOMReadyEvent } from '../event';
import { Validator } from '../meta';

export = {
	name: 'element-permitted-occurrences',
	init,
} as Rule;

function init(parser: RuleParserProxy){
	parser.on('dom:ready', validate);
}

function validate(event: DOMReadyEvent, report: RuleReport){
	const doc = event.document;
	doc.visitDepthFirst((node: DOMNode) => {
		const parent = node.parent;

		if (!parent.meta){
			return;
		}

		const rules = parent.meta.permittedContent;
		const numSiblings = parent.children.filter(cur => cur.tagName === node.tagName).length;

		if (parent.meta && !Validator.validateOccurrences(node, rules, numSiblings)){
			report(node, `Element <${node.tagName}> can only appear once under <${parent.tagName}>`);
		}
	});
}
