import { type HtmlElement } from "../dom";
import { type DOMReadyEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

export default class MultipleLabeledControls extends Rule {
	private labelable: string = "";

	public override documentation(): RuleDocumentation {
		return {
			description: `A \`<label>\` element can only be associated with one control at a time.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.labelable = this.getTagsWithProperty("labelable").join(",");

		this.on("dom:ready", (event: DOMReadyEvent) => {
			const { document } = event;
			const labels = document.querySelectorAll("label");
			for (const label of labels) {
				/* no error if it references 0 or 1 controls */
				const numControls = this.getNumLabledControls(label);
				if (numControls <= 1) {
					continue;
				}

				this.report(label, "<label> is associated with multiple controls", label.location);
			}
		});
	}

	private getNumLabledControls(src: HtmlElement): number {
		/* get all controls wrapped by label element */
		const controls = src
			.querySelectorAll(this.labelable)
			.filter((node) => node.meta?.labelable)
			.map((node) => node.id);

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
