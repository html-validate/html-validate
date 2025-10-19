import { type Attribute, type HtmlElement } from "../dom";
import { type ElementReadyEvent } from "../event";
import { type MetaAttribute } from "../meta";
import { type RuleDocumentation, Rule, ruleDocumentationUrl } from "../rule";

export interface RuleContext {
	tagName: string;
	attr: string;
	details: string;
}

function ruleDescription(context: RuleContext): string {
	const { tagName, attr, details } = context;
	return `The \`${attr}\` attribute cannot be used on \`${tagName}\` in this context: ${details}`;
}

export default class AttributeMisuse extends Rule<RuleContext> {
	public override documentation(context: RuleContext): RuleDocumentation {
		return {
			description: ruleDescription(context),
			url: ruleDocumentationUrl(__filename),
		};
	}

	public setup(): void {
		this.on("element:ready", (event: ElementReadyEvent) => {
			const { target } = event;
			const { meta } = target;
			if (!meta) {
				return;
			}

			for (const attr of target.attributes) {
				const key = attr.key.toLowerCase();
				this.validateAttr(target, attr, meta.attributes[key]);
			}
		});
	}

	private validateAttr(node: HtmlElement, attr: Attribute, meta: MetaAttribute | undefined): void {
		if (!meta?.allowed) {
			return;
		}

		const details = meta.allowed(node._adapter, attr.value);
		if (details) {
			this.report({
				node,
				message: `"{{ attr }}" attribute cannot be used on {{ tagName }} in this context: {{ details }}`,
				location: attr.keyLocation,
				context: {
					tagName: node.annotatedName,
					attr: attr.key,
					details,
				},
			});
		}
	}
}
