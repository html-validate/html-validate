import { type HtmlElement } from "../dom";
import { type DOMReadyEvent } from "../event";
import { Validator } from "../meta";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";
import { walk } from "../utils/walk";

export default class ElementPermittedOrder extends Rule {
	public override documentation(): RuleDocumentation {
		return {
			description: "Some elements has a specific order the children must use.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const doc = event.document;
			walk.depthFirst(doc, (node: HtmlElement) => {
				if (!node.meta) {
					return;
				}

				const rules = node.meta.permittedOrder;
				if (!rules) {
					return;
				}

				Validator.validateOrder(
					node.childElements,
					rules,
					(child: HtmlElement, prev: HtmlElement) => {
						this.report(
							child,
							`Element <${child.tagName}> must be used before <${prev.tagName}> in this context`,
						);
					},
				);
			});
		});
	}
}
