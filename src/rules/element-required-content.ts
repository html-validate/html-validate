import { HtmlElement } from "../dom";
import { DOMReadyEvent } from "../event";
import { Validator } from "../meta";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

interface Context {
	node: string;
	missing: string;
}

export default class ElementRequiredContent extends Rule<Context> {
	public documentation(context: Context): RuleDocumentation {
		if (context) {
			return {
				description: `The <${context.node} element requires a <${context.missing}> to be present as content.`,
				url: ruleDocumentationUrl(__filename),
			};
		} else {
			return {
				description: "Some elements has requirements on content that must be present.",
				url: ruleDocumentationUrl(__filename),
			};
		}
	}

	public setup(): void {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const doc = event.document;
			doc.visitDepthFirst((node: HtmlElement) => {
				/* if element doesn't have metadata (unknown element) skip checking
				 * required content */
				if (!node.meta) {
					return;
				}

				const rules = node.meta.requiredContent;
				if (!rules) {
					return;
				}

				for (const missing of Validator.validateRequiredContent(node, rules)) {
					const context: Context = {
						node: node.tagName,
						missing,
					};
					this.report(
						node,
						`${node.annotatedName} element must have <${missing}> as content`,
						null,
						context
					);
				}
			});
		});
	}
}
