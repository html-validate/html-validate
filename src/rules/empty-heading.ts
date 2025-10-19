import { type HtmlElement } from "../dom";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";
import { hasAltText } from "./helper";
import { TextClassification, classifyNodeText } from "./helper/text";

const selector = ["h1", "h2", "h3", "h4", "h5", "h6"].join(",");

function hasImgAltText(node: HtmlElement): boolean {
	if (node.is("img")) {
		return hasAltText(node);
	} else if (node.is("svg")) {
		return node.textContent.trim() !== "";
	}

	/* istanbul ignore next -- querySelector(..) is only going to return the two
	 * above tags but this serves as a sane default if above assumption changes  */
	return false;
}

export default class EmptyHeading extends Rule {
	public override documentation(): RuleDocumentation {
		return {
			description: `Assistive technology such as screen readers require textual content in headings. Whitespace only is considered empty.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("dom:ready", ({ document }) => {
			const headings = document.querySelectorAll(selector);
			for (const heading of headings) {
				this.validateHeading(heading);
			}
		});
	}

	protected validateHeading(heading: HtmlElement): void {
		const images = heading.querySelectorAll("img, svg");
		for (const child of images) {
			if (hasImgAltText(child)) {
				return;
			}
		}

		switch (classifyNodeText(heading, { ignoreHiddenRoot: true })) {
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
}
