import { type HtmlElement, generateIdSelector, isStaticAttribute } from "../dom";
import { type DOMReadyEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

function isLabelable(target: HtmlElement): boolean {
	const { meta } = target;
	if (!meta) {
		/* default to being labelable if no metadata is available */
		return true;
	}
	return Boolean(meta.labelable);
}

export default class ValidFor extends Rule {
	public override documentation(): RuleDocumentation {
		return {
			description: `The \`<label>\` \`for\` attribute must reference a labelable form control.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const { document } = event;
			for (const node of document.querySelectorAll("label[for]")) {
				const attr = node.getAttribute("for");

				/* ignore dynamic or missing values */
				if (!isStaticAttribute(attr) || !attr.value) {
					continue;
				}

				/* ignore when we cannot find the referenced element (this might be a
				 * partial document) */
				const selector = generateIdSelector(attr.value);
				const target = document.querySelector(selector);
				if (!target) {
					continue;
				}

				/* ignore when target is labelable */
				if (isLabelable(target)) {
					continue;
				}

				this.report({
					node,
					message: '<label> "for" attribute must reference a labelable form control',
					location: attr.valueLocation,
				});
			}
		});
	}
}
