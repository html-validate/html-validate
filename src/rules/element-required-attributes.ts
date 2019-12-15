import { TagCloseEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

interface Context {
	element: string;
	attribute: string;
}

class ElementRequiredAttributes extends Rule<Context> {
	public documentation(context?: Context): RuleDocumentation {
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
		this.on("tag:close", (event: TagCloseEvent) => {
			const node = event.previous;
			const meta = node.meta;
			if (!meta || !meta.requiredAttributes) return;

			for (const key of meta.requiredAttributes) {
				if (node.hasAttribute(key)) continue;

				const context: Context = {
					element: node.tagName,
					attribute: key,
				};

				this.report(
					node,
					`${node.annotatedName} is missing required "${key}" attribute`,
					node.location,
					context
				);
			}
		});
	}
}

module.exports = ElementRequiredAttributes;
