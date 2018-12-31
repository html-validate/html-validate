import { WhitespaceEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

class NoTrailingWhitespace extends Rule {
	documentation(): RuleDocumentation {
		return {
			description: "Lines with trailing whitespace cause unnessecary diff when using version control and usually serve no special purpose in HTML.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	setup(){
		this.on("whitespace", (event: WhitespaceEvent) => {
			if (event.text.match(/^[ \t]+\n$/)){
				this.report(undefined, "Trailing whitespace", event.location);
			}
		});
	}
}

module.exports = NoTrailingWhitespace;
