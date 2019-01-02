import { ConditionalEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

class NoConditionalComment extends Rule {
	documentation(): RuleDocumentation {
		return {
			description: "Microsoft Internet Explorer previously supported using special HTML comments (conditional comments) for targeting specific versions of IE but since IE 10 it is deprecated and not supported in standards mode.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	setup() {
		this.on("conditional", (event: ConditionalEvent) => {
			this.report(null, "Use of conditional comments are deprecated", event.location);
		});
	}
}

module.exports = NoConditionalComment;
