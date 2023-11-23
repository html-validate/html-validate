import { type Location } from "../context";
import { NodeClosed } from "../dom";
import { type TagEndEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

export default class CloseOrder extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description: "HTML requires elements to be closed in the same order as they were opened.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("tag:end", (event: TagEndEvent) => {
			const current = event.target; // The current element being closed
			const active = event.previous; // The current active element (that is, the current element on the stack)

			/* handle unclosed tags */
			if (!current) {
				this.report(
					null,
					`Missing close-tag, expected '</${active.tagName}>' but document ended before it was found.`,
					event.location,
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
			if (active.isRootElement()) {
				const location: Location = {
					filename: current.location.filename,
					line: current.location.line,
					column: current.location.column,
					offset: current.location.offset,
					size: current.tagName.length + 1,
				};
				this.report(null, "Unexpected close-tag, expected opening tag.", location);
				return;
			}

			/* check for matching tagnames */
			if (current.tagName !== active.tagName) {
				this.report(
					null,
					`Mismatched close-tag, expected '</${active.tagName}>' but found '</${current.tagName}>'.`,
					current.location,
				);
			}
		});
	}
}
