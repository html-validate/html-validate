import { Node } from "../dom";
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

			if (closed.closed !== Node.CLOSED_IMPLICIT_CLOSED) {
				return;
			}

			const parent = closed.parent;

			/* the temporary node created for an end tag never has a parent while the
			 * node for a start tag always has one, i.e., this tells whether this
			 * element was closed by an end tag or by another element being opened */
			const closedByEndTag = !by.parent;

			const closedByParent = parent?.tagName === by.tagName; /* <ul><li></ul> */
			const sameTag = closed.tagName === by.tagName; /* <p>foo<p>bar */

			if (by.isRootElement()) {
				this.report(
					closed,
					`Element <${closed.tagName}> is implicitly closed by document ending`,
					closed.location,
				);
			} else if (closedByEndTag && closedByParent) {
				this.report(
					closed,
					`Element <${closed.tagName}> is implicitly closed by parent </${by.tagName}>`,
					closed.location,
				);
			} else if (closedByEndTag) {
				/* <table><tbody><tr><td>x</table> closes <td> and <tr> as well */
				this.report(
					closed,
					`Element <${closed.tagName}> is implicitly closed by ancestor </${by.tagName}>`,
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
