import { HtmlElement } from "../../dom";
import { DOMReadyEvent } from "../../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../../rule";
import { classifyNodeText, TextClassification } from "../helper/text";

class H30 extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description:
				"WCAG 2.1 requires each `<a>` anchor link to have a text describing the purpose of the link using either plain text or an `<img>` with the `alt` attribute set.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	constructor(options: object) {
		super(options);
		this.name = "WCAG/H30";
	}

	public setup() {
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

function hasAltText(image: HtmlElement): boolean {
	const alt = image.getAttribute("alt");

	/* missing or boolean */
	if (alt === null || alt.value === null) {
		return false;
	}

	return alt.isDynamic || alt.value.toString() !== "";
}

module.exports = H30;
