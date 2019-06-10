import { TagCloseEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

class PreferButton extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description: `Prefer to use the generic \`<button>\` element instead of \`<input>\`.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup() {
		this.on("tag:close", (event: TagCloseEvent) => {
			const node = event.previous;

			/* only handle input elements */
			if (node.tagName !== "input") {
				return;
			}

			const type = node.getAttribute("type");
			if (type && type.valueMatches(/^(button|submit|reset|image)$/, false)) {
				this.report(
					node,
					`Prefer to use <button> instead of <input type="${type.value}"> when adding buttons`,
					type.valueLocation
				);
			}
		});
	}
}

module.exports = PreferButton;
