import { AttributeEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

export default class NoDupAttr extends Rule {
	public documentation(): RuleDocumentation {
		return {
			description: "HTML disallows two or more attributes with the same (case-insensitive) name.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		let attr: { [key: string]: boolean } = {};

		this.on("tag:start", () => {
			/* reset any time a new tag is opened */
			attr = {};
		});

		this.on("attr", (event: AttributeEvent) => {
			/* ignore dynamic attributes aliasing another, e.g class and ng-class */
			if (event.originalAttribute) {
				return;
			}

			const name = event.key.toLowerCase();
			if (name in attr) {
				this.report(event.target, `Attribute "${name}" duplicated`);
			}
			attr[event.key] = true;
		});
	}
}
