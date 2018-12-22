import { WhitespaceEvent } from "../event";
import { Rule } from "../rule";

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
