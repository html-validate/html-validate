import { DOMReadyEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

export default class MissingDoctype extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description: "Requires that the document contains a doctype.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const dom = event.document;
			if (!dom.doctype) {
				this.report(dom.root, "Document is missing doctype");
			}
		});
	}
}
