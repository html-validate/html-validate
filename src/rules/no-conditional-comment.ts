import { ConditionalEvent } from "../event";
import { Rule } from "../rule";

class NoConditionalComment extends Rule {
	setup(){
		this.on("conditional", (event: ConditionalEvent) => {
			this.report(null, "Use of conditional comments are deprecated", event.location);
		});
	}
}

module.exports = NoConditionalComment;
