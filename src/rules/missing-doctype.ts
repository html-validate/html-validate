import { type DOMReadyEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

export default class MissingDoctype extends Rule {
	public static override readonly fixable = true;

	public override documentation(): RuleDocumentation {
		return {
			description: "Requires that the document contains a doctype.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const dom = event.document;
			if (!dom.doctype) {
				this.report({
					node: dom.root,
					message: "Document is missing doctype",
					fix(fixer) {
						fixer.replaceText(dom.root.location, "<!doctype html>\n");
					},
				});
			}
		});
	}
}
