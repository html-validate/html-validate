import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";
import { classifyNodeText, TextClassification } from "./helper/text";

export default class EmptyTitle extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description: `The <title> element is used to describe the document and is shown in the browser tab and titlebar. WCAG and SEO requires a descriptive title and preferably unique within the site. Whitespace only is considered empty.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("tag:close", (event) => {
			const node = event.previous;
			if (node.tagName !== "title") return;

			switch (classifyNodeText(node)) {
				case TextClassification.DYNAMIC_TEXT:
				case TextClassification.STATIC_TEXT:
					/* have some text content, consider ok */
					break;
				case TextClassification.EMPTY_TEXT:
					/* no content or whitespace only */
					this.report(
						node,
						`<${node.tagName}> cannot be empty, must have text content`
					);
					break;
			}
		});
	}
}
