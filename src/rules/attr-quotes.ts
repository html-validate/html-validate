import { Rule, RuleParserProxy } from '../rule'; // eslint-disable-line no-unused-vars
import { AttributeEvent } from '../event'; // eslint-disable-line no-unused-vars

export = <Rule> {
	name: 'attr-quotes',
	init,

	defaults: {
		style: 'double',
	},
};

function init(parser: RuleParserProxy, options){
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

function validate(event: AttributeEvent, report){
	/* ignore attributes with not value */
	if ( typeof(event.value) === 'undefined' ){
		return;
	}

	if ( event.quote !== this.expected ){
		report(event.target, "Attribute '" + event.key + "' used ' + event.quote + ' instead of expected " + this.expected);
	}
}
