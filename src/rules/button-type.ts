import { DynamicValue, HtmlElement } from "../dom";
import { DOMReadyEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

const validTypes = ["submit", "button", "reset"];

class ButtonType extends Rule {
	documentation(): RuleDocumentation {
		return {
			description:
				'HTML button defaults to `type="submit"` when attribute is missing or invalid which may not be the intended type.\n\nA common side-effect of this is when pressing enter in a form field unexpectedly prevents form submission and instead executes the action this button is bound to.',
			url: ruleDocumentationUrl(__filename),
		};
	}

	setup() {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const buttons = event.document.getElementsByTagName("button");
			buttons.forEach((node: HtmlElement) => {
				const attr = node.getAttribute("type");
				if (attr === null) {
					this.report(node, "Button is missing type attribute");
					return;
				}

				if (attr.value instanceof DynamicValue) {
					return;
				}

				if (validTypes.indexOf(attr.value.toLowerCase()) === -1) {
					this.report(
						node,
						`Button has invalid type "${attr.value}"`,
						attr.keyLocation
					);
				}
			});
		});
	}
}

module.exports = ButtonType;
