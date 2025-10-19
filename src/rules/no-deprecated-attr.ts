import { type AttributeEvent } from "../event";
import { type MetaAttribute } from "../meta";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

export default class NoDeprecatedAttr extends Rule {
	public override documentation(): RuleDocumentation {
		return {
			description: "HTML5 deprecated many old attributes.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("attr", (event: AttributeEvent) => {
			const node = event.target;
			const meta = node.meta;
			const attr = event.key.toLowerCase();

			/* cannot validate if meta isn't known */
			if (meta === null) {
				return;
			}

			const metaAttribute = meta.attributes[attr] as MetaAttribute | undefined;
			if (!metaAttribute) {
				return;
			}

			const deprecated = metaAttribute.deprecated;
			if (deprecated) {
				this.report(
					node,
					`Attribute "${event.key}" is deprecated on <${node.tagName}> element`,
					event.keyLocation,
				);
			}
		});
	}
}
