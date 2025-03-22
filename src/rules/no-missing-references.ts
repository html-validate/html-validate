import {
	type Attribute,
	type DOMTree,
	type HtmlElement,
	DOMTokenList,
	DynamicValue,
	generateIdSelector,
} from "../dom";
import { type DOMReadyEvent } from "../event";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

interface Context {
	key: string;
	value: string;
}

interface AriaAttribute {
	property: string;
	isList: boolean;
}

const ARIA: AriaAttribute[] = [
	{ property: "aria-activedescendant", isList: false },
	{ property: "aria-controls", isList: true },
	{ property: "aria-describedby", isList: true },
	{ property: "aria-details", isList: false },
	{ property: "aria-errormessage", isList: false },
	{ property: "aria-flowto", isList: true },
	{ property: "aria-labelledby", isList: true },
	{ property: "aria-owns", isList: true },
];

function idMissing(document: DOMTree, id: string): boolean {
	const nodes = document.querySelectorAll(generateIdSelector(id));
	return nodes.length === 0;
}

export default class NoMissingReferences extends Rule<Context> {
	public documentation(context: Context): RuleDocumentation {
		return {
			description: `The element ID "${context.value}" referenced by the ${context.key} attribute must point to an existing element.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const document = event.document;

			/* verify <label for=".."> */
			for (const node of document.querySelectorAll("label[for]")) {
				const attr = node.getAttribute("for");
				this.validateReference(document, node, attr, false);
			}

			/* verify <input list=".."> */
			for (const node of document.querySelectorAll("input[list]")) {
				const attr = node.getAttribute("list");
				this.validateReference(document, node, attr, false);
			}

			/* verify WAI-ARIA properties */
			for (const { property, isList } of ARIA) {
				for (const node of document.querySelectorAll(`[${property}]`)) {
					const attr = node.getAttribute(property);
					this.validateReference(document, node, attr, isList);
				}
			}
		});
	}

	protected validateReference(
		document: DOMTree,
		node: HtmlElement,
		attr: Attribute | null,
		isList: boolean,
	): void {
		/* sanity check: querySelector should never return elements without the attribute */
		/* istanbul ignore next */
		if (!attr) {
			return;
		}

		/* skip dynamic and empty values */
		const value = attr.value;
		if (value instanceof DynamicValue || value === null || value === "") {
			return;
		}

		if (isList) {
			this.validateList(document, node, attr, value);
		} else {
			this.validateSingle(document, node, attr, value);
		}
	}

	protected validateSingle(
		document: DOMTree,
		node: HtmlElement,
		attr: Attribute,
		id: string,
	): void {
		if (idMissing(document, id)) {
			const context: Context = { key: attr.key, value: id };
			this.report(node, `Element references missing id "${id}"`, attr.valueLocation, context);
		}
	}

	protected validateList(
		document: DOMTree,
		node: HtmlElement,
		attr: Attribute,
		values: string,
	): void {
		const parsed = new DOMTokenList(values, attr.valueLocation);
		for (const entry of parsed.iterator()) {
			const id = entry.item;
			if (idMissing(document, id)) {
				const context: Context = { key: attr.key, value: id };
				this.report(node, `Element references missing id "${id}"`, entry.location, context);
			}
		}
	}
}
