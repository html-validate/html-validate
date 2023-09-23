import { type Attribute, type HtmlElement } from "../dom";
import { type DOMReadyEvent } from "../event";
import { type MetaAttribute } from "../meta/element";
import { type RuleDocumentation, type SchemaObject, Rule, ruleDocumentationUrl } from "../rule";

interface RuleOptions {
	style: "omit" | "empty" | "name";
}

const defaults: RuleOptions = {
	style: "omit",
};

type checkFunction = (attr: Attribute) => boolean;

export default class AttributeBooleanStyle extends Rule<void, RuleOptions> {
	private hasInvalidStyle: checkFunction;

	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
		this.hasInvalidStyle = parseStyle(this.options.style);
	}

	public static schema(): SchemaObject {
		return {
			style: {
				enum: ["empty", "name", "omit"],
				type: "string",
			},
		};
	}

	public documentation(): RuleDocumentation {
		return {
			description: "Require a specific style when writing boolean attributes.",
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
				if (!meta?.attributes) return;

				/* check all boolean attributes */
				for (const attr of node.attributes) {
					if (!this.isBoolean(attr, meta.attributes)) continue;

					/* ignore attribute if it is aliased by a dynamic value,
					 * e.g. ng-required or v-bind:required, since it will probably have a
					 * value despite the target attribute is a boolean. The framework is
					 * assumed to handle it properly */
					if (attr.originalAttribute) {
						continue;
					}

					if (this.hasInvalidStyle(attr)) {
						this.report(node, reportMessage(attr, this.options.style), attr.keyLocation);
					}
				}
			});
		});
	}

	public isBoolean(attr: Attribute, rules: Record<string, MetaAttribute>): boolean {
		const meta = rules[attr.key] as MetaAttribute | undefined;
		return Boolean(meta?.boolean);
	}
}

function parseStyle(style: string): checkFunction {
	switch (style.toLowerCase()) {
		case "omit":
			return (attr: Attribute) => attr.value !== null;
		case "empty":
			return (attr: Attribute) => attr.value !== "";
		case "name":
			return (attr: Attribute) => attr.value !== attr.key;
		/* istanbul ignore next: covered by schema validation */
		default:
			throw new Error(`Invalid style "${style}" for "attribute-boolean-style" rule`);
	}
}

function reportMessage(attr: Attribute, style: string): string {
	const key = attr.key;
	switch (style.toLowerCase()) {
		case "omit":
			return `Attribute "${key}" should omit value`;
		case "empty":
			return `Attribute "${key}" value should be empty string`;
		case "name":
			return `Attribute "${key}" should be set to ${key}="${key}"`;
	}
	/* istanbul ignore next: the above switch should cover all cases */
	return "";
}
