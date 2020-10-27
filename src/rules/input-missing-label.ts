import { DOMTree, HtmlElement } from "../dom";
import { DOMReadyEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";
import { isAriaHidden, isHTMLHidden } from "./helper/a17y";

export default class InputMissingLabel extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description: "Labels are associated with the input element and is required for a17y.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const root = event.document;
			for (const elem of root.querySelectorAll("input, textarea, select")) {
				if (isHTMLHidden(elem) || isAriaHidden(elem)) {
					continue;
				}

				/* <input type="hidden"> should not have label */
				if (elem.is("input")) {
					const type = elem.getAttributeValue("type");
					if (type && type.toLowerCase() === "hidden") {
						continue;
					}
				}

				/* try to find label by id */
				if (findLabelById(root, elem.id)) {
					continue;
				}

				/* try to find parent label (input nested in label) */
				if (findLabelByParent(elem)) {
					continue;
				}

				this.report(elem, `<${elem.tagName}> element does not have a <label>`);
			}
		});
	}
}

function findLabelById(root: DOMTree, id: string): HtmlElement {
	if (!id) return null;
	return root.querySelector(`label[for="${id}"]`);
}

function findLabelByParent(el: HtmlElement): HtmlElement {
	let cur = el.parent;
	while (cur) {
		if (cur.is("label")) {
			return cur;
		}
		cur = cur.parent;
	}
	return null;
}
