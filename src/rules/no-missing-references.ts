import {
	type Attribute,
	type DOMTree,
	type HtmlElement,
	DOMTokenList,
	DynamicValue,
	generateIdSelector,
} from "../dom";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";
import { walk } from "../utils/walk";

interface Context {
	key: string;
	value: string;
}

function idMissing(document: DOMTree, id: string): boolean {
	const nodes = document.querySelectorAll(generateIdSelector(id));
	return nodes.length === 0;
}

export default class NoMissingReferences extends Rule<Context> {
	public override documentation(context: Context): RuleDocumentation {
		return {
			description: `The element ID "${context.value}" referenced by the ${context.key} attribute must point to an existing element.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("dom:ready", (event) => {
			const document = event.document;
			walk.depthFirst(document, (node) => {
				const meta = node.meta;

				if (!meta?.attributes) {
					return;
				}

				for (const attr of node.attributes) {
					const attrMeta = meta.attributes[attr.key];
					/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- attr.key may not exist in meta.attributes but the type does not reflect this */
					if (attrMeta?.reference === "id") {
						this.validateReference(document, node, attr, attrMeta.list ?? false);
					}
				}
			});
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
