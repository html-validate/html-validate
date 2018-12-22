import { Rule } from "../rule";
import { HtmlElement } from "../dom";
import { DOMReadyEvent } from "../event";
import { Validator } from "../meta";

class ElementPermittedOrder extends Rule {
	setup(){
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const doc = event.document;
			doc.visitDepthFirst((node: HtmlElement) => {
				if (!node.meta){
					return;
				}

				const rules = node.meta.permittedOrder;
				Validator.validateOrder(node.children, rules, (child: HtmlElement, prev: HtmlElement) => {
					this.report(child, `Element <${child.tagName}> must be used before <${prev.tagName}> in this context`);
				});
			});
		});
	}
}

module.exports = ElementPermittedOrder;
