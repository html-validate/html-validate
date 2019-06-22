import { HtmlElement } from "../dom";
import { DOMReadyEvent } from "../event";
import { Validator } from "../meta";
import { Permitted } from "../meta/element";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

class ElementPermittedContent extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description:
				"Some elements has restrictions on what content is allowed. This can include both direct children or descendant elements.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup() {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const doc = event.document;
			doc.visitDepthFirst((node: HtmlElement) => {
				/* dont verify root element, assume any element is allowed */
				if (node.parent.isRootElement()) {
					return;
				}

				/* if parent doesn't have metadata (unknown element) skip checking permitted
				 * content */
				if (!node.parent.meta) {
					return;
				}

				const parent = node.parent;
				const rules = parent.meta.permittedContent;

				/* Run each validation step, stop as soon as any errors are
				 * reported. This is to prevent multiple similar errors on the same
				 * element, such as "<dd> is not permitted content under <span>" and
				 * "<dd> has no permitted ancestors". */
				[
					() => this.validatePermittedContent(node, parent, rules),
					() => this.validatePermittedDescendant(node, parent),
					() => this.validatePermittedAncestors(node),
				].some(fn => fn());
			});
		});
	}

	private validatePermittedContent(
		cur: HtmlElement,
		parent: HtmlElement,
		rules: Permitted
	): boolean {
		if (!Validator.validatePermitted(cur, rules)) {
			this.report(
				cur,
				`Element <${cur.tagName}> is not permitted as content in <${parent.tagName}>`
			);
			return true;
		}

		/* for transparent elements all of the children must be validated against
		 * the (this elements) parent, i.e. if this node was removed from the DOM it
		 * should still be valid. */
		if (cur.meta && cur.meta.transparent) {
			return cur.childElements
				.map((child: HtmlElement) => {
					return this.validatePermittedContent(child, parent, rules);
				})
				.some(Boolean);
		}

		return false;
	}

	private validatePermittedDescendant(
		node: HtmlElement,
		parent: HtmlElement
	): boolean {
		while (!parent.isRootElement()) {
			if (
				parent.meta &&
				node.meta &&
				!Validator.validatePermitted(node, parent.meta.permittedDescendants)
			) {
				this.report(
					node,
					`Element <${node.tagName}> is not permitted as descendant of <${parent.tagName}>`
				);
				return true;
			}
			parent = parent.parent;
		}
		return false;
	}

	private validatePermittedAncestors(node: HtmlElement): boolean {
		if (!node.meta) {
			return false;
		}
		const rules = node.meta.requiredAncestors;
		if (!Validator.validateAncestors(node, rules)) {
			this.report(
				node,
				`Element <${node.tagName}> requires an "${rules[0]}" ancestor`
			);
			return true;
		}
		return false;
	}
}

module.exports = ElementPermittedContent;
