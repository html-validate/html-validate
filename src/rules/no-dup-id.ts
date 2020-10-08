import { HtmlElement } from "../dom";
import { DOMReadyEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

export default class NoDupID extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description: "The ID of an element must be unique.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const { document } = event;
			const existing = new Set<string>();
			const elements = document.querySelectorAll("[id]");
			const relevant = elements.filter(isRelevant);
			for (const el of relevant) {
				const attr = el.getAttribute("id");
				const id = attr.value.toString();

				if (existing.has(id)) {
					this.report(el, `Duplicate ID "${id}"`, attr.valueLocation);
				}

				existing.add(id);
			}
		});
	}
}

function isRelevant(element: HtmlElement): boolean {
	const attr = element.getAttribute("id");

	/* id without value is not relevant, e.g. <p id></p> */
	if (!attr.value) {
		return false;
	}

	/* dynamic id (interpolated or otherwise currently unknown value) is not relevant */
	if (attr.isDynamic) {
		return false;
	}

	return true;
}
