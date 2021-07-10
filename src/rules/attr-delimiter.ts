import { sliceLocation } from "../context";
import { TokenEvent } from "../event";
import { TokenType } from "../lexer";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

const whitespace = /(\s+)/;

function isRelevant(event: TokenEvent): boolean {
	return event.type === TokenType.ATTR_VALUE;
}

export default class AttrDelimiter extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description: `Attribute value should be separated by `,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("token", isRelevant, (event: TokenEvent) => {
			const delimiter = event.data[1];
			const match = whitespace.exec(delimiter);
			if (match) {
				const location = sliceLocation(event.location, 0, delimiter.length);
				this.report(null, "Attribute value must not be delimited by whitespace", location);
			}
		});
	}
}
