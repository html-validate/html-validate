import { HtmlElement } from "../dom";
import { DOMReadyEvent } from "../event";
import { Validator } from "../meta";
import { Permitted } from "../meta/element";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

export default class ElementPermittedContent extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description:
				"Some elements has restrictions on what content is allowed. This can include both direct children or descendant elements.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const doc = event.document;
			doc.visitDepthFirst((node: HtmlElement) => {
				const parent = node.parent;

				/* dont verify root element, assume any element is allowed */
				if (!parent || parent.isRootElement()) {
					return;
				}

				/* Run each validation step, stop as soon as any errors are
				 * reported. This is to prevent multiple similar errors on the same
				 * element, such as "<dd> is not permitted content under <span>" and
				 * "<dd> has no permitted ancestors". */
				[
					() => this.validatePermittedContent(node, parent),
					() => this.validatePermittedDescendant(node, parent),
					() => this.validatePermittedAncestors(node),
				].some((fn) => fn());
			});
		});
	}

	private validatePermittedContent(cur: HtmlElement, parent: HtmlElement): boolean {
		/* if parent doesn't have metadata (unknown element) skip checking permitted
		 * content */
		if (!parent.meta) {
			return false;
		}

		const rules = parent.meta.permittedContent ?? null;
		return this.validatePermittedContentImpl(cur, parent, rules);
	}

	private validatePermittedContentImpl(
		cur: HtmlElement,
		parent: HtmlElement,
		rules: Permitted | null
	): boolean {
		if (!Validator.validatePermitted(cur, rules)) {
			this.report(
				cur,
				`Element <${cur.tagName}> is not permitted as content in ${parent.annotatedName}`
			);
			return true;
		}

		/* for transparent elements all of the children must be validated against
		 * the (this elements) parent, i.e. if this node was removed from the DOM it
		 * should still be valid. */
		if (cur.meta && cur.meta.transparent) {
			return cur.childElements
				.map((child: HtmlElement) => {
					return this.validatePermittedContentImpl(child, parent, rules);
				})
				.some(Boolean);
		}

		return false;
	}

	private validatePermittedDescendant(node: HtmlElement, parent: HtmlElement): boolean {
		for (
			let cur: HtmlElement | null = parent;
			cur && !cur.isRootElement();
			cur = cur?.parent ?? null
		) {
			const meta = cur.meta;

			/* ignore checking parent without meta */
			if (!meta) {
				continue;
			}

			const rules = meta.permittedDescendants;
			if (!rules) {
				continue;
			}

			if (Validator.validatePermitted(node, rules)) {
				continue;
			}

			this.report(
				node,
				`Element <${node.tagName}> is not permitted as descendant of ${cur.annotatedName}`
			);
			return true;
		}
		return false;
	}

	private validatePermittedAncestors(node: HtmlElement): boolean {
		if (!node.meta) {
			return false;
		}

		const rules = node.meta.requiredAncestors;
		if (!rules) {
			return false;
		}

		if (!Validator.validateAncestors(node, rules)) {
			this.report(node, `Element <${node.tagName}> requires an "${rules[0]}" ancestor`);
			return true;
		}

		return false;
	}
}
