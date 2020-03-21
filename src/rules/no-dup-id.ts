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
			const existing: { [key: string]: boolean } = {};
			const elements = event.document.querySelectorAll("[id]");
			for (const el of elements) {
				/* handle when the id attribute is set but omitted value: <p id></p> */
				if (!el.id) {
					continue;
				}

				if (el.id in existing) {
					const attr = el.getAttribute("id");
					this.report(el, `Duplicate ID "${el.id}"`, attr.valueLocation);
				}

				existing[el.id] = true;
			}
		});
	}
}
