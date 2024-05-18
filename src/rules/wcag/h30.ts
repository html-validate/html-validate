import { type DOMReadyEvent } from "../../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../../rule";
import { hasAltText, hasAriaLabel } from "../helper";
import { inAccessibilityTree } from "../helper/a11y";
import { classifyNodeText, TextClassification } from "../helper/text";

export default class H30 extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description:
				"WCAG 2.1 requires each `<a href>` anchor link to have a text describing the purpose of the link using either plain text or an `<img>` with the `alt` attribute set.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const links = event.document.getElementsByTagName("a");
			for (const link of links) {
				/* ignore links missing the href attribute */
				if (!link.hasAttribute("href")) {
					continue;
				}

				/* ignore links with aria-hidden="true" */
				if (!inAccessibilityTree(link)) {
					continue;
				}

				/* check if text content is present (or dynamic) */
				const textClassification = classifyNodeText(link, { ignoreHiddenRoot: true });
				if (textClassification !== TextClassification.EMPTY_TEXT) {
					continue;
				}

				/* check if image with alt-text is present */
				const images = link.querySelectorAll("img");
				if (images.some((image) => hasAltText(image))) {
					continue;
				}

				/* check if aria-label is present on either the <a> element or a descendant */
				const labels = link.querySelectorAll("[aria-label]");
				if (hasAriaLabel(link) || labels.some((cur) => hasAriaLabel(cur))) {
					continue;
				}

				this.report(link, "Anchor link must have a text describing its purpose");
			}
		});
	}
}
