import { type HtmlElement } from "../dom";
import { type DOMReadyEvent } from "../event";
import { type CategoryOrTag, Validator } from "../meta";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

interface Context {
	element: string;
	missing: string;
}

function isCategory(value: CategoryOrTag): boolean {
	return value.startsWith("@");
}

export default class ElementRequiredContent extends Rule<Context> {
	public documentation(context: Context): RuleDocumentation {
		const { element, missing } = context;
		return {
			description: `The \`${element}\` element requires a \`${missing}\` to be present as content.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const doc = event.document;
			doc.visitDepthFirst((node: HtmlElement) => {
				/* if element doesn't have metadata (unknown element) skip checking
				 * required content */
				if (!node.meta) {
					return;
				}

				const rules = node.meta.requiredContent;
				if (!rules) {
					return;
				}

				for (const missing of Validator.validateRequiredContent(node, rules)) {
					const context: Context = {
						element: node.annotatedName,
						missing: `<${missing}>`,
					};
					const tag = isCategory(missing) ? `${missing.slice(1)} element` : `<${missing}>`;
					const message = `${node.annotatedName} element must have ${tag} as content`;
					this.report(node, message, null, context);
				}
			});
		});
	}
}
