import { type ConditionalEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

export default class NoConditionalComment extends Rule {
	public override documentation(): RuleDocumentation {
		return {
			description:
				"Microsoft Internet Explorer previously supported using special HTML comments (conditional comments) for targeting specific versions of IE but since IE 10 it is deprecated and not supported in standards mode.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("conditional", (event: ConditionalEvent) => {
			this.report(event.parent, "Use of conditional comments are deprecated", event.location);
		});
	}
}
