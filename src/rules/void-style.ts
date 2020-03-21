import { HtmlElement, NodeClosed } from "../dom";
import { TagCloseEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

const defaults = {
	style: "omit",
};

enum Style {
	AlwaysOmit = 1,
	AlwaysSelfclose = 2,
}

interface RuleContext {
	style: Style;
	tagName: string;
}

interface RuleOptions {
	style: string;
}

export default class VoidStyle extends Rule<RuleContext, RuleOptions> {
	private style: Style;

	public constructor(options: RuleOptions) {
		super(Object.assign({}, defaults, options));
		this.style = parseStyle(this.options.style);
	}

	public documentation(context: RuleContext): RuleDocumentation {
		const doc: RuleDocumentation = {
			description:
				"The current configuration requires a specific style for ending void elements.",
			url: ruleDocumentationUrl(__filename),
		};

		if (context) {
			const [desc, end] = styleDescription(context.style);
			doc.description = `The current configuration requires void elements to ${desc}, use <${context.tagName}${end}> instead.`;
		}

		return doc;
	}

	public setup(): void {
		this.on("tag:close", (event: TagCloseEvent) => {
			const active = event.previous; // The current active element (that is, the current element on the stack)

			if (active && active.meta) {
				this.validateActive(active);
			}
		});
	}

	private validateActive(node: HtmlElement): void {
		/* ignore non-void elements, they must be closed with regular end tag */
		if (!node.voidElement) {
			return;
		}

		if (this.shouldBeOmitted(node)) {
			this.report(
				node,
				`Expected omitted end tag <${node.tagName}> instead of self-closing element <${node.tagName}/>`
			);
		}

		if (this.shouldBeSelfClosed(node)) {
			this.report(
				node,
				`Expected self-closing element <${node.tagName}/> instead of omitted end-tag <${node.tagName}>`
			);
		}
	}

	public report(node: HtmlElement, message: string): void {
		const context: RuleContext = {
			style: this.style,
			tagName: node.tagName,
		};
		super.report(node, message, null, context);
	}

	private shouldBeOmitted(node: HtmlElement): boolean {
		return (
			this.style === Style.AlwaysOmit &&
			node.closed === NodeClosed.VoidSelfClosed
		);
	}

	private shouldBeSelfClosed(node: HtmlElement): boolean {
		return (
			this.style === Style.AlwaysSelfclose &&
			node.closed === NodeClosed.VoidOmitted
		);
	}
}

function parseStyle(name: string): Style {
	switch (name) {
		case "omit":
			return Style.AlwaysOmit;
		case "selfclose":
		case "selfclosing":
			return Style.AlwaysSelfclose;
		default:
			throw new Error(`Invalid style "${name}" for "void-style" rule`);
	}
}

function styleDescription(style: Style): [string, string] {
	switch (style) {
		case Style.AlwaysOmit:
			return ["omit end tag", ""];
		case Style.AlwaysSelfclose:
			return ["be self-closed", "/"];
		// istanbul ignore next: will only happen if new styles are added, otherwise this isn't reached
		default:
			throw new Error(`Unknown style`);
	}
}
