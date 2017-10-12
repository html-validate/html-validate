import { Rule, RuleReport, RuleParserProxy } from '../rule';
import { AttributeEvent } from '../event';
import { parsePattern } from '../pattern';

export = {
	name: 'id-pattern',
	init,

	defaults: {
		pattern: 'kebabcase',
	},
} as Rule;

function init(parser: RuleParserProxy, userOptions: any){
	const options = Object.assign({}, this.defaults, userOptions);
	const pattern = parsePattern(options.pattern);

	parser.on('attr', (event: AttributeEvent, report: RuleReport) => {
		if (event.key.toLowerCase() !== 'id'){
			return;
		}

		if (!event.value.match(pattern)){
			report(event.target, `ID "${event.value}" does not match required pattern "${pattern}"`);
		}
	});
}
