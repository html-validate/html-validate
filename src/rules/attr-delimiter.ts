import { sliceLocation } from "../context";
import { type TokenEvent } from "../event";
import { TokenType } from "../lexer";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

const whitespace = /(\s+)/;

export default class AttrDelimiter extends Rule {
	public override documentation(): RuleDocumentation {
		return {
			description: `Attribute value must not be separated by whitespace.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("token", (event: TokenEvent) => {
			const { token } = event;
			if (token.type !== TokenType.ATTR_VALUE) {
				return;
			}
			const delimiter = token.data[1];
			const match = whitespace.exec(delimiter);
			if (match) {
				const location = sliceLocation(event.location, 0, delimiter.length);
				this.report(null, "Attribute value must not be delimited by whitespace", location);
			}
		});
	}
}
