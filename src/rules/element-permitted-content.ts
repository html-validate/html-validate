import { Rule } from '../rule';
import { DOMNode } from '../dom';
import { DOMReadyEvent } from '../event';
import { Validator } from '../meta';
import { Permitted } from '../meta/element';

class ElementPermittedContent extends Rule {
	setup(){
		this.on('dom:ready', (event: DOMReadyEvent) => {
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

				this.validatePermittedContent(node, parent, rules);
				this.validatePermittedDescendant(node, parent);
			});
		});
	}

	validatePermittedContent(cur: DOMNode, parent: DOMNode, rules: Permitted): void {
		if (!Validator.validatePermitted(cur, rules)){
			this.report(cur, `Element <${cur.tagName}> is not permitted as content in <${parent.tagName}>`);
			return;
		}

		/* for transparent elements all of the children must be validated against
		 * the (this elements) parent, i.e. if this node was removed from the DOM it
		 * should still be valid. */
		if (cur.meta && cur.meta.transparent){
			cur.children.forEach((child: DOMNode) => {
				this.validatePermittedContent(child, parent, rules);
			});
		}
	}

	validatePermittedDescendant(node: DOMNode, parent: DOMNode): void {
		while (!parent.isRootElement()){
			if (parent.meta && node.meta && !Validator.validatePermitted(node, parent.meta.permittedDescendants)){
				this.report(node, `Element <${node.tagName}> is not permitted as descendant of <${parent.tagName}>`);
				return;
			}
			parent = parent.parent;
		}
	}
}

module.exports = ElementPermittedContent;
