import { Rule } from '../rule';
import { DOMNode } from 'dom';
import { DOMReadyEvent } from '../event';

const validTypes = ['submit', 'button', 'reset'];

class ButtonType extends Rule {
	setup(){
		this.on('dom:ready', (event: DOMReadyEvent) => {
			const buttons = event.document.getElementsByTagName('button');
			buttons.forEach((node: DOMNode) => {
				const attr = node.getAttribute('type');
				if (attr === null){
					this.report(node, "Button is missing type attribute");
				} else if (validTypes.indexOf(attr.value.toLowerCase()) === -1){
					this.report(node, `Button has invalid type "${attr.value}"`, attr.location);
				}
			});
		});
	}
}

module.exports = ButtonType;
