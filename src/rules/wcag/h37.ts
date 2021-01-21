import { TagEndEvent } from "../../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../../rule";
import { inAccessibilityTree } from "../helper/a17y";

interface RuleOptions {
	allowEmpty: boolean;
	alias: string | string[];
}

const defaults: RuleOptions = {
	allowEmpty: true,
	alias: [],
};

export default class H37 extends Rule<void, RuleOptions> {
	public documentation(): RuleDocumentation {
		return {
			description:
				"Both HTML5 and WCAG 2.0 requires images to have a alternative text for each image.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });

		/* ensure alias is array */
		if (!Array.isArray(this.options.alias)) {
			this.options.alias = [this.options.alias];
		}
	}

	public setup(): void {
		this.on("tag:end", (event: TagEndEvent) => {
			const node = event.previous;

			/* only validate images */
			if (!node || node.tagName !== "img") {
				return;
			}

			/* ignore images with aria-hidden="true" or role="presentation" */
			if (!inAccessibilityTree(node)) {
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

			this.report(node, '<img> is missing required "alt" attribute', node.location);
		});
	}
}
