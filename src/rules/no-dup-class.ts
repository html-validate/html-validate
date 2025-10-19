import { DOMTokenList } from "../dom";
import { type AttributeEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

export default class NoDupClass extends Rule {
	public override documentation(): RuleDocumentation {
		return {
			description: "Prevents unnecessary duplication of class names.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("attr", (event: AttributeEvent) => {
			if (event.key.toLowerCase() !== "class") {
				return;
			}

			const classes = new DOMTokenList(event.value, event.valueLocation);
			const unique = new Set<string>();
			classes.forEach((cur: string, index: number) => {
				if (unique.has(cur)) {
					const location = classes.location(index);
					this.report(event.target, `Class "${cur}" duplicated`, location);
				}
				unique.add(cur);
			});
		});
	}
}
