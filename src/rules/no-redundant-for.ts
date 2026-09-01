import { generateIdSelector, isStaticAttribute } from "../dom";
import { type ElementReadyEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

export default class NoRedundantFor extends Rule {
	public override documentation(): RuleDocumentation {
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
			if (!attr || !isStaticAttribute(attr)) {
				return;
			}

			/* ignore omitted/empty values */
			const id = attr.value;
			if (!id) {
				return;
			}

			/* try to find labeled control */
			const control = target.querySelector(generateIdSelector(id));
			if (!control) {
				return;
			}

			this.report({
				node: target,
				message: 'Redundant "for" attribute',
				location: attr.keyLocation,
				suggestions: [
					{
						message: 'Remove "for" attribute',
						fix(fixer) {
							fixer.removeText(attr.location, {
								trimStart: true,
							});
						},
					},
					{
						message: 'Remove both "for" and "id" attribute',
						fix(fixer) {
							/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- must have id attribute */
							const idAttr = control.getAttribute("id")!;
							fixer.removeText(attr.location, {
								trimStart: true,
							});
							fixer.removeText(idAttr.location, {
								trimStart: true,
							});
						},
					},
				],
			});
		});
	}
}
