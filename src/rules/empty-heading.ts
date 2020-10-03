import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";
import { classifyNodeText, TextClassification } from "./helper/text";

const selector = ["h1", "h2", "h3", "h4", "h5", "h6"].join(",");

export default class EmptyHeading extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description: `Assistive technology such as screen readers require textual content in headings. Whitespace only is considered empty.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("dom:ready", ({ document }) => {
			const headings = document.querySelectorAll(selector);
			for (const heading of headings) {
				switch (classifyNodeText(heading)) {
					case TextClassification.DYNAMIC_TEXT:
					case TextClassification.STATIC_TEXT:
						/* have some text content, consider ok */
						break;
					case TextClassification.EMPTY_TEXT:
						/* no content or whitespace only */
						this.report(heading, `<${heading.tagName}> cannot be empty, must have text content`);
						break;
				}
			}
		});
	}
}
