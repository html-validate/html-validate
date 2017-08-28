import { Rule, RuleReport, RuleParserProxy } from '../rule';
import { AttributeEvent } from '../event';

export = {
	name: 'attr-quotes',
	init,

	defaults: {
		style: 'double',
		unquoted: false,
	},
} as Rule;

function init(parser: RuleParserProxy, options: any){
	parser.on('attr', validate);
	this.options = Object.assign(this.defaults, options);
	this.expected = parseStyle(this.options.style);
}

function parseStyle(style: string){
	switch (style.toLowerCase()){
	case 'double': return '"';
	case 'single': return "'";
	default: return '"';
	}
}

function validate(event: AttributeEvent, report: RuleReport){
	/* ignore attributes with not value */
	if (typeof event.value === 'undefined'){
		return;
	}

	if (typeof event.quote === 'undefined'){
		if (this.options.unquoted === false){
			report(event.target, `Attribute "${event.key}" using unquoted value`);
		}
		return;
	}

	if (event.quote !== this.expected){
		report(event.target, `Attribute "${event.key}" used ${event.quote} instead of expected ${this.expected}`);
	}
}
