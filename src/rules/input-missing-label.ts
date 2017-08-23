/* eslint-disable no-unused-vars */
import { DOMNode, DOMTree } from 'dom';
import { Rule, RuleReport, RuleParserProxy } from '../rule';
import { DOMReadyEvent } from '../event';
/* eslint-enable no-unused-vars */

export = <Rule> {
	name: 'input-missing-label',
	init,
};

function init(parser: RuleParserProxy){
	parser.on('dom:ready', (event: DOMReadyEvent, report: RuleReport) => {
		const root = event.document;
		for (const elem of root.getElementsByTagName('input')){

			/* try to find label by id */
			const id = elem.getAttribute('id');
			if (findLabelById(root, id)){
				continue;
			}

			/* try to find parent label (input nested in label) */
			if (findLabelByParent(elem)){
				continue;
			}

			report(elem, 'Input element does not have a label');
		}
	});
}

function findLabelById(root: DOMTree, id: string): DOMNode {
	if (!id) return null;
	return root.find((node: DOMNode) => node.is('label') && node.getAttribute('for') === id);
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
