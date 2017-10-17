import { Rule, RuleReport, RuleParserProxy } from '../rule';
import { TagOpenEvent } from '../event';

export = {
	name: 'element-name',
	init,

	defaults: {
		pattern: '^[a-z][a-z0-9\\-._]*-[a-z0-9\\-._]*$',
		whitelist: [],
		blacklist: [],
	},
} as Rule;

function init(parser: RuleParserProxy, userOptions: any){
	const options = Object.assign({}, this.defaults, userOptions);
	const regex = new RegExp(options.pattern);
	const xmlns = /^(.+):.+$/;

	parser.on('tag:open', (event: TagOpenEvent, report: RuleReport) => {
		const target = event.target;
		const tagName = target.tagName;

		/* check if element is blacklisted */
		if (options.blacklist.indexOf(tagName) >= 0){
			report(target, `<${tagName}> element is blacklisted`);
		}

		/* assume that an element with meta has valid name as it is a builtin
		 * element */
		if (target.meta){
			return;
		}

		/* ignore elements in xml namespaces, they should be validated against a
		 * DTD instead */
		if (tagName.match(xmlns)){
			return;
		}

		/* check if element is whitelisted */
		if (options.whitelist.indexOf(tagName) >= 0){
			return;
		}

		if (!tagName.match(regex)){
			report(target, `<${tagName}> is not a valid element name`);
		}
	});
}
