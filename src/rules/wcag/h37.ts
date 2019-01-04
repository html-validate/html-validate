import { TagCloseEvent } from "../../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../../rule";

const defaults = {
	allowEmpty: true,
	alias: [] as string[],
};

class H37 extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description:
				"Both HTML5 and WCAG 2.0 requires images to have a alternative text for each image.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	constructor(options: object) {
		super(Object.assign({}, defaults, options));

		/* ensure alias is array */
		if (!Array.isArray(this.options.alias)) {
			this.options.alias = [this.options.alias];
		}
	}

	public setup() {
		this.on("tag:close", (event: TagCloseEvent) => {
			const node = event.previous;

			/* only validate images */
			if (!node || node.tagName !== "img") {
				return;
			}

			/* validate plain alt-attribute */
			const alt = node.getAttributeValue("alt");
			if (alt || (alt === "" && this.options.allowEmpty)) {
				return;
			}

			/* validate if any non-empty alias is present */
			for (const attr of this.options.alias) {
				if (node.getAttribute(attr)) {
					return;
				}
			}

			this.report(
				node,
				"<img> is missing required alt attribute",
				node.location
			);
		});
	}
}

module.exports = H37;
