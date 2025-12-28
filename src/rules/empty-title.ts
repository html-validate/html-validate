import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";
import { TextClassification, classifyNodeText } from "./helper/text";

export default class EmptyTitle extends Rule {
	public override documentation(): RuleDocumentation {
		return {
			description: [
				"The `<title>` element cannot be empty, it must have textual content.",
				"",
				"It is used to describe the document and is shown in the browser tab and titlebar.",
				"WCAG and SEO requires a descriptive title and preferably unique within the site.",
				"",
				"Whitespace is ignored.",
			].join("\n"),
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("tag:end", (event) => {
			const node = event.previous;
			if (node.tagName !== "title") {
				return;
			}

			switch (classifyNodeText(node)) {
				case TextClassification.DYNAMIC_TEXT:
				case TextClassification.STATIC_TEXT:
					/* have some text content, consider ok */
					break;
				case TextClassification.EMPTY_TEXT:
					/* no content or whitespace only */
					{
						const message = `<${node.tagName}> cannot be empty, must have text content`;
						this.report(node, message, node.location);
					}
					break;
			}
		});
	}
}
