import { type ElementReadyEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";
import { type HtmlElement } from "../dom";

export default class MultipleLabeledControls extends Rule {
	private labelable: string = "";

	public documentation(): RuleDocumentation {
		return {
			description: `A \`<label>\` element can only be associated with one control at a time.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.labelable = this.getTagsWithProperty("labelable").join(",");

		this.on("element:ready", (event: ElementReadyEvent) => {
			const { target } = event;

			/* only handle <label> */
			if (target.tagName !== "label") {
				return;
			}

			/* no error if it references 0 or 1 controls */
			const numControls = this.getNumLabledControls(target);
			if (numControls <= 1) {
				return;
			}

			this.report(target, "<label> is associated with multiple controls", target.location);
		});
	}

	private getNumLabledControls(src: HtmlElement): number {
		/* get all controls wrapped by label element */
		const controls = src.querySelectorAll(this.labelable).map((node) => node.id);

		/* only count wrapped controls if the "for" attribute is missing or static,
		 * for dynamic "for" attributes it is better to run in document mode later */
		const attr = src.getAttribute("for");
		if (!attr || attr.isDynamic || !attr.value) {
			return controls.length;
		}

		/* if "for" attribute references a wrapped element it should not be counted
		 * multiple times */
		const redundant = controls.includes(attr.value.toString());
		if (redundant) {
			return controls.length;
		}

		/* has "for" attribute pointing to element outside wrapped controls */
		return controls.length + 1;
	}
}
