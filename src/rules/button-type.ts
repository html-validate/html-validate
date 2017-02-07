import { Rule, RuleParserProxy } from '../rule'; // eslint-disable-line no-unused-vars
import { DOMReadyEvent } from '../event'; // eslint-disable-line no-unused-vars

export = <Rule> {
	name: 'button-type',
	init,

	validTypes: ['submit', 'button', 'reset'],
};

function init(parser: RuleParserProxy){
	parser.on('dom:ready', validate);
}

function validate(event: DOMReadyEvent, report){
	const validTypes = this.validTypes;
	const buttons = event.document.getElementsByTagName('button');
	buttons.forEach(function(node){
		if ( typeof(node.attr.type) === 'undefined' ){
			report(node, "Button is missing type attribute");
		} else if ( validTypes.indexOf(node.attr.type.toLowerCase()) === -1 ){
			report(node, "Button has invalid type");
		}
	});
}
