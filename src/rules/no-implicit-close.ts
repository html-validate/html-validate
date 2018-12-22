import { Rule } from "../rule";
import { TagCloseEvent } from "../event";
import { NodeClosed } from "../dom";

class NoImplicitClose extends Rule {
	setup(){
		this.on("tag:close", (event: TagCloseEvent) => {
			const closed = event.previous;
			const by = event.target;

			if (closed.closed !== NodeClosed.ImplicitClosed){
				return;
			}

			const closedByParent = closed.parent.tagName === by.tagName; /* <ul><li></ul> */
			const sameTag = closed.tagName === by.tagName;               /* <p>foo<p>bar */

			if (closedByParent){
				this.report(closed, `Element <${closed.tagName}> is implicitly closed by parent </${by.tagName}>`, closed.location);
			} else if (sameTag) {
				this.report(closed, `Element <${closed.tagName}> is implicitly closed by sibling`, closed.location);
			} else {
				this.report(closed, `Element <${closed.tagName}> is implicitly closed by adjacent <${by.tagName}>`, closed.location);
			}
		});
	}
}

module.exports = NoImplicitClose;
