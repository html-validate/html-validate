import { DOMNode, DOMTree } from 'dom';
import { Rule } from '../rule';
import { DOMReadyEvent } from '../event';

class InputMissingLabel extends Rule {
	setup(){
		this.on('dom:ready', (event: DOMReadyEvent) => {
			const root = event.document;
			for (const elem of root.getElementsByTagName('input')){

				/* try to find label by id */
				if (findLabelById(root, elem.id)){
					continue;
				}

				/* try to find parent label (input nested in label) */
				if (findLabelByParent(elem)){
					continue;
				}

				this.report(elem, 'Input element does not have a label');
			}
		});
	}
}

function findLabelById(root: DOMTree, id: string): DOMNode {
	if (!id) return null;
	return root.find((node: DOMNode) => node.is('label') && node.getAttributeValue('for') === id);
}

function findLabelByParent(el: DOMNode): DOMNode {
	let cur = el.parent;
	while (cur){
		if (cur.is('label')){
			return cur;
		}
		cur = cur.parent;
	}
	return null;
}

module.exports = InputMissingLabel;
