/* eslint-disable no-unused-vars */
import { Rule, RuleReport, RuleParserProxy } from '../rule';
import { AttributeEvent } from '../event';
/* eslint-enable no-unused-vars */

export = <Rule> {
	name: 'attr-quotes',
	init,

	defaults: {
		style: 'double',
	},
};

function init(parser: RuleParserProxy, options: any){
	parser.on('attr', validate);
	this.options = Object.assign(this.defaults, options);
	this.expected = parseStyle(this.options.style);
}

function parseStyle(style: string){
	switch ( style.toLowerCase() ){
	case 'double': return '"';
	case 'single': return "'";
	default: return '"';
	}
}

function validate(event: AttributeEvent, report: RuleReport){
	/* ignore attributes with not value */
	if ( typeof(event.value) === 'undefined' ){
		return;
	}

	if ( event.quote !== this.expected ){
		report(event.target, "Attribute '" + event.key + "' used ' + event.quote + ' instead of expected " + this.expected);
	}
}
