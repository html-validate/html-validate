import { NodeClosed } from "../dom";
import { TagCloseEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

class CloseOrder extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description:
				"HTML requires elements to be closed in the same order as they were opened.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("tag:close", (event: TagCloseEvent) => {
			const current = event.target; // The current element being closed
			const active = event.previous; // The current active element (that is, the current element on the stack)

			/* handle unclosed tags */
			if (!current) {
				this.report(
					event.previous,
					`Missing close-tag, expected '</${active.tagName}>' but document ended before it was found.`
				);
				return;
			}

			/* void elements are always closed in correct order but if the markup contains
			 * an end-tag for it it should be ignored here since the void element is
			 * implicitly closed in the right order, so the current active element is the
			 * parent. */
			if (current.voidElement) {
				return;
			}

			/* if the active element is implicitly closed when the parent is closed
			 * (such as a <li> by </ul>) no error should be reported. */
			if (active.closed === NodeClosed.ImplicitClosed) {
				return;
			}

			/* handle unopened tags */
			if (!active || active.isRootElement()) {
				this.report(
					event.previous,
					"Unexpected close-tag, expected opening tag."
				);
				return;
			}

			/* check for matching tagnames */
			if (current.tagName !== active.tagName) {
				this.report(
					event.target,
					`Mismatched close-tag, expected '</${active.tagName}>' but found '</${current.tagName}>'.`,
					current.location
				);
			}
		});
	}
}

module.exports = CloseOrder;
