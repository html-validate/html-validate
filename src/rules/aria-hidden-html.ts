import { type TagReadyEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

export default class AriaHiddenHtml extends Rule {
	public static override readonly fixable = true;

	public override documentation(): RuleDocumentation {
		return {
			description:
				"`aria-hidden` must not be used on the `<html>` element as it makes the page inaccessible to assistive technology such as screenreaders",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("tag:ready", this.isRelevant, (event: TagReadyEvent) => {
			const { target } = event;

			const attr = target.getAttribute("aria-hidden");
			if (!attr?.valueMatches("true", true)) {
				return;
			}

			this.report({
				node: target,
				message: "aria-hidden must not be used on <html>",
				location: attr.keyLocation,
				fix(fixer) {
					fixer.removeText(attr.location);
				},
			});
		});
	}

	protected isRelevant(this: void, event: TagReadyEvent): boolean {
		return event.target.is("html");
	}
}
