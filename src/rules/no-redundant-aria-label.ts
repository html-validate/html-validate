import { type DOMReadyEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

const selectors = ["input[aria-label]", "textarea[aria-label]", "select[aria-label]"];

export default class NoRedundantAriaLabel extends Rule {
	public override documentation(): RuleDocumentation {
		return {
			description:
				"`aria-label` is redundant when an associated `<label>` element containing the same text exists.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const { document } = event;
			const elements = document.querySelectorAll(selectors.join(","));
			for (const element of elements) {
				const ariaLabel = element.getAttribute("aria-label");
				const id = element.id;
				if (!id) {
					continue;
				}
				const label = document.querySelector(`label[for="${id}"]`);
				if (!ariaLabel || !label || label.textContent.trim() !== ariaLabel.value) {
					continue;
				}
				const message = "aria-label is redundant when label containing same text exists";
				this.report({
					message,
					node: element,
					location: ariaLabel.keyLocation,
				});
			}
		});
	}
}
