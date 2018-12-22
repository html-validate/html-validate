import { Rule } from "../rule";
import { AttributeEvent } from "../event";

class NoDeprecatedAttr extends Rule {
	setup(){
		this.on("attr", (event: AttributeEvent) => {
			const node = event.target;
			const meta = node.meta;
			const attr = event.key.toLowerCase();

			/* cannot validate if meta isn't known */
			if (meta === null){
				return;
			}

			const deprecated = meta.deprecatedAttributes || [];
			if (deprecated.indexOf(attr) >= 0){
				this.report(node, `Attribute "${event.key}" is deprecated on <${node.tagName}> element`);
			}
		});
	}
}

module.exports = NoDeprecatedAttr;
