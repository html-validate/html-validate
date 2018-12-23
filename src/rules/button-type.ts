import { HtmlElement } from "../dom";
import { DOMReadyEvent } from "../event";
import { Rule, RuleDocumentation } from "../rule";

const validTypes = ["submit", "button", "reset"];

class ButtonType extends Rule {
	documentation(): RuleDocumentation {
		return {
			description: "HTML button defaults to type=\"submit\" when attribute is missing or invalid which may not be the intended type.",
			url: "https://html-validate.org/rules/button-type.html",
		};
	}

	setup(){
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const buttons = event.document.getElementsByTagName("button");
			buttons.forEach((node: HtmlElement) => {
				const attr = node.getAttribute("type");
				if (attr === null){
					this.report(node, "Button is missing type attribute");
				} else if (validTypes.indexOf(attr.value.toLowerCase()) === -1){
					this.report(node, `Button has invalid type "${attr.value}"`, attr.location);
				}
			});
		});
	}
}

module.exports = ButtonType;
