import { Rule } from '../rule';
import { DOMNode } from '../dom';
import { DOMReadyEvent } from '../event';
import { Validator } from '../meta';

class ElementPermittedOrder extends Rule {
	setup(){
		this.on('dom:ready', (event: DOMReadyEvent) => {
			const doc = event.document;
			doc.visitDepthFirst((node: DOMNode) => {
				if (!node.meta){
					return;
				}

				const rules = node.meta.permittedOrder;
				Validator.validateOrder(node.children, rules, (child: DOMNode, prev: DOMNode) => {
					this.report(node, `Element <${child.tagName}> must be used before <${prev.tagName}> in this context`);
				});
			});
		});
	}
}

module.exports = ElementPermittedOrder;
