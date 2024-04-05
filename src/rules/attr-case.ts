import { type HtmlElement } from "../dom";
import { type AttributeEvent } from "../event";
import { type SchemaObject, type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";
import { type CaseStyleName, CaseStyle } from "./helper/case-style";

interface RuleOptions {
	style: CaseStyleName | CaseStyleName[];
	ignoreForeign: boolean;
}

const defaults: RuleOptions = {
	style: "lowercase",
	ignoreForeign: true,
};

export default class AttrCase extends Rule<void, RuleOptions> {
	private style: CaseStyle;

	public constructor(options: Partial<RuleOptions>) {
		super({ ...defaults, ...options });
		this.style = new CaseStyle(this.options.style, "attr-case");
	}

	public static schema(): SchemaObject {
		const styleEnum = ["lowercase", "uppercase", "pascalcase", "camelcase"];
		return {
			ignoreForeign: {
				type: "boolean",
			},
			style: {
				anyOf: [
					{
						enum: styleEnum,
						type: "string",
					},
					{
						items: {
							enum: styleEnum,
							type: "string",
						},
						type: "array",
					},
				],
			},
		};
	}

	public documentation(): RuleDocumentation {
		const { style } = this.options;
		return {
			description: Array.isArray(style)
				? [`Attribute name must be in one of:`, "", ...style.map((it) => `- ${it}`)].join("\n")
				: `Attribute name must be in ${style}.`,
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("attr", (event: AttributeEvent) => {
			if (this.isIgnored(event.target)) {
				return;
			}

			/* ignore case for dynamic attributes, the original attributes will be
			 * checked instead (this prevents duplicated errors for the same source
			 * attribute) */
			if (event.originalAttribute) {
				return;
			}

			const letters = event.key.replace(/[^a-z]+/gi, "");
			if (this.style.match(letters)) {
				return;
			}

			this.report({
				node: event.target,
				message: `Attribute "${event.key}" should be ${this.style.name}`,
				location: event.keyLocation,
			});
		});
	}

	protected isIgnored(node: HtmlElement): boolean {
		if (this.options.ignoreForeign) {
			return Boolean(node.meta?.foreign);
		} else {
			return false;
		}
	}
}
