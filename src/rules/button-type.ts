import { Rule, RuleReport, RuleParserProxy } from '../rule';
import { DOMNode } from 'dom';
import { DOMReadyEvent } from '../event';

export = {
	name: 'button-type',
	init,

	validTypes: ['submit', 'button', 'reset'],
} as Rule;

function init(parser: RuleParserProxy){
	parser.on('dom:ready', validate);
}

function validate(event: DOMReadyEvent, report: RuleReport){
	const validTypes = this.validTypes;
	const buttons = event.document.getElementsByTagName('button');
	buttons.forEach(function(node: DOMNode){
		const type = node.getAttribute('type');
		if (type === null){
			report(node, "Button is missing type attribute");
		} else if (validTypes.indexOf(type.toLowerCase()) === -1){
			report(node, `Button has invalid type "${type}"`);
		}
	});
}
