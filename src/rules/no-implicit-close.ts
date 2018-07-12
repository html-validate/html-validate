import { Rule } from '../rule';
import { TagCloseEvent } from '../event';
import { NodeClosed } from '../dom';

class NoImplicitClose extends Rule {
	setup(){
		this.on('tag:close', (event: TagCloseEvent) => {
			const closed = event.previous;
			const by = event.target;

			if (closed.closed !== NodeClosed.ImplicitClosed){
				return;
			}

			if (!by){
				return;
			}

			/* determine if it was closed by parent or sibling */
			const closedByParent = closed.parent.tagName === by.tagName;

			if (closedByParent){
				this.report(closed, `Element <${closed.tagName}> is implicitly closed by parent </${by.tagName}>`, closed.location);
			} else {
				this.report(closed, `Element <${closed.tagName}> is implicitly closed by sibling`, closed.location);
			}
		});
	}
}

module.exports = NoImplicitClose;
