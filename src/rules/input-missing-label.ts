import { type DOMTree, type HtmlElement } from "../dom";
import { type DOMReadyEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";
import { inAccessibilityTree, isAriaHidden, isHTMLHidden } from "./helper/a11y";
import { hasAccessibleName } from "./helper/has-accessible-name";

function isIgnored(node: HtmlElement): boolean {
	if (node.is("input")) {
		const type = node.getAttributeValue("type")?.toLowerCase();
		const ignored = ["hidden", "submit", "reset", "button"];
		return Boolean(type && ignored.includes(type));
	}
	return false;
}

export default class InputMissingLabel extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description: [
				"Each form element must have an a label or accessible name.",
				'Typically this is implemented using a `<label for="..">` element describing the purpose of the form element.',
				"",
				"This can be resolved in one of the following ways:",
				"",
				'  - Use an associated `<label for="..">` element.',
				"  - Use a nested `<label>` as parent element.",
				"  - Use `aria-label` or `aria-labelledby` attributes.",
			].join("\n"),
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const root = event.document;
			for (const elem of root.querySelectorAll("input, textarea, select")) {
				this.validateInput(root, elem);
			}
		});
	}

	private validateInput(root: DOMTree, elem: HtmlElement): void {
		if (!inAccessibilityTree(elem)) {
			return;
		}

		/* hidden, submit, reset or button should not have label */
		if (isIgnored(elem)) {
			return;
		}

		if (hasAccessibleName(root, elem)) {
			return;
		}

		let label: HtmlElement[] = [];

		/* try to find label by id */
		if ((label = findLabelById(root, elem.id)).length > 0) {
			this.validateLabel(root, elem, label);
			return;
		}

		/* try to find parent label (input nested in label) */
		if ((label = findLabelByParent(elem)).length > 0) {
			this.validateLabel(root, elem, label);
			return;
		}

		if (elem.hasAttribute("aria-label")) {
			this.report(elem, `<${elem.tagName}> element has aria-label but label has no text`);
		} else if (elem.hasAttribute("aria-labelledby")) {
			this.report(
				elem,
				`<${elem.tagName}> element has aria-labelledby but referenced element has no text`,
			);
		} else {
			this.report(elem, `<${elem.tagName}> element does not have a <label>`);
		}
	}

	/**
	 * Reports error if none of the labels are accessible.
	 */
	private validateLabel(root: DOMTree, elem: HtmlElement, labels: HtmlElement[]): void {
		const visible = labels.filter(isVisible);
		if (visible.length === 0) {
			this.report(elem, `<${elem.tagName}> element has <label> but <label> element is hidden`);
			return;
		}
		if (!labels.some((label) => hasAccessibleName(root, label))) {
			this.report(elem, `<${elem.tagName}> element has <label> but <label> has no text`);
		}
	}
}

function isVisible(elem: HtmlElement): boolean {
	const hidden = isHTMLHidden(elem) || isAriaHidden(elem);
	return !hidden;
}

function findLabelById(root: DOMTree, id: string | null): HtmlElement[] {
	if (!id) return [];
	return root.querySelectorAll(`label[for="${id}"]`);
}

function findLabelByParent(el: HtmlElement): HtmlElement[] {
	let cur = el.parent;
	while (cur) {
		if (cur.is("label")) {
			return [cur];
		}
		cur = cur.parent;
	}
	return [];
}
