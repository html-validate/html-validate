import { Rule, RuleReport, RuleParserProxy } from '../rule';
import { TagOpenEvent } from '../event';

export = {
	name: 'element-case',
	init,

	defaults: {
		style: 'lowercase',
	},
} as Rule;

function init(parser: RuleParserProxy, options: any){
	parser.on('tag:open', validate);
	this.options = Object.assign(this.defaults, options);
	[this.pattern, this.lettercase] = parseStyle(this.options.style);
}

function parseStyle(style: string){
	switch (style.toLowerCase()){
	case 'lowercase': return [/^[a-z]*$/, 'lowercase'];
	case 'uppercase': return [/^[A-Z]*$/, 'uppercase'];
	default:
		throw new Error(`Invalid style "${style}" for "element-case" rule`);
	}
}

function validate(event: TagOpenEvent, report: RuleReport){
	const letters = event.target.tagName.replace(/[^a-z]+/ig, '');
	if (!letters.match(this.pattern)){
		report(event.target, `Element "${event.target.tagName}" should be ${this.lettercase}`);
	}
}
