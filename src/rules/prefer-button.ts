import { TagCloseEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

export default class PreferButton extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description: `Prefer to use the generic \`<button>\` element instead of \`<input>\`.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("tag:close", (event: TagCloseEvent) => {
			const node = event.previous;

			/* only handle input elements */
			if (node.tagName !== "input") {
				return;
			}

			const type = node.getAttribute("type");

			/* sanity check: handle missing and boolean attributes */
			if (!type || type.value === null) {
				return;
			}

			if (type.valueMatches(/^(button|submit|reset|image)$/, false)) {
				this.report(
					node,
					`Prefer to use <button> instead of <input type="${type.value}"> when adding buttons`,
					type.valueLocation
				);
			}
		});
	}
}
