import { Rule } from "../rule";
import { AttributeEvent } from "../event";
import { parsePattern } from "../pattern";

const defaults = {
	pattern: "kebabcase",
};

class IdPattern extends Rule {
	pattern: RegExp;

	constructor(options: object){
		super(Object.assign({}, defaults, options));
		this.pattern = parsePattern(this.options.pattern);
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
