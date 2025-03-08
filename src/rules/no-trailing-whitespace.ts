import { type WhitespaceEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

export default class NoTrailingWhitespace extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description:
				"Lines with trailing whitespace cause unnessecary diff when using version control and usually serve no special purpose in HTML.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("whitespace", (event: WhitespaceEvent) => {
			if (/^[ \t]+\r?\n$/.exec(event.text)) {
				this.report(null, "Trailing whitespace", event.location);
			}
		});
	}
}
