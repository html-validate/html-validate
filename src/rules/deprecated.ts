import { Rule } from "../rule";
import { TagOpenEvent } from "../event";

class Deprecated extends Rule {
	setup(){
		this.on("tag:open", (event: TagOpenEvent) => {
			const node = event.target;

			/* cannot validate if meta isn't known */
			if (node.meta === null){
				return;
			}

			const deprecated = node.meta.deprecated;
			if (deprecated){
				if (typeof deprecated === "string"){
					this.report(node, `<${node.tagName}> is deprecated: ${deprecated}`);
				} else {
					this.report(node, `<${node.tagName}> is deprecated`);
				}
			}
		});
	}
}

module.exports = Deprecated;
