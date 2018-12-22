import { AttributeEvent } from "../event";
import { Rule } from "../rule";

class NoDupAttr extends Rule {
	setup(){
		let attr: { [key: string]: boolean } = {};

		this.on("tag:open", () => {
			/* reset any time a new tag is opened */
			attr = {};
		});

		this.on("attr", (event: AttributeEvent) => {
			const name = event.key.toLowerCase();
			if (name in attr){
				this.report(event.target, `Attribute "${name}" duplicated`);
			}
			attr[event.key] = true;
		});
	}
}

module.exports = NoDupAttr;
