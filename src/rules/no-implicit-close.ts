import { NodeClosed } from "../dom";
import { type TagEndEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

export default class NoImplicitClose extends Rule {
	public override documentation(): RuleDocumentation {
		return {
			description: `Some elements in HTML has optional end tags. When an optional tag is omitted a browser must handle it as if the end tag was present.

Omitted end tags can be ambigious for humans to read and many editors have trouble formatting the markup.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("tag:end", (event: TagEndEvent) => {
			const closed = event.previous;
			const by = event.target;

			/* not set when unclosed elements are being closed by tree, this rule does
			 * not consider such events (handled by close-order instead) */
			if (!by) {
				return;
			}

			if (closed.closed !== NodeClosed.ImplicitClosed) {
				return;
			}

			const parent = closed.parent;
			const closedByParent = parent?.tagName === by.tagName; /* <ul><li></ul> */
			const closedByDocument = closedByParent && parent.isRootElement();
			const sameTag = closed.tagName === by.tagName; /* <p>foo<p>bar */

			if (closedByDocument) {
				this.report(
					closed,
					`Element <${closed.tagName}> is implicitly closed by document ending`,
					closed.location,
				);
			} else if (closedByParent) {
				this.report(
					closed,
					`Element <${closed.tagName}> is implicitly closed by parent </${by.tagName}>`,
					closed.location,
				);
			} else if (sameTag) {
				this.report(
					closed,
					`Element <${closed.tagName}> is implicitly closed by sibling`,
					closed.location,
				);
			} else {
				this.report(
					closed,
					`Element <${closed.tagName}> is implicitly closed by adjacent <${by.tagName}>`,
					closed.location,
				);
			}
		});
	}
}
