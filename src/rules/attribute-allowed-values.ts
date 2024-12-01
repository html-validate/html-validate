import { type Location } from "../context";
import { type HtmlElement, type Attribute } from "../dom";
import { type DOMReadyEvent } from "../event";
import { type MetaAttribute, Validator } from "../meta";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";
import { walk } from "../utils/walk";

interface Context {
	element: string;
	attribute: string;
	value: string;
	allowed: Pick<MetaAttribute, "enum" | "boolean">;
}

function pick(attr: MetaAttribute): Pick<MetaAttribute, "enum" | "boolean"> {
	const result: Pick<MetaAttribute, "enum" | "boolean"> = {};
	if (typeof attr.enum !== "undefined") {
		result.enum = attr.enum;
	}
	if (typeof attr.boolean !== "undefined") {
		result.boolean = attr.boolean;
	}
	return result;
}

export default class AttributeAllowedValues extends Rule<Context> {
	public documentation(context?: Context): RuleDocumentation {
		const docs: RuleDocumentation = {
			description: "Attribute has invalid value.",
			url: ruleDocumentationUrl(__filename),
		};
		if (!context) {
			return docs;
		}

		const { allowed, attribute, element, value } = context;
		if (allowed.enum) {
			const allowedList = allowed.enum.map((value: string | RegExp) => {
				if (typeof value === "string") {
					return `- \`"${value}"\``;
				} else {
					return `- \`${value.toString()}\``;
				}
			});
			docs.description = [
				`The \`<${element}>\` element does not allow the attribute \`${attribute}\` to have the value \`"${value}"\`.`,
				"",
				"It must match one of the following:",
				"",
				...allowedList,
			].join("\n");
		} else if (allowed.boolean) {
			docs.description = `The \`<${context.element}>\` attribute \`${context.attribute}\` must be a boolean attribute, e.g. \`<${context.element} ${context.attribute}>\``;
		}

		return docs;
	}

	public setup(): void {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const doc = event.document;
			walk.depthFirst(doc, (node: HtmlElement) => {
				const meta = node.meta;

				/* ignore rule if element has no meta or meta does not specify attribute
				 * allowed values */
				if (!meta?.attributes) return;

				for (const attr of node.attributes) {
					if (Validator.validateAttribute(attr, meta.attributes)) {
						continue;
					}

					const value = attr.value ? attr.value.toString() : "";
					const context: Context = {
						element: node.tagName,
						attribute: attr.key,
						value,
						allowed: pick(meta.attributes[attr.key]),
					};
					const message = this.getMessage(attr);
					const location = this.getLocation(attr);
					this.report(node, message, location, context);
				}
			});
		});
	}

	private getMessage(attr: Attribute): string {
		const { key, value } = attr;
		if (value !== null) {
			return `Attribute "${key}" has invalid value "${value.toString()}"`;
		} else {
			return `Attribute "${key}" is missing value`;
		}
	}

	private getLocation(attr: Attribute): Location {
		return attr.valueLocation ?? attr.keyLocation;
	}
}
