import { Attribute, DOMTree, DynamicValue, HtmlElement } from "../dom";
import { DOMReadyEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

interface Context {
	key: string;
	value: string;
}

class NoMissingReferences extends Rule<Context> {
	public documentation(context: Context): RuleDocumentation {
		if (context) {
			return {
				description: `The element ID "${context.value}" referenced by the ${context.key} attribute must point to an existing element.`,
				url: ruleDocumentationUrl(__filename),
			};
		} else {
			return {
				description: `The element ID referenced by the attribute must point to an existing element.`,
				url: ruleDocumentationUrl(__filename),
			};
		}
	}

	public setup(): void {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const document = event.document;

			/* verify <label for=".."> */
			for (const node of document.querySelectorAll("label[for]")) {
				const attr = node.getAttribute("for");
				this.validateReference(document, node, attr);
			}

			/* verify <ANY aria-labelledby=".."> */
			for (const node of document.querySelectorAll("[aria-labelledby]")) {
				const attr = node.getAttribute("aria-labelledby");
				this.validateReference(document, node, attr);
			}

			/* verify <ANY aria-describedby=".."> */
			for (const node of document.querySelectorAll("[aria-describedby]")) {
				const attr = node.getAttribute("aria-describedby");
				this.validateReference(document, node, attr);
			}
		});
	}

	protected validateReference(
		document: DOMTree,
		node: HtmlElement,
		attr: Attribute
	): void {
		const id = attr.value;

		if (id instanceof DynamicValue || id === "") {
			return;
		}

		const nodes = document.querySelectorAll(`[id="${id}"]`);
		if (nodes.length === 0) {
			const context: Context = { key: attr.key, value: id };
			this.report(
				node,
				`Element references missing id "${id}"`,
				attr.valueLocation,
				context
			);
		}
	}
}

module.exports = NoMissingReferences;
