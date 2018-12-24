import { TagOpenEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

const defaults = {
	style: "lowercase",
};

class ElementCase extends Rule {
	pattern: RegExp;
	lettercase: string;

	constructor(options: object){
		super(Object.assign({}, defaults, options));
		[this.pattern, this.lettercase] = parseStyle(this.options.style);
	}

	documentation(): RuleDocumentation {
		return {
			description: `Element tagname must be ${this.options.style}.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	setup(){
		this.on("tag:open", (event: TagOpenEvent) => {
			const letters = event.target.tagName.replace(/[^a-z]+/ig, "");
			if (!letters.match(this.pattern)){
				this.report(event.target, `Element "${event.target.tagName}" should be ${this.lettercase}`);
			}
		});
	}
}

function parseStyle(style: string): [RegExp, string] {
	switch (style.toLowerCase()){
	case "lowercase": return [/^[a-z]*$/, "lowercase"];
	case "uppercase": return [/^[A-Z]*$/, "uppercase"];
	default:
		throw new Error(`Invalid style "${style}" for "element-case" rule`);
	}
}

module.exports = ElementCase;
