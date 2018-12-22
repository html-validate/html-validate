import { Rule } from "../rule";
import { WhitespaceEvent } from "../event";

class NoTrailingWhitespace extends Rule {
	setup(){
		this.on("whitespace", (event: WhitespaceEvent) => {
			if (event.text.match(/^[ \t]+\n$/)){
				this.report(undefined, "Trailing whitespace", event.location);
			}
		});
	}
}

module.exports = NoTrailingWhitespace;
