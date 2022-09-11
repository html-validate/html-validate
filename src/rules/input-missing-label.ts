import { DOMTree, HtmlElement } from "../dom";
import { DOMReadyEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";
import { isAriaHidden, isHTMLHidden } from "./helper/a11y";

export default class InputMissingLabel extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description: "Labels are associated with the input element and is required for a11y.",
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
		if (isHTMLHidden(elem) || isAriaHidden(elem)) {
			return;
		}

		/* hidden, submit, reset or button should not have label */
		if (elem.is("input")) {
			const type = elem.getAttributeValue("type")?.toLowerCase();
			const ignored = ["hidden", "submit", "reset", "button"];
			if (type && ignored.includes(type)) {
				return;
			}
		}

		let label: HtmlElement[] = [];

		/* try to find label by id */
		if ((label = findLabelById(root, elem.id)).length > 0) {
			this.validateLabel(elem, label);
			return;
		}

		/* try to find parent label (input nested in label) */
		if ((label = findLabelByParent(elem)).length > 0) {
			this.validateLabel(elem, label);
			return;
		}

		this.report(elem, `<${elem.tagName}> element does not have a <label>`);
	}

	/**
	 * Reports error if none of the labels are accessible.
	 */
	private validateLabel(elem: HtmlElement, labels: HtmlElement[]): void {
		const visible = labels.filter(isVisible);
		if (visible.length === 0) {
			this.report(elem, `<${elem.tagName}> element has label but <label> element is hidden`);
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
