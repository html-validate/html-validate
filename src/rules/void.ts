import { HtmlElement, NodeClosed } from "../dom";
import { TagCloseEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

type StyleName = "any" | "omit" | "selfclose" | "selfclosing";

interface RuleOptions {
	style: StyleName;
}

enum Style {
	Any = 0,
	AlwaysOmit = 1,
	AlwaysSelfclose = 2,
}

const defaults: RuleOptions = {
	style: "omit",
};

export default class Void extends Rule<void, RuleOptions> {
	private style: Style;

	public get deprecated(): boolean {
		return true;
	}

	public documentation(): RuleDocumentation {
		return {
			description: "HTML void elements cannot have any content and must not have an end tag.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public constructor(options: RuleOptions) {
		super(Object.assign({}, defaults, options));
		this.style = parseStyle(this.options.style);
	}

	public setup(): void {
		this.on("tag:close", (event: TagCloseEvent) => {
			const current = event.target; // The current element being closed
			const active = event.previous; // The current active element (that is, the current element on the stack)

			if (current && current.meta) {
				this.validateCurrent(current);
			}

			if (active && active.meta) {
				this.validateActive(active);
			}
		});
	}

	private validateCurrent(node: HtmlElement): void {
		if (node.voidElement && node.closed === NodeClosed.EndTag) {
			this.report(null, `End tag for <${node.tagName}> must be omitted`, node.location);
		}
	}

	private validateActive(node: HtmlElement): void {
		/* ignore foreign elements, they may or may not be self-closed and both are
		 * valid */
		if (node.meta.foreign) {
			return;
		}

		const selfOrOmitted =
			node.closed === NodeClosed.VoidOmitted || node.closed === NodeClosed.VoidSelfClosed;

		if (node.voidElement) {
			if (this.style === Style.AlwaysOmit && node.closed === NodeClosed.VoidSelfClosed) {
				this.report(
					node,
					`Expected omitted end tag <${node.tagName}> instead of self-closing element <${node.tagName}/>`
				);
			}

			if (this.style === Style.AlwaysSelfclose && node.closed === NodeClosed.VoidOmitted) {
				this.report(
					node,
					`Expected self-closing element <${node.tagName}/> instead of omitted end-tag <${node.tagName}>`
				);
			}
		}

		if (selfOrOmitted && node.voidElement === false) {
			this.report(node, `End tag for <${node.tagName}> must not be omitted`);
		}
	}
}

function parseStyle(name: StyleName): Style {
	switch (name) {
		case "any":
			return Style.Any;
		case "omit":
			return Style.AlwaysOmit;
		case "selfclose":
		case "selfclosing":
			return Style.AlwaysSelfclose;
		default:
			throw new Error(`Invalid style "${name}" for "void" rule`);
	}
}
