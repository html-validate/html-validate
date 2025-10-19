import { type ElementReadyEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

function isRelevant(event: ElementReadyEvent): boolean {
	return event.target.is("button");
}

export default class NoImplicitButtonType extends Rule {
	public override documentation(): RuleDocumentation {
		return {
			description: [
				"`<button>` is missing recommended `type` attribute",
				"",
				"When the `type` attribute is omitted it defaults to `submit`.",
				"Submit buttons are triggered when a keyboard user presses <kbd>Enter</kbd>.",
				"",
				"As this may or may not be inteded this rule enforces that the `type` attribute be explicitly set to one of the valid types:",
				"",
				"- `button` - a generic button.",
				"- `submit` - a submit button.",
				"- `reset`- a button to reset form fields.",
			].join("\n"),
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
					message: `<button> is missing recommended "type" attribute`,
				});
			}
		});
	}
}
