import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../../rule";
import { hasAltText } from "../helper";

class H36 extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description:
				'WCAG 2.1 requires all images used as submit buttons to have a textual description using the alt attribute. The alt text cannot be empty (`alt=""`).',
			url: ruleDocumentationUrl(__filename),
		};
	}

	constructor(options: object) {
		super(options);
		this.name = "WCAG/H36";
	}

	public setup() {
		this.on("tag:close", event => {
			/* only handle input elements */
			const node = event.previous;
			if (node.tagName !== "input") return;

			/* only handle images with type="image" */
			if (node.getAttributeValue("type") !== "image") {
				return;
			}

			if (!hasAltText(node)) {
				this.report(node, "image used as submit button must have alt text");
			}
		});
	}
}

module.exports = H36;
