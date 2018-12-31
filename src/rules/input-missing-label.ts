import { DOMTree, HtmlElement } from "../dom";
import { DOMReadyEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

class InputMissingLabel extends Rule {
	documentation(): RuleDocumentation {
		return {
			description: "Labels are associated with the input element and is required for a17y.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	setup(){
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const root = event.document;
			for (const elem of root.getElementsByTagName("input")){

				/* try to find label by id */
				if (findLabelById(root, elem.id)){
					continue;
				}

				/* try to find parent label (input nested in label) */
				if (findLabelByParent(elem)){
					continue;
				}

				this.report(elem, "Input element does not have a label");
			}
		});
	}
}

function findLabelById(root: DOMTree, id: string): HtmlElement {
	if (!id) return null;
	return root.find((node: HtmlElement) => node.is("label") && node.getAttributeValue("for") === id);
}

function findLabelByParent(el: HtmlElement): HtmlElement {
	let cur = el.parent;
	while (cur){
		if (cur.is("label")){
			return cur;
		}
		cur = cur.parent;
	}
	return null;
}

module.exports = InputMissingLabel;
