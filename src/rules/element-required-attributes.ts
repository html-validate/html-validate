import { type TagEndEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

interface RuleContext {
	element: string;
	attribute: string;
}

export default class ElementRequiredAttributes extends Rule<RuleContext> {
	public override documentation(context: RuleContext): RuleDocumentation {
		const docs: RuleDocumentation = {
			description: "Element is missing a required attribute",
			url: ruleDocumentationUrl(__filename),
		};

		if (context) {
			docs.description = `The <${context.element}> element is required to have a "${context.attribute}" attribute.`;
		}

		return docs;
	}

	public setup(): void {
		this.on("tag:end", (event: TagEndEvent) => {
			const node = event.previous;
			const meta = node.meta;

			/* handle missing metadata and missing attributes */
			if (!meta?.attributes) {
				return;
			}

			for (const [key, attr] of Object.entries(meta.attributes)) {
				if (!attr.required) {
					continue;
				}

				if (node.hasAttribute(key)) continue;

				const context: RuleContext = {
					element: node.tagName,
					attribute: key,
				};

				this.report(
					node,
					`${node.annotatedName} is missing required "${key}" attribute`,
					node.location,
					context,
				);
			}
		});
	}
}
