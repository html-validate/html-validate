import { HtmlElement } from "../dom";
import { DOMReadyEvent } from "../event";
import { Validator } from "../meta";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

interface Context {
	element: string;
	attribute: string;
	value: string;
	allowed: Array<string | RegExp>;
}

class AttributeAllowedValues extends Rule<Context> {
	documentation(context?: Context): RuleDocumentation {
		const docs: RuleDocumentation = {
			description: "Attribute has invalid value.",
			url: ruleDocumentationUrl(__filename),
		};
		if (context) {
			const allowed = context.allowed.map(
				(val: string | RegExp) => `- \`${val}\``
			);
			docs.description = `Element <${
				context.element
			}> does not allow attribute \`${
				context.attribute
			}\` to have the value \`${
				context.value
			}\`, it must match one of the following:\n\n${allowed.join("\n")}`;
		}
		return docs;
	}

	setup() {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const doc = event.document;
			doc.visitDepthFirst((node: HtmlElement) => {
				const meta = node.meta;

				/* ignore rule if element has no meta or meta does not specify attribute
				 * allowed values */
				if (!meta || !meta.attributes) return;

				for (const [key, attr] of Object.entries(node.attr)) {
					if (!Validator.validateAttribute(key, attr.value, meta.attributes)) {
						const context: Context = {
							element: node.tagName,
							attribute: attr.key,
							value: attr.value.toString(),
							allowed: meta.attributes[key],
						};
						this.report(
							node,
							`Attribute "${key}" has invalid value "${attr.value}"`,
							attr.valueLocation,
							context
						);
					}
				}
			});
		});
	}
}

module.exports = AttributeAllowedValues;
