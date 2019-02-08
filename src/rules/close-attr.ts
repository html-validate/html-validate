import { TagCloseEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

class CloseAttr extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description: "HTML disallows end tags to have attributes.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup() {
		this.on("tag:close", (event: TagCloseEvent) => {
			/* handle unclosed tags */
			if (typeof event.target === "undefined") {
				return;
			}

			/* ignore self-closed and void */
			if (event.previous === event.target) {
				return;
			}

			if (Object.keys(event.target.attr).length > 0) {
				this.report(event.target, "Close tags cannot have attributes");
			}
		});
	}
}

module.exports = CloseAttr;
