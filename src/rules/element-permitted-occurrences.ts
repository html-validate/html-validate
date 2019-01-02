import { HtmlElement } from "../dom";
import { DOMReadyEvent } from "../event";
import { Validator } from "../meta";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

class ElementPermittedOccurrences extends Rule {
	documentation(): RuleDocumentation {
		return {
			description: "Some elements may only be used a fixed amount of times in given context.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	setup() {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const doc = event.document;
			doc.visitDepthFirst((node: HtmlElement) => {
				const parent = node.parent;

				if (!parent.meta) {
					return;
				}

				const rules = parent.meta.permittedContent;
				const siblings = parent.children.filter((cur) => cur.tagName === node.tagName);
				const first = node.unique === siblings[0].unique;

				/* the first occurrence should not trigger any errors, only the
				 * subsequent occurrences should. */
				if (first) {
					return;
				}

				if (parent.meta && !Validator.validateOccurrences(node, rules, siblings.length)) {
					this.report(node, `Element <${node.tagName}> can only appear once under <${parent.tagName}>`);
				}
			});
		});
	}
}

module.exports = ElementPermittedOccurrences;
