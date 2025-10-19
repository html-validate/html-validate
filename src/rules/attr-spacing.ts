import { type TokenEvent } from "../event";
import { TokenType } from "../lexer";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

export default class AttrSpacing extends Rule {
	public override documentation(): RuleDocumentation {
		return {
			description: `No space between attributes. At least one whitespace character (commonly space) must be used to separate attributes.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		let previousToken: TokenType;
		this.on("token", (event: TokenEvent) => {
			/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
			if (event.type === TokenType.ATTR_NAME && previousToken !== TokenType.WHITESPACE) {
				this.report(null, "No space between attributes", event.location);
			}
			/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
			previousToken = event.type;
		});
	}
}
