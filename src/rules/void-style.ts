import { type HtmlElement, NodeClosed } from "../dom";
import { type TagEndEvent } from "../event";
import { type RuleDocumentation, type SchemaObject, Rule, ruleDocumentationUrl } from "../rule";

/**
 * @internal
 */
export enum Style {
	AlwaysOmit = 1,
	AlwaysSelfclose = 2,
}

/**
 * @internal
 */
export interface RuleContext {
	style: Style;
	tagName: string;
}

interface RuleOptions {
	style: "omit" | "selfclose" | "selfclosing";
}

const defaults: RuleOptions = {
	style: "omit",
};

export default class VoidStyle extends Rule<RuleContext, RuleOptions> {
	private style: Style;

	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
		this.style = parseStyle(this.options.style);
	}

	public static schema(): SchemaObject {
		return {
			style: {
				enum: ["omit", "selfclose", "selfclosing"],
				type: "string",
			},
		};
	}

	public documentation(context: RuleContext): RuleDocumentation {
		const [desc, end] = styleDescription(context.style);
		return {
			description: `The current configuration requires void elements to ${desc}, use <${context.tagName}${end}> instead.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("tag:end", (event: TagEndEvent) => {
			const active = event.previous; // The current active element (that is, the current element on the stack)

			if (active.meta) {
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
			this.reportError(
				node,
				`Expected omitted end tag <${node.tagName}> instead of self-closing element <${node.tagName}/>`,
			);
		}

		if (this.shouldBeSelfClosed(node)) {
			this.reportError(
				node,
				`Expected self-closing element <${node.tagName}/> instead of omitted end-tag <${node.tagName}>`,
			);
		}
	}

	public reportError(node: HtmlElement, message: string): void {
		const context: RuleContext = {
			style: this.style,
			tagName: node.tagName,
		};
		super.report(node, message, null, context);
	}

	private shouldBeOmitted(node: HtmlElement): boolean {
		return this.style === Style.AlwaysOmit && node.closed === NodeClosed.VoidSelfClosed;
	}

	private shouldBeSelfClosed(node: HtmlElement): boolean {
		return this.style === Style.AlwaysSelfclose && node.closed === NodeClosed.VoidOmitted;
	}
}

function parseStyle(name: string): Style {
	switch (name) {
		case "omit":
			return Style.AlwaysOmit;
		case "selfclose":
		case "selfclosing":
			return Style.AlwaysSelfclose;
		/* istanbul ignore next: covered by schema validation */
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
