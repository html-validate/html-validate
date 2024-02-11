import { type ElementReadyEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

function isRelevant(event: ElementReadyEvent): boolean {
	return event.target.is("input");
}

export default class NoImplicitInputType extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description: ["`<input>` is missing recommended `type` attribute"].join("\n"),
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("element:ready", isRelevant, (event) => {
			const { target } = event;
			const attr = target.getAttribute("type");
			if (!attr) {
				this.report({
					node: event.target,
					message: `<input> is missing recommended "type" attribute`,
				});
			}
		});
	}
}
