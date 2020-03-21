import { ConditionalEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

export default class NoConditionalComment extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description:
				"Microsoft Internet Explorer previously supported using special HTML comments (conditional comments) for targeting specific versions of IE but since IE 10 it is deprecated and not supported in standards mode.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("conditional", (event: ConditionalEvent) => {
			this.report(
				null,
				"Use of conditional comments are deprecated",
				event.location
			);
		});
	}
}
