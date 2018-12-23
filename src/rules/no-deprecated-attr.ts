import { AttributeEvent } from "../event";
import { Rule, RuleDocumentation } from "../rule";

class NoDeprecatedAttr extends Rule {
	documentation(): RuleDocumentation {
		return {
			description: "HTML5 deprecated many old attributes.",
			url: "https://html-validate.org/rules/no-deprecated-attr.html",
		};
	}

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
