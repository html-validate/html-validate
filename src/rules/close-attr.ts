import { type TagEndEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

export default class CloseAttr extends Rule {
	public override documentation(): RuleDocumentation {
		return {
			description: "HTML disallows end tags to have attributes.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("tag:end", (event: TagEndEvent) => {
			/* handle unclosed tags */
			if (!event.target) {
				return;
			}

			/* ignore self-closed and void */
			if (event.previous === event.target) {
				return;
			}

			const node = event.target;
			if (Object.keys(node.attributes).length > 0) {
				const first = node.attributes[0];
				this.report(null, "Close tags cannot have attributes", first.keyLocation);
			}
		});
	}
}
