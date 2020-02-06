import { DOMReadyEvent } from "../../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../../rule";
import { HtmlElement } from "../../dom";

class H71 extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description:
				"H71: Providing a description for groups of form controls using fieldset and legend elements",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public constructor(options: void) {
		super(options);
		this.name = "WCAG/H71";
	}

	public setup(): void {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const { document } = event;
			const fieldsets = document.querySelectorAll("fieldset");
			for (const fieldset of fieldsets) {
				this.validate(fieldset);
			}
		});
	}

	private validate(fieldset: HtmlElement): void {
		const legend = fieldset.querySelectorAll("> legend");
		if (legend.length === 0) {
			this.reportNode(fieldset);
		}
	}

	private reportNode(node: HtmlElement): void {
		super.report(
			node,
			`${node.annotatedName} must have a <legend> as the first child`
		);
	}
}

module.exports = H71;
