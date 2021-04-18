import { DynamicValue } from "../dom";
import { AttributeEvent } from "../event";
import { Rule, RuleDocumentation, ruleDocumentationUrl, SchemaObject } from "../rule";

interface CSSDeclaration {
	property: string;
	value: string;
}

export interface RuleOptions {
	include: string[] | null;
	exclude: string[] | null;
	allowedProperties: string[];
}

const defaults: RuleOptions = {
	include: null,
	exclude: null,
	allowedProperties: ["display"],
};

function getCSSDeclarations(value: string): CSSDeclaration[] {
	return value
		.split(";")
		.filter(Boolean)
		.map(
			(it): CSSDeclaration => {
				const [property, value] = it.split(":", 2);
				return { property: property.trim(), value: value.trim() };
			}
		);
}

export default class NoInlineStyle extends Rule<void, RuleOptions> {
	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
	}

	public static schema(): SchemaObject {
		return {
			exclude: {
				anyOf: [
					{
						items: {
							type: "string",
						},
						type: "array",
					},
					{
						type: "null",
					},
				],
			},
			include: {
				anyOf: [
					{
						items: {
							type: "string",
						},
						type: "array",
					},
					{
						type: "null",
					},
				],
			},
			allowedProperties: {
				items: {
					type: "string",
				},
				type: "array",
			},
		};
	}

	public documentation(): RuleDocumentation {
		const text = [
			"Inline style is not allowed.\n",
			"Inline style is a sign of unstructured CSS. Use class or ID with a separate stylesheet.\n",
		];
		if (this.options.allowedProperties.length > 0) {
			text.push("Under the current configuration the following CSS properties are allowed:\n");
			text.push(this.options.allowedProperties.map((it) => `- \`${it}\``).join("\n"));
		}
		return {
			description: text.join("\n"),
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on(
			"attr",
			(event: AttributeEvent) => this.isRelevant(event),
			(event: AttributeEvent) => {
				const { value } = event;

				if (this.allPropertiesAllowed(value)) {
					return;
				}

				this.report(event.target, "Inline style is not allowed");
			}
		);
	}

	private isRelevant(event: AttributeEvent): boolean {
		if (event.key !== "style") {
			return false;
		}

		const { include, exclude } = this.options;
		const key = event.originalAttribute || event.key;

		/* ignore attributes not present in "include" */
		if (include && !include.includes(key)) {
			return false;
		}

		/* ignore attributes present in "exclude" */
		if (exclude && exclude.includes(key)) {
			return false;
		}

		return true;
	}

	private allPropertiesAllowed(value: string | DynamicValue | null): boolean {
		if (typeof value !== "string") {
			return false;
		}

		const allowProperties = this.options.allowedProperties;

		/* quick path: no properties are allowed, no need to check each one individually */
		if (allowProperties.length === 0) {
			return false;
		}

		const declarations = getCSSDeclarations(value);
		return (
			declarations.length > 0 &&
			declarations.every((it) => {
				return allowProperties.includes(it.property);
			})
		);
	}
}
