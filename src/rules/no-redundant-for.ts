import { ElementReadyEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

export default class NoRedundantFor extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description: `When the \`<label>\` element wraps the labelable control the \`for\` attribute is redundant and better left out.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("element:ready", (event: ElementReadyEvent) => {
			const { target } = event;

			/* only handle <label> */
			if (target.tagName !== "label") {
				return;
			}

			/* ignore label without for or dynamic value */
			const attr = target.getAttribute("for");
			if (!attr || attr.isDynamic) {
				return;
			}

			/* try to find labeled control */
			const id = attr.value;
			const control = target.querySelector(`[id="${id}"]`);
			if (!control) {
				return;
			}

			this.report(target, 'Redundant "for" attribute', attr.keyLocation);
		});
	}
}
