import { type DoctypeEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

export default class NoStyleTag extends Rule {
	public static override readonly fixable = true;

	public override documentation(): RuleDocumentation {
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
				this.report({
					node: null,
					message: 'doctype should be "html"',
					location: event.valueLocation,
					fix(fixer) {
						fixer.replaceText(event.valueLocation, "html");
					},
				});
			}
		});
	}
}
