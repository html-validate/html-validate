import { DOMReadyEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

class NoDupID extends Rule {
	documentation(): RuleDocumentation {
		return {
			description: "The ID of an element must be unique.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	setup(){
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const existing: { [key: string]: boolean } = {};
			const elements = event.document.querySelectorAll("[id]");
			elements.forEach((el) => {
				if (el.id in existing){
					this.report(el, `Duplicate ID "${el.id}"`);
				}
				existing[el.id] = true;
			});
		});
	}
}

module.exports = NoDupID;
