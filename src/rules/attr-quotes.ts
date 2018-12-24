import { AttributeEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

const SINGLE_QUOTE = "'";
const DOUBLE_QUOTE = '"';

const defaults = {
	style: "double",
	unquoted: false,
};

class AttrQuotes extends Rule {
	expected: string;

	documentation(): RuleDocumentation {
		return {
			description: `Attribute values are required to be quoted with ${this.options.style}quotes.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	constructor(options: object){
		super(Object.assign({}, defaults, options));
		this.expected = parseStyle(this.options.style);
	}

	setup(){
		this.on("attr", (event: AttributeEvent) => {
			/* ignore attributes with no value */
			if (typeof event.value === "undefined"){
				return;
			}

			if (typeof event.quote === "undefined"){
				if (this.options.unquoted === false){
					this.report(event.target, `Attribute "${event.key}" using unquoted value`);
				}
				return;
			}

			if (event.quote !== this.expected){
				this.report(event.target, `Attribute "${event.key}" used ${event.quote} instead of expected ${this.expected}`);
			}
		});
	}
}

function parseStyle(style: string){
	switch (style.toLowerCase()){
	case "double": return DOUBLE_QUOTE;
	case "single": return SINGLE_QUOTE;
	default: return DOUBLE_QUOTE;
	}
}

module.exports = AttrQuotes;
