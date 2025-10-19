import { type TagStartEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

export default class NoStyleTag extends Rule {
	public override documentation(): RuleDocumentation {
		return {
			description:
				"Prefer to use external stylesheets with the `<link>` tag instead of inlining the styling.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("tag:start", (event: TagStartEvent) => {
			const node = event.target;
			if (node.tagName === "style") {
				this.report(node, "Use external stylesheet with <link> instead of <style> tag");
			}
		});
	}
}
