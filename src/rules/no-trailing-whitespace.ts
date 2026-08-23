import { type WhitespaceEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

export default class NoTrailingWhitespace extends Rule {
	public static override readonly fixable = true;

	public override documentation(): RuleDocumentation {
		return {
			description:
				"Lines with trailing whitespace cause unnessecary diff when using version control and usually serve no special purpose in HTML.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("whitespace", (event: WhitespaceEvent) => {
			const match = /^[\t ]+(\r?\n)$/.exec(event.text);
			if (!match) {
				return;
			}
			this.report({
				node: null,
				message: "Trailing whitespace",
				location: event.location,
				fix(fixer) {
					fixer.replaceText(event.location, match[1]);
				},
			});
		});
	}
}
