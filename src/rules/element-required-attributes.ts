import { type HtmlElement } from "../dom";
import { type TagEndEvent } from "../event";
import { type MetaAttribute } from "../meta";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

export interface RuleContext {
	tagName: string;
	attr: string;
}

const defaultMessage = `{{ tagName }} is missing required "{{ attr }}" attribute`;

/**
 * Normalizes the required meta attribute:
 *
 * If the property is a literal:
 *
 * - `true` the default error message is returned.
 * - anything else `false` is returned.
 *
 * If the property is a callback the callback is evaluated and if the result is:
 *
 * - `true` the default error message is returned.
 * - falsy values (such as `false` or `null`) are returned as `false`
 * - non-empty string the string is returned as-is.
 */
function normalizeRequired(element: HtmlElement, attr: MetaAttribute): string | false {
	const { required } = attr;
	if (typeof required === "function") {
		const result = required(element._adapter);
		switch (result) {
			case undefined:
			case null:
			case false:
			case "":
				return false;
			case true:
				return defaultMessage;
			default:
				return result;
		}
	} else {
		return required ? defaultMessage : false;
	}
}

export default class ElementRequiredAttributes extends Rule<RuleContext> {
	public override documentation(context: RuleContext): RuleDocumentation {
		return {
			description: `The \`${context.tagName}\` element is required to have a \`${context.attr}\` attribute.`,
			url: ruleDocumentationUrl(__filename),
		};
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
				const required = normalizeRequired(node, attr);

				if (!required) {
					continue;
				}

				this.validateRequiredAttribute(node, key, required);
			}
		});
	}

	private validateRequiredAttribute(node: HtmlElement, attr: string, message: string): void {
		if (node.hasAttribute(attr)) {
			return;
		}

		const context: RuleContext = {
			tagName: node.annotatedName,
			attr,
		};

		this.report({
			node,
			message,
			location: node.location,
			context,
		});
	}
}
