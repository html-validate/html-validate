import { DOMNode } from '../dom';
import { Rule, RuleReport, RuleParserProxy } from '../rule';
import { TagCloseEvent } from '../event';
import { NodeClosed } from '../dom';

export = {
	name: 'void',
	init,

	defaults: {
		style: 'omit',
	},

} as Rule;

enum Style {
	Any = 0,
	AlwaysOmit = 1,
	AlwaysSelfclose = 2,
}

function init(parser: RuleParserProxy, userOptions: any){
	const options = Object.assign({}, this.defaults, userOptions);
	const style = parseStyle(options.style);

	parser.on('tag:close', (event: TagCloseEvent, report: RuleReport) => {
		const current = event.target;     // The current element being closed
		const active = event.previous;    // The current active element (that is, the current element on the stack)

		if (current && current.meta){
			validateCurrent(current, report);
		}

		if (active && active.meta){
			validateActive(active, report);
		}
	});

	function validateCurrent(node: DOMNode, report: RuleReport): void {
		if (node.voidElement && node.closed === NodeClosed.EndTag){
			report(node, `End tag for <${node.tagName}> must be omitted`);
		}
	}

	function validateActive(node: DOMNode, report: RuleReport): void {
		const selfOrOmitted = node.closed === NodeClosed.VoidOmitted || node.closed === NodeClosed.VoidSelfClosed;

		if (node.voidElement){
			if (style === Style.AlwaysOmit && node.closed === NodeClosed.VoidSelfClosed){
				report(node, `Expected omitted end tag <${node.tagName}> instead of self-closing element <${node.tagName}/>`);
			}

			if (style === Style.AlwaysSelfclose && node.closed === NodeClosed.VoidOmitted){
				report(node, `Expected self-closing element <${node.tagName}/> instead of omitted end-tag <${node.tagName}>`);
			}
		}

		if (selfOrOmitted && node.voidElement === false){
			report(node, `End tag for <${node.tagName}> must not be omitted`);
		}

	}
}

function parseStyle(name: string): Style {
	switch (name){
	case 'any': return Style.Any;
	case 'omit': return Style.AlwaysOmit;
	case 'selfclose': return Style.AlwaysSelfclose;
	default: return Style.Any;
	}
}
