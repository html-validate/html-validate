import { AttributeEvent } from "../event";
import { parsePattern } from "../pattern";
import { Rule, RuleDocumentation } from "../rule";

const defaults = {
	pattern: "kebabcase",
};

class IdPattern extends Rule {
	pattern: RegExp;

	constructor(options: object){
		super(Object.assign({}, defaults, options));
		this.pattern = parsePattern(this.options.pattern);
	}

	documentation(): RuleDocumentation {
		return {
			description: "Requires all IDs to match a given pattern.",
			url: "https://html-validate.org/rules/id-pattern.html",
		};
	}

	setup(){
		this.on("attr", (event: AttributeEvent) => {
			if (event.key.toLowerCase() !== "id"){
				return;
			}

			if (!event.value.match(this.pattern)){
				this.report(event.target, `ID "${event.value}" does not match required pattern "${this.pattern}"`);
			}
		});
	}
}

module.exports = IdPattern;
