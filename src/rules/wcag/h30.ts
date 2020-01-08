import { DOMReadyEvent } from "../../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../../rule";
import { hasAltText } from "../helper";
import { classifyNodeText, TextClassification } from "../helper/text";

class H30 extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description:
				"WCAG 2.1 requires each `<a>` anchor link to have a text describing the purpose of the link using either plain text or an `<img>` with the `alt` attribute set.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public constructor(options: void) {
		super(options);
		this.name = "WCAG/H30";
	}

	public setup(): void {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const links = event.document.getElementsByTagName("a");
			for (const link of links) {
				/* check if text content is present (or dynamic) */
				const textClassification = classifyNodeText(link);
				if (textClassification !== TextClassification.EMPTY_TEXT) {
					continue;
				}

				/* check if image with alt-text is present */
				const images = link.querySelectorAll("img");
				if (images.some(image => hasAltText(image))) {
					continue;
				}

				this.report(
					link,
					"Anchor link must have a text describing its purpose"
				);
			}
		});
	}
}

module.exports = H30;
