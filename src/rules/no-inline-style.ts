import { Rule } from "../rule";
import { AttributeEvent } from "../event";

class NoInlineStyle extends Rule {
	setup(){
		this.on("attr", (event: AttributeEvent) => {
			if (event.key === "style"){
				this.report(event.target, "Inline style is not allowed");
			}
		});
	}
}

module.exports = NoInlineStyle;
