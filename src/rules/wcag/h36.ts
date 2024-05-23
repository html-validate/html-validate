import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../../rule";
import { hasAltText } from "../helper";
import { inAccessibilityTree } from "../helper/a11y";

export default class H36 extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description: [
				"WCAG 2.1 requires all images used as submit buttons to have a non-empty textual description using the `alt` attribute.",
				'The alt text cannot be empty (`alt=""`).',
			].join("\n"),
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("tag:end", (event) => {
			/* only handle input elements */
			const node = event.previous;
			if (node.tagName !== "input") return;

			/* only handle images with type="image" */
			if (node.getAttributeValue("type") !== "image") {
				return;
			}

			if (!inAccessibilityTree(node)) {
				return;
			}

			if (!hasAltText(node)) {
				const message = "image used as submit button must have non-empty alt text";
				const alt = node.getAttribute("alt");
				this.report({
					node,
					message,
					location: alt ? alt.keyLocation : node.location,
				});
			}
		});
	}
}
