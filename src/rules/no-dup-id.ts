import { DOMReadyEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

class NoDupID extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description: "The ID of an element must be unique.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup() {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const existing: { [key: string]: boolean } = {};
			const elements = event.document.querySelectorAll("[id]");
			elements.forEach(el => {
				if (el.id in existing) {
					const attr = el.getAttribute("id");
					this.report(el, `Duplicate ID "${el.id}"`, attr.valueLocation);
				}
				existing[el.id] = true;
			});
		});
	}
}

module.exports = NoDupID;
