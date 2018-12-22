import { DOMReadyEvent } from "../event";
import { Rule } from "../rule";

class MissingDoctype extends Rule {
	setup(){
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const dom = event.document;
			if (!dom.doctype){
				this.report(dom.root, "Document is missing doctype");
			}
		});
	}
}

module.exports = MissingDoctype;
