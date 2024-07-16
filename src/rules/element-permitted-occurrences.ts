import { type HtmlElement } from "../dom";
import { type DOMReadyEvent } from "../event";
import { Validator } from "../meta";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";
import { walk } from "../utils";

export default class ElementPermittedOccurrences extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description: "Some elements may only be used a fixed amount of times in given context.",
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

				const rules = node.meta.permittedContent;
				if (!rules) {
					return;
				}

				Validator.validateOccurrences(
					node.childElements,
					rules,
					(child: HtmlElement, category: string) => {
						this.report(
							child,
							`Element <${category}> can only appear once under ${node.annotatedName}`,
						);
					},
				);
			});
		});
	}
}
