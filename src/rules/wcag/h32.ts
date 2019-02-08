import { HtmlElement } from "../../dom";
import { DOMReadyEvent } from "../../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../../rule";

class H32 extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description:
				"WCAG 2.1 requires each `<form>` element to have at least one submit button.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	constructor(options: object) {
		super(options);
		this.name = "WCAG/H32";
	}

	public setup() {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const forms = event.document.getElementsByTagName("form");
			forms.forEach((node: HtmlElement) => {
				/* find submit buttons */
				for (const button of node.querySelectorAll("button,input")) {
					const type = button.getAttribute("type");
					if (type && type.valueMatches("submit")) {
						return;
					}
				}

				this.report(node, "<form> element must have a submit button");
			});
		});
	}
}

module.exports = H32;
