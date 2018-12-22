import { Rule } from "../rule";
import { DOMReadyEvent } from "../event";

class NoDupID extends Rule {
	setup(){
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const existing: { [key: string]: boolean } = {};
			const elements = event.document.querySelectorAll("[id]");
			elements.forEach(el => {
				if (el.id in existing){
					this.report(el, `Duplicate ID "${el.id}"`);
				}
				existing[el.id] = true;
			});
		});
	}
}

module.exports = NoDupID;
