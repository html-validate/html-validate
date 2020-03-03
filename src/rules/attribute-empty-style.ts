import { Attribute, HtmlElement } from "../dom";
import { DOMReadyEvent } from "../event";
import { PermittedAttribute } from "../meta/element";
import { Rule, RuleDocumentation, ruleDocumentationUrl } from "../rule";

interface Options {
	style?: string;
}

const defaults: Options = {
	style: "omit",
};

type checkFunction = (attr: Attribute) => boolean;

class AttributeEmptyStyle extends Rule<void, Options> {
	private hasInvalidStyle: checkFunction;

	public constructor(options: Options) {
		super(Object.assign({}, defaults, options));
		this.hasInvalidStyle = parseStyle(this.options.style);
	}

	public documentation(): RuleDocumentation {
		return {
			description: "Require a specific style for attributes with empty values.",
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("dom:ready", (event: DOMReadyEvent) => {
			const doc = event.document;
			doc.visitDepthFirst((node: HtmlElement) => {
				const meta = node.meta;

				/* ignore rule if element has no meta or meta does not specify attribute
				 * allowed values */
				if (!meta || !meta.attributes) return;

				/* check all boolean attributes */
				for (const attr of node.attributes) {
					/* only handle attributes which allows empty values */
					if (!allowsEmpty(attr, meta.attributes)) {
						continue;
					}

					/* skip attribute if the attribute is set to non-empty value
					 * (attribute-allowed-values deals with non-empty values)*/
					if (!isEmptyValue(attr)) {
						continue;
					}

					/* skip attribute if the style is valid */
					if (!this.hasInvalidStyle(attr)) {
						continue;
					}

					/* report error */
					this.report(
						node,
						reportMessage(attr, this.options.style),
						attr.keyLocation
					);
				}
			});
		});
	}
}

function allowsEmpty(attr: Attribute, rules: PermittedAttribute): boolean {
	return rules[attr.key] && rules[attr.key].includes("");
}

function isEmptyValue(attr: Attribute): boolean {
	/* dynamic values are ignored, assumed to contain a value */
	if (attr.isDynamic) {
		return false;
	}

	return attr.value === null || attr.value === "";
}

function parseStyle(style: string): checkFunction {
	switch (style.toLowerCase()) {
		case "omit":
			return (attr: Attribute) => attr.value !== null;
		case "empty":
			return (attr: Attribute) => attr.value !== "";
		default:
			throw new Error(
				`Invalid style "${style}" for "attribute-empty-style" rule`
			);
	}
}

function reportMessage(attr: Attribute, style: string): string {
	const key = attr.key;
	switch (style.toLowerCase()) {
		case "omit":
			return `Attribute "${key}" should omit value`;
		case "empty":
			return `Attribute "${key}" value should be empty string`;
	}
	/* istanbul ignore next: the above switch should cover all cases */
	return "";
}

module.exports = AttributeEmptyStyle;
