import { DOMTokenList } from "../dom";
import { AttributeEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

class NoDupClass extends Rule {
	public documentation(): RuleDocumentation {
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

			const classes = new DOMTokenList(event.value);
			const unique: Set<string> = new Set();
			classes.forEach(cur => {
				if (unique.has(cur)) {
					this.report(
						event.target,
						`Class "${cur}" duplicated`,
						event.valueLocation
					);
				}
				unique.add(cur);
			});
		});
	}
}

module.exports = NoDupClass;
