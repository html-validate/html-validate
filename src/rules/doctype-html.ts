import { DoctypeEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

export default class NoStyleTag extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description: [
				'HTML5 documents should use the "html" doctype (short `form`, not legacy string):',
				"",
				"```html",
				"<!DOCTYPE html>",
				"```",
			].join("\n"),
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
