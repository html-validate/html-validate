import { NodeClosed } from "../dom";
import { TagCloseEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

class NoImplicitClose extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description: `Some elements in HTML has optional end tags. When an optional tag is omitted a browser must handle it as if the end tag was present.

Omitted end tags can be ambigious for humans to read and many editors have trouble formatting the markup.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("tag:close", (event: TagCloseEvent) => {
			const closed = event.previous;
			const by = event.target;

			if (closed.closed !== NodeClosed.ImplicitClosed) {
				return;
			}

			const closedByParent =
				closed.parent.tagName === by.tagName; /* <ul><li></ul> */
			const sameTag = closed.tagName === by.tagName; /* <p>foo<p>bar */

			if (closedByParent) {
				this.report(
					closed,
					`Element <${closed.tagName}> is implicitly closed by parent </${by.tagName}>`,
					closed.location
				);
			} else if (sameTag) {
				this.report(
					closed,
					`Element <${closed.tagName}> is implicitly closed by sibling`,
					closed.location
				);
			} else {
				this.report(
					closed,
					`Element <${closed.tagName}> is implicitly closed by adjacent <${by.tagName}>`,
					closed.location
				);
			}
		});
	}
}

module.exports = NoImplicitClose;
