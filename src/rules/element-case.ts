import { sliceLocation } from "../context";
import { TagOpenEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";
import { CaseStyle } from "./helper/case-style";

const defaults = {
	style: "lowercase",
};

class ElementCase extends Rule {
	private style: CaseStyle;

	public constructor(options: object) {
		super(Object.assign({}, defaults, options));
		this.style = new CaseStyle(this.options.style, "element-case");
	}

	public documentation(): RuleDocumentation {
		return {
			description: `Element tagname must be ${this.options.style}.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("tag:open", (event: TagOpenEvent) => {
			const letters = event.target.tagName.replace(/[^a-z]+/gi, "");
			if (!this.style.match(letters)) {
				const location = sliceLocation(event.location, 1);
				this.report(
					event.target,
					`Element "${event.target.tagName}" should be ${this.style.name}`,
					location
				);
			}
		});
	}
}

module.exports = ElementCase;
