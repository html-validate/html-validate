import { HtmlElement } from "../dom";
import { DOMReadyEvent } from "../event";
import { Validator } from "../meta";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

export interface RuleContext {
	parent: string;
	child: string;
}

function getRuleDescription(context?: RuleContext): string[] {
	if (!context) {
		return [
			"Some elements has restrictions on what content is allowed.",
			"This can include both direct children or descendant elements.",
		];
	}
	return [
		`The \`${context.child}\` element is not permitted as content under the parent \`${context.parent}\` element.`,
	];
}

export default class ElementPermittedParent extends Rule<RuleContext> {
	public documentation(context?: RuleContext): RuleDocumentation {
		return {
			description: getRuleDescription(context).join("\n"),
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const doc = event.document;
			doc.visitDepthFirst((node: HtmlElement) => {
				const parent = node.parent;

				/* istanbul ignore next: satisfy typescript but will visitDepthFirst()
				 * will not yield nodes without a parent */
				if (!parent) {
					return;
				}

				/* don't validate root element as the <html> and <body> tag is optional
				 * so anything could be directly under the root element. */
				if (parent.isRootElement()) {
					return;
				}

				/* when the parent element is the same as the current element we ignore
				 * this rule and let `element-permitted-content` handle it as it will
				 * create a lot of duplicate errors otherwise */
				if (parent.tagName === node.tagName) {
					return;
				}

				/* if parent doesn't have metadata (unknown element) skip checking permitted
				 * content */
				const rules = node.meta?.permittedParent;
				if (!rules) {
					return false;
				}

				if (Validator.validatePermitted(parent, rules)) {
					return;
				}

				const message = `${parent.annotatedName} element is not permitted as parent of ${node.annotatedName}`;
				const context: RuleContext = {
					parent: parent.annotatedName,
					child: node.annotatedName,
				};
				this.report(parent, message, null, context);
			});
		});
	}
}
