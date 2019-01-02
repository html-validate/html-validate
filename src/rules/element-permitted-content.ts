import { HtmlElement } from "../dom";
import { DOMReadyEvent } from "../event";
import { Validator } from "../meta";
import { Permitted } from "../meta/element";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

class ElementPermittedContent extends Rule {
	documentation(): RuleDocumentation {
		return {
			description:
				"Some elements has restrictions on what content is allowed. This can include both direct children or descendant elements.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	setup() {
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

				this.validatePermittedContent(node, parent, rules);
				this.validatePermittedDescendant(node, parent);
			});
		});
	}

	validatePermittedContent(
		cur: HtmlElement,
		parent: HtmlElement,
		rules: Permitted
	): void {
		if (!Validator.validatePermitted(cur, rules)) {
			this.report(
				cur,
				`Element <${cur.tagName}> is not permitted as content in <${
					parent.tagName
				}>`
			);
			return;
		}

		/* for transparent elements all of the children must be validated against
		 * the (this elements) parent, i.e. if this node was removed from the DOM it
		 * should still be valid. */
		if (cur.meta && cur.meta.transparent) {
			cur.children.forEach((child: HtmlElement) => {
				this.validatePermittedContent(child, parent, rules);
			});
		}
	}

	validatePermittedDescendant(node: HtmlElement, parent: HtmlElement): void {
		while (!parent.isRootElement()) {
			if (
				parent.meta &&
				node.meta &&
				!Validator.validatePermitted(node, parent.meta.permittedDescendants)
			) {
				this.report(
					node,
					`Element <${node.tagName}> is not permitted as descendant of <${
						parent.tagName
					}>`
				);
				return;
			}
			parent = parent.parent;
		}
	}
}

module.exports = ElementPermittedContent;
