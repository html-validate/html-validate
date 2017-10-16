import { Rule, RuleReport, RuleParserProxy } from '../rule';
import { DOMNode } from 'dom';
import { DOMReadyEvent } from '../event';

export = {
	name: 'img-req-alt',
	init,

	defaults: {
		allowEmpty: true,
		alias: [],
	},
} as Rule;

function init(parser: RuleParserProxy, options: any){
	this.options = Object.assign(this.defaults, options);

	/* ensure alias is array */
	if (!Array.isArray(this.options.alias)){
		this.options.alias = [this.options.alias];
	}

	parser.on('dom:ready', (event: DOMReadyEvent, report: RuleReport) => {
		const images = event.document.getElementsByTagName('img');
		images.forEach((node: DOMNode) => {
			/* validate plain alt-attribute */
			const alt = node.getAttribute('alt');
			if (alt || (alt === "" && this.options.allowEmpty)){
				return;
			}

			/* validate if any non-empty alias is present */
			for (const attr of this.options.alias){
				if (node.getAttribute(attr)){
					return;
				}
			}

			report(node, "<img> is missing required alt attribute");
		});
	});
}
