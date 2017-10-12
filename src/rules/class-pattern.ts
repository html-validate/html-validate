import { Rule, RuleReport, RuleParserProxy } from '../rule';
import { AttributeEvent } from '../event';
import { DOMTokenList } from '../dom';
import { parsePattern } from '../pattern';

export = {
	name: 'class-pattern',
	init,

	defaults: {
		pattern: 'kebabcase',
	},
} as Rule;

function init(parser: RuleParserProxy, userOptions: any){
	const options = Object.assign({}, this.defaults, userOptions);
	const pattern = parsePattern(options.pattern);

	parser.on('attr', (event: AttributeEvent, report: RuleReport) => {
		if (event.key.toLowerCase() !== 'class'){
			return;
		}

		const classes = new DOMTokenList(event.value);
		classes.forEach(cur => {
			if (!cur.match(pattern)){
				report(event.target, `Class "${cur}" does not match required pattern "${pattern}"`);
			}
		});
	});
}
