import { DOMTokenList } from "../dom";
import { AttributeEvent } from "../event";
import { Rule } from "../rule";

class NoDupClass extends Rule {
	setup(){
		this.on("attr", (event: AttributeEvent) => {
			if (event.key.toLowerCase() !== "class"){
				return;
			}

			const classes = new DOMTokenList(event.value);
			const unique: Set<string> = new Set();
			classes.forEach((cur) => {
				if (unique.has(cur)) {
					this.report(event.target, `Class "${cur}" duplicated`, event.location);
				}
				unique.add(cur);
			});
		});
	}
}

module.exports = NoDupClass;
