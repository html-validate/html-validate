import { HtmlElement, NodeType, TextNode } from "../dom";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

const selector = ["h1", "h2", "h3", "h4", "h5", "h6"].join(",");

enum TextClassification {
	EMPTY_TEXT,
	DYNAMIC_TEXT,
	STATIC_TEXT,
}

class EmptyHeading extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description: `Assistive technology such as screen readers require textual content in headings. Whitespace only is considered empty.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup() {
		this.on("dom:ready", ({ document }) => {
			const headings = document.querySelectorAll(selector);
			for (const heading of headings) {
				const text = this.findTextNodes(heading);
				switch (this.classifyText(text)) {
					case TextClassification.DYNAMIC_TEXT:
					case TextClassification.STATIC_TEXT:
						/* have some text content, consider ok */
						break;
					case TextClassification.EMPTY_TEXT:
						/* no content or whitespace only */
						this.report(
							heading,
							`<${heading.tagName}> cannot be empty, must have text content`
						);
						break;
				}
			}
		});
	}

	private findTextNodes(node: HtmlElement): TextNode[] {
		let text: TextNode[] = [];
		for (const child of node.childNodes) {
			switch (child.nodeType) {
				case NodeType.TEXT_NODE:
					text.push(child as TextNode);
					break;
				case NodeType.ELEMENT_NODE:
					text = text.concat(this.findTextNodes(child as HtmlElement));
					break;
				/* istanbul ignore next: provides a sane default, nothing to test */
				default:
					break;
			}
		}
		return text;
	}

	private classifyText(text: TextNode[]): TextClassification {
		for (const node of text) {
			if (node.isDynamic) {
				return TextClassification.DYNAMIC_TEXT;
			}
			if (node.textContent.match(/\S/)) {
				return TextClassification.STATIC_TEXT;
			}
		}
		return TextClassification.EMPTY_TEXT;
	}
}

module.exports = EmptyHeading;
