import { Rule, RuleReport, RuleParserProxy } from '../rule';
import { TagOpenEvent } from '../event';

export = {
	name: 'element-name',
	init,

	defaults: {
		pattern: '^[a-z][a-z0-9\\-._]*-[a-z0-9\\-._]*$',
	},
} as Rule;

function init(parser: RuleParserProxy, userOptions: any){
	const options = Object.assign({}, this.defaults, userOptions);
	const regex = new RegExp(options.pattern);

	parser.on('tag:open', (event: TagOpenEvent, report: RuleReport) => {
		const target = event.target;

		/* assume that an element with meta has valid name as it is a builtin
		 * element */
		if (target.meta){
			return;
		}

		if (!target.tagName.match(regex)){
			report(target, `"${target.tagName}" is not a valid element name`);
		}
	});
}
