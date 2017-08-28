import { DOMNode } from 'dom';
import { Rule, RuleReport, RuleParserProxy } from '../rule';
import { AttributeEvent, TagOpenEvent } from '../event';

export = {
	name: 'no-dup-attr',
	init,
} as Rule;

function init(parser: RuleParserProxy){
	let target: DOMNode = null;
	let attr: { [key: string]: boolean } = {};

	parser.on('tag:open', (event: TagOpenEvent) => {
		target = event.target;
		attr = {};
	});

	parser.on('attr', (event: AttributeEvent, report: RuleReport) => {
		if (target === null) return;
		if (event.key in attr){
			report(event.target, `Attribute "${event.key}" duplicated`);
		}
		attr[event.key] = true;
	});
}
