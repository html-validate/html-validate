import { Attribute, DOMTree, DynamicValue, HtmlElement } from "../dom";
import { DOMReadyEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

interface Context {
	key: string;
	value: string;
}

const ARIA = ["aria-controls", "aria-describedby", "aria-labelledby"];

export default class NoMissingReferences extends Rule<Context> {
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

			/* verify <input list=".."> */
			for (const node of document.querySelectorAll("input[list]")) {
				const attr = node.getAttribute("list");
				this.validateReference(document, node, attr);
			}

			/* verify WAI-ARIA properties */
			for (const property of ARIA) {
				for (const node of document.querySelectorAll(`[${property}]`)) {
					const attr = node.getAttribute(property);
					this.validateReference(document, node, attr);
				}
			}
		});
	}

	protected validateReference(document: DOMTree, node: HtmlElement, attr: Attribute | null): void {
		/* sanity check: querySelector should never return elements without the attribute */
		/* istanbul ignore next */
		if (!attr) {
			return;
		}

		const id = attr.value;

		if (id instanceof DynamicValue || id === null || id === "") {
			return;
		}

		const nodes = document.querySelectorAll(`[id="${id}"]`);
		if (nodes.length === 0) {
			const context: Context = { key: attr.key, value: id };
			this.report(node, `Element references missing id "${id}"`, attr.valueLocation, context);
		}
	}
}
