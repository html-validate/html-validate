import { type TokenEvent } from "../event";
import { TokenType } from "../lexer";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

export default class NoUtf8Bom extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description: `This file is saved with the UTF-8 byte order mark (BOM) present. It is neither required or recommended to use.\n\nInstead the document should be served with the \`Content-Type: application/javascript; charset=utf-8\` header.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		const unregister = this.on("token", (event: TokenEvent) => {
			/* eslint-disable-next-line @typescript-eslint/no-deprecated -- technical debt */
			if (event.type === TokenType.UNICODE_BOM) {
				this.report(null, "File should be saved without UTF-8 BOM", event.location);
			}

			/* since the BOM must be the very first thing the rule can now be disabled for the rest of the run */
			this.setEnabled(false);
			unregister();
		});
	}
}
