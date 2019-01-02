import { TagOpenEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

class Deprecated extends Rule {
	documentation(): RuleDocumentation {
		return {
			description:
				"HTML5 deprecated many old elements and they should not be used in new code.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	setup() {
		this.on("tag:open", (event: TagOpenEvent) => {
			const node = event.target;

			/* cannot validate if meta isn't known */
			if (node.meta === null) {
				return;
			}

			const deprecated = node.meta.deprecated;
			if (deprecated) {
				if (typeof deprecated === "string") {
					this.report(node, `<${node.tagName}> is deprecated: ${deprecated}`);
				} else {
					this.report(node, `<${node.tagName}> is deprecated`);
				}
			}
		});
	}
}

module.exports = Deprecated;
