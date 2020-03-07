import { sliceLocation } from "../context";
import { TagOpenEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

class Deprecated extends Rule<string> {
	public documentation(context?: string): RuleDocumentation {
		const doc: RuleDocumentation = {
			description:
				"HTML5 has deprecated many old elements and they should not be used in new code.",
			url: ruleDocumentationUrl(__filename),
		};
		if (context) {
			doc.description = `HTML5 has deprecated the \`<${context}>\` element. It should not be used in new code.`;
		}
		return doc;
	}

	public setup(): void {
		this.on("tag:open", (event: TagOpenEvent) => {
			const node = event.target;

			/* cannot validate if meta isn't known */
			if (node.meta === null) {
				return;
			}

			const deprecated = node.meta.deprecated;
			if (deprecated) {
				const location = sliceLocation(event.location, 1);
				if (typeof deprecated === "string") {
					this.report(
						node,
						`<${node.tagName}> is deprecated: ${deprecated}`,
						location
					);
				} else {
					this.report(node, `<${node.tagName}> is deprecated`, location);
				}
			}
		});
	}
}

module.exports = Deprecated;
