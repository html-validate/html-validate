import { TagOpenEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

class NoUnknownElements extends Rule<string> {
	public documentation(context: string): RuleDocumentation {
		const element = context ? ` <${context}>` : "";
		return {
			description: `An unknown element${element} was used. If this is a Custom Element you need to supply element metadata for it.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("tag:open", (event: TagOpenEvent) => {
			const node = event.target;
			if (!node.meta) {
				this.report(
					node,
					`Unknown element <${node.tagName}>`,
					null,
					node.tagName
				);
			}
		});
	}
}

module.exports = NoUnknownElements;
