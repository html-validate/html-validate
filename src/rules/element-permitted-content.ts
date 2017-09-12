import { Rule, RuleReport, RuleParserProxy } from '../rule';
import { DOMNode } from '../dom';
import { DOMReadyEvent } from '../event';
import { Validator } from '../meta';

export = {
	name: 'element-permitted-content',
	init,
} as Rule;

function init(parser: RuleParserProxy){
	parser.on('dom:ready', validate);
}

function validate(event: DOMReadyEvent, report: RuleReport){
	const doc = event.document;
	doc.visitDepthFirst((node: DOMNode) => {
		/* dont verify root element, assume any element is allowed */
		if (node.parent.isRootElement()){
			return;
		}

		/* if parent doesn't have metadata (unknown element) skip checking permitted
		 * content */
		if (!node.parent.meta){
			return;
		}

		const parent = node.parent;
		const rules = parent.meta.permittedContent;

		validatePermittedContent(node);
		validatePermittedDescendant(parent);

		function validatePermittedContent(cur: DOMNode): void {
			if (!Validator.validatePermitted(cur, rules)){
				report(cur, `Element <${cur.tagName}> is not permitted as content in <${parent.tagName}>`);
				return;
			}

			/* for transparent elements all of the children must be validated against
			 * the (this elements) parent, i.e. if this node was removed from the DOM
			 * it should still be valid. */
			if (cur.meta && cur.meta.transparent){
				cur.children.forEach((child: DOMNode) => {
					validatePermittedContent(child);
				});
			}
		}

		function validatePermittedDescendant(cur: DOMNode): void {
			while (!cur.isRootElement()){
				if (cur.meta && !Validator.validatePermitted(node, cur.meta.permittedDescendants)){
					report(node, `Element <${node.tagName}> is not permitted as descendant of <${cur.tagName}>`);
					return;
				}
				cur = cur.parent;
			}
		}
	});
}
