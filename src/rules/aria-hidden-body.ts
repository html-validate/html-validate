import { type TagReadyEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

export default class AriaHiddenBody extends Rule {
	public override documentation(): RuleDocumentation {
		return {
			description:
				"`aria-hidden` must not be used on the `<body>` element as it makes the page inaccessible to assistive technology such as screenreaders",
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

			this.report(target, "aria-hidden must not be used on <body>", attr.keyLocation);
		});
	}

	protected isRelevant(this: void, event: TagReadyEvent): boolean {
		return event.target.is("body");
	}
}
