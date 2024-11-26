import { type Location } from "../context";
import { type DOMInternalID, type HtmlElement, NodeClosed } from "../dom";
import { type TagEndEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

/**
 * Get all ancestors (including given node),
 */
function* ancestors(node: HtmlElement | null): Generator<HtmlElement, void> {
	/* istanbul ignore next: cant really happen (as it means there is no node) but
	 * provides a safe sane fallback just in case. the issue comes from the typing
	 * of `parent` which could be `null` but unless this runs in a stubbed
	 * environment the DOM nodes will have parents. */
	if (!node) {
		return;
	}
	let ancestor: HtmlElement | null = node;
	while (ancestor && !ancestor.isRootElement()) {
		yield ancestor;
		ancestor = ancestor.parent;
	}
	if (ancestor) {
		yield ancestor;
	}
}

/**
 * Find closest ancestor matching predicate.
 */
function findAncestor(
	node: HtmlElement | null,
	predicate: (node: HtmlElement) => boolean,
): HtmlElement | null {
	for (const ancestor of ancestors(node)) {
		if (predicate(ancestor)) {
			return ancestor;
		}
	}
	return null;
}

export default class CloseOrder extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description: "HTML requires elements to be closed in the same order as they were opened.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		let reported: Set<number>;
		this.on("parse:begin", () => {
			reported = new Set<DOMInternalID>();
		});

		/* handle unclosed tags */
		this.on("tag:end", (event: TagEndEvent) => {
			const current = event.target; // The current element being closed
			const active = event.previous; // The current active element (that is, the current element on the stack)

			if (current) {
				return;
			}

			for (const ancestor of ancestors(active)) {
				if (ancestor.isRootElement() || reported.has(ancestor.unique)) {
					continue;
				}
				this.report(ancestor, `Unclosed element '<${ancestor.tagName}>'`, ancestor.location);
				reported.add(ancestor.unique);
			}
		});

		/* handle stray tags */
		/* eslint-disable-next-line complexity -- lots of needed ifs'n buts */
		this.on("tag:end", (event: TagEndEvent) => {
			const current = event.target; // The current element being closed
			const active = event.previous; // The current active element (that is, the current element on the stack)

			if (!current) {
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
				this.report(null, `Stray end tag '</${current.tagName}>'`, location);
				return;
			}

			/* check for matching tagnames */
			if (current.tagName === active.tagName) {
				return;
			}

			const ancestor = findAncestor(active.parent, (node) => node.is(current.tagName));
			if (ancestor && !ancestor.isRootElement()) {
				for (const element of ancestors(active)) {
					if (ancestor.isSameNode(element)) {
						break;
					}
					if (reported.has(element.unique)) {
						continue;
					}
					this.report(element, `Unclosed element '<${element.tagName}>'`, element.location);
					reported.add(element.unique);
				}
				this.report(
					null,
					`End tag '</${current.tagName}>' seen but there were open elements`,
					current.location,
				);
				reported.add(ancestor.unique);
			} else {
				this.report(null, `Stray end tag '</${current.tagName}>'`, current.location);
			}
		});
	}
}
