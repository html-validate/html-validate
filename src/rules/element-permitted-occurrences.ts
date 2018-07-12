import { Rule } from '../rule';
import { DOMNode } from '../dom';
import { DOMReadyEvent } from '../event';
import { Validator } from '../meta';

class ElementPermittedOccurrences extends Rule {
	setup(){
		this.on('dom:ready', (event: DOMReadyEvent) => {
			const doc = event.document;
			doc.visitDepthFirst((node: DOMNode) => {
				const parent = node.parent;

				if (!parent.meta){
					return;
				}

				const rules = parent.meta.permittedContent;
				const numSiblings = parent.children.filter(cur => cur.tagName === node.tagName).length;

				if (parent.meta && !Validator.validateOccurrences(node, rules, numSiblings)){
					this.report(node, `Element <${node.tagName}> can only appear once under <${parent.tagName}>`);
				}
			});
		});
	}
}

module.exports = ElementPermittedOccurrences;
