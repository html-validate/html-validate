import { Rule } from "../rule";
import { TagCloseEvent } from "../event";

class CloseAttr extends Rule {
	setup(){
		this.on("tag:close", (event: TagCloseEvent) => {
			/* handle unclosed tags */
			if (typeof event.target === "undefined"){
				return;
			}

			/* ignore self-closed and void */
			if (event.previous === event.target){
				return;
			}

			if (Object.keys(event.target.attr).length > 0){
				this.report(event.target, "Close tags cannot have attributes");
			}
		});
	}
}

module.exports = CloseAttr;
