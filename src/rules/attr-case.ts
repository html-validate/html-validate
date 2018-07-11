import { Rule, RuleReport, RuleParserProxy } from '../rule';
import { AttributeEvent } from '../event';

export = {
	name: 'attr-case',
	init,

	defaults: {
		style: 'lowercase',
	},
} as Rule;

function init(parser: RuleParserProxy, options: any){
	parser.on('attr', validate);
	this.options = Object.assign(this.defaults, options);
	[this.pattern, this.lettercase] = parseStyle(this.options.style);
}

function parseStyle(style: string){
	switch (style.toLowerCase()){
	case 'lowercase': return [/^[a-z]*$/, 'lowercase'];
	case 'uppercase': return [/^[A-Z]*$/, 'uppercase'];
	default:
		throw new Error(`Invalid style "${style}" for "attr-case" rule`);
	}
}

function validate(event: AttributeEvent, report: RuleReport){
	const letters = event.key.replace(/[^a-z]+/ig, '');
	if (!letters.match(this.pattern)){
		report(event.target, `Attribute "${event.key}" should be ${this.lettercase}`);
	}
}
