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

	public constructor(options: object) {
		super(options);
		this.name = "WCAG/H32";
	}

	public setup(): void {
		/* query all tags with form property, normally this is only the <form> tag
		 * but with custom element metadata other tags might be considered form
		 * (usually a component wrapping a <form> element) */
		const formTags = this.getTagsWithProperty("form");
		const formSelector = formTags.join(",");

		this.on("dom:ready", (event: DOMReadyEvent) => {
			const forms = event.document.querySelectorAll(formSelector);
			forms.forEach((node: HtmlElement) => {
				/* find submit buttons */
				for (const button of node.querySelectorAll("button,input")) {
					const type = button.getAttribute("type");
					if (type && type.valueMatches("submit")) {
						return;
					}
				}

				this.report(
					node,
					`<${node.tagName}> element must have a submit button`
				);
			});
		});
	}
}

module.exports = H32;
