import { DoctypeEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

class NoStyleTag extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description:
				'HTML5 documents should use the "html" doctype (short form, not legacy string)',
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("doctype", (event: DoctypeEvent) => {
			const doctype = event.value.toLowerCase();
			if (doctype !== "html") {
				this.report(null, 'doctype should be "html"', event.valueLocation);
			}
		});
	}
}

module.exports = NoStyleTag;
